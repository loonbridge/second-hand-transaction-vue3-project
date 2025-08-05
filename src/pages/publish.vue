<template>
  <view class="publish-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left">
        <BackButton variant="default" @click="goBack" />
      </view>
      <view class="header-title">{{ isEditMode ? '编辑商品' : '发布商品' }}</view>
      <view class="header-right"></view>
    </view>

    <!-- 主要内容 -->
    <view class="main-content">
      <!-- 图片上传区域 -->
      <view class="image-upload-section">
        <text class="section-label">商品图片</text>
        <view class="image-upload-area" @click="chooseImage">
          <view v-if="imageList.length === 0" class="upload-placeholder">
            <svg class="upload-icon" width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            <text class="upload-text">点击上传图片</text>
            <text class="upload-hint">PNG, JPG, GIF up to 10MB</text>
          </view>
          <!-- 已上传图片显示（滑动查看） -->
          <view v-else class="uploaded-images">
            <swiper
                class="image-swiper"
                :indicator-dots="true"
                :autoplay="false"
                :circular="false"
                indicator-color="rgba(255,255,255,0.5)"
                indicator-active-color="#ffffff"
            >
              <swiper-item v-for="(image, index) in imageList" :key="index" class="swiper-item">
                <view class="image-container">
                  <image :src="image" class="swiper-image" mode="aspectFill"></image>
                  <view class="delete-btn" @click.stop="deleteImage(index)">
                    <text class="delete-icon">×</text>
                  </view>
                </view>
              </swiper-item>
            </swiper>
            <view class="image-count">{{ imageList.length }}/9</view>
            <view v-if="imageList.length < 9" class="add-more-btn" @click.stop="chooseImage">
              <text class="add-icon">+</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 表单区域 -->
      <view class="form-section">
        <!-- 商品名称 -->
        <view class="form-item">
          <text class="form-label">商品名称</text>
          <input
              class="form-input"
              v-model="formData.productName"
              placeholder="例如：九成新山地自行车"
              maxlength="100"
          />
        </view>

        <!-- 商品描述 -->
        <view class="form-item">
          <text class="form-label">商品描述</text>
          <textarea
              class="form-textarea"
              v-model="formData.productDescription"
              placeholder="详细描述一下你的宝贝吧..."
              maxlength="1000"
          ></textarea>
        </view>

        <!-- 商品分类 -->
        <view class="form-item">
          <text class="form-label">商品分类</text>
          <view class="category-selector" @click="showCategoryPicker">
            <view class="category-content">
              <text class="category-text" :class="{ 'placeholder': !formData.category }">
                {{ formData.category || '请选择分类' }}
              </text>
              <text v-if="isLoadingCategories" class="loading-text">加载中...</text>
            </view>
            <text class="category-arrow">></text>
          </view>
        </view>

        <!-- 价格和数量 -->
        <view class="form-row">
          <view class="form-item">
            <text class="form-label">价格</text>
            <view class="price-input-wrapper">
              <text class="price-symbol">¥</text>
              <input
                  class="form-input price-input"
                  v-model="formData.price"
                  placeholder="0.00"
                  type="text"
              />
            </view>
          </view>

          <view class="form-item">
            <text class="form-label">数量</text>
            <input
                class="form-input"
                v-model="formData.quantity"
                placeholder="1"
                type="number"
                min="1"
                max="9999"
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 分类选择模态框 -->
    <view v-if="showCategoryModal" class="category-modal-overlay" @click="closeCategoryModal">
      <view class="category-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择商品分类</text>
          <view class="modal-close" @click="closeCategoryModal">×</view>
        </view>
        <view class="modal-content">
          <view v-if="isLoadingCategories" class="loading-container">
            <text class="loading-text">加载分类中...</text>
          </view>
          <view v-else class="category-grid">
            <view
              v-for="category in categories"
              :key="category.categoryId"
              class="category-item"
              :class="{ 'selected': formData.categoryId === category.categoryId }"
              @click="selectCategory(category)"
            >
              <view class="category-icon">
                <!-- 使用API返回的iconUrl，如果没有则显示默认图标 -->
                <image v-if="category.iconUrl" :src="category.iconUrl" class="category-image" mode="aspectFit" />
                <text v-else class="category-emoji">📦</text>
              </view>
              <text class="category-name">{{ category.name }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部发布按钮 -->
    <view class="footer">
      <view
          class="publish-btn"
          @click="publishProduct"
          :class="{
          'loading': isPublishing,
          'disabled': !isFormValid
        }"
      >
        <uni-icons v-if="isPublishing" type="spinner-cycle" size="16" color="#fff" class="loading-icon"></uni-icons>
        <text class="publish-btn-text">{{ isPublishing ? '发布中...' : '确认发布' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getChosenImagePaths } from '@/api/filesApi';
import { createProductWithUrls, getCategories } from '@/api/productsApi';
import type { Category, CreateProductPayload } from '@/api/types/productTypes';
import { computed, onMounted, ref } from 'vue';
import config from '@/config';
import BackButton from '@/components/common/BackButton.vue';

// 响应式数据
const imageList = ref<string[]>([]);
const isPublishing = ref<boolean>(false);
const categories = ref<Category[]>([]);
const isLoadingCategories = ref<boolean>(false);
const isEditMode = ref<boolean>(false);
const editProductId = ref<string>('');
const showCategoryModal = ref<boolean>(false);

// 表单数据
const formData = ref({
  productName: '',
  productDescription: '',
  price: '',
  quantity: '1',
  category: '', // 默认为空，等待用户选择
  categoryId: '' // 默认为空，等待用户选择
});

// 移除不需要的选项和计算属性，简化表单

// 计算属性：表单验证
const isFormValid = computed(() => {
  return formData.value.productName.trim() !== '' &&
      formData.value.productDescription.trim() !== '' &&
      formData.value.price.trim() !== '' &&
      parseFloat(formData.value.price) > 0 &&
      parseInt(formData.value.quantity) > 0 &&
      formData.value.category.trim() !== '' &&
      formData.value.categoryId.trim() !== '' &&
      imageList.value.length > 0;
});

// 返回上一页
const goBack = () => {
  if (hasUnsavedChanges()) {
    uni.showModal({
      title: '提示',
      content: '您有未保存的内容，确定要离开吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            const pages = getCurrentPages();
            if (pages.length > 1) {
          uni.navigateBack();
            } else {
              // 如果当前页面是第一个页面，无法返回，则跳转到首页
              uni.switchTab({ url: '/pages/home' });
            }
          } catch (e) {
            console.error('导航错误:', e);
            // 发生错误时默认跳转到首页
            uni.switchTab({ url: '/pages/home' });
          }
        }
      }
    });
  } else {
    try {
      const pages = getCurrentPages();
      if (pages.length > 1) {
    uni.navigateBack();
      } else {
        // 如果当前页面是第一个页面，无法返回，则跳转到首页
        uni.switchTab({ url: '/pages/home' });
      }
    } catch (e) {
      console.error('导航错误:', e);
      // 发生错误时默认跳转到首页
      uni.switchTab({ url: '/pages/home' });
    }
  }
};

// 检查是否有未保存的更改
const hasUnsavedChanges = () => {
  return formData.value.productName.trim() !== '' ||
      formData.value.productDescription.trim() !== '' ||
      formData.value.price.trim() !== '' ||
      imageList.value.length > 0;
};

// 显示帮助
const showHelp = () => {
  uni.showModal({
    title: '发布帮助',
    content: '1. 上传清晰的商品图片\n2. 详细描述商品信息\n3. 合理定价\n4. 选择合适的交易方式',
    showCancel: false
  });
};

// 选择图片（只预览，不上传）
const chooseImage = async () => {
  try {
    const maxCount = 9 - imageList.value.length;
    if (maxCount <= 0) {
      uni.showToast({
        title: '最多只能选择9张图片',
        icon: 'none'
      });
      return;
    }

    const imagePaths = await getChosenImagePaths(maxCount);
    if (imagePaths.length > 0) {
      // 直接添加本地文件路径到列表，用于预览
      imageList.value.push(...imagePaths);

      uni.showToast({
        title: `已选择${imagePaths.length}张图片`,
        icon: 'success',
        duration: 1500
      });

      console.log('已选择图片:', imagePaths);
    }
  } catch (error) {
    console.error('选择图片失败:', error);
    // 只有在非取消操作时才显示错误提示
    const uniError = error as { errMsg?: string };
    if (uniError && uniError.errMsg && !uniError.errMsg.includes('cancel')) {
      uni.showToast({
        title: '选择图片失败',
        icon: 'error'
      });
    }
  }
};

// 删除图片
const deleteImage = (index: number) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这张图片吗？',
    success: (res) => {
      if (res.confirm) {
        imageList.value.splice(index, 1);
        uni.showToast({
          title: '图片已删除',
          icon: 'success',
          duration: 1500
        });
      }
    }
  });
};

// 加载分类数据
const loadCategories = async () => {
  if (categories.value.length > 0) return; // 避免重复加载

  isLoadingCategories.value = true;
  try {
    const categoryList = await getCategories();
    categories.value = categoryList;
  } catch (error) {
    console.error('加载分类失败:', error);

    // 使用类型断言处理错误对象
    const err = error as { message?: string };
    // 检查是否是网络连接问题
    if (err && err.message && err.message.includes('网络请求失败')) {
      uni.showToast({
        title: '网络连接失败，请检查后端服务',
        icon: 'none',
        duration: 3000
      });
    }

    // 如果API失败，使用默认分类（根据swagger文档，categoryId为string类型）
    // 默认分类不提供iconUrl，将使用默认图标
    categories.value = [
      { categoryId: 'cat_digital', name: '数码产品', iconUrl: '' },
      { categoryId: 'cat_fashion', name: '服装配饰', iconUrl: '' },
      { categoryId: 'cat_home', name: '家居用品', iconUrl: '' },
      { categoryId: 'cat_books', name: '图书音像', iconUrl: '' },
      { categoryId: 'cat_sports', name: '运动户外', iconUrl: '' },
      { categoryId: 'cat_beauty', name: '美妆护肤', iconUrl: '' },
      { categoryId: 'cat_baby', name: '母婴用品', iconUrl: '' },
      { categoryId: 'cat_other', name: '其他', iconUrl: '' }
    ];
  } finally {
    isLoadingCategories.value = false;
  }
};

// 显示分类选择器
const showCategoryPicker = async () => {
  console.log('点击分类选择器');

  // 如果正在加载，显示提示
  if (isLoadingCategories.value) {
    uni.showToast({
      title: '分类加载中，请稍候...',
      icon: 'loading',
      duration: 1500
    });
    return;
  }

  // 确保分类数据已加载
  if (categories.value.length === 0) {
    console.log('分类数据为空，开始加载...');
    try {
      await loadCategories();
    } catch (error) {
      console.error('加载分类失败:', error);
      uni.showToast({
        title: '加载分类失败，请重试',
        icon: 'none',
        duration: 2000
      });
      return;
    }
  }

  // 检查是否有分类数据
  if (categories.value.length === 0) {
    console.log('仍然没有分类数据');
    uni.showToast({
      title: '暂无分类数据',
      icon: 'none'
    });
    return;
  }

  console.log('显示分类模态框，分类数量:', categories.value.length);
  // 显示分类选择模态框
  showCategoryModal.value = true;
};

// 关闭分类选择模态框
const closeCategoryModal = () => {
  showCategoryModal.value = false;
};

// 选择分类
const selectCategory = (category: Category) => {
  console.log('点击选择分类:', category);

  formData.value.category = category.name;
  formData.value.categoryId = category.categoryId;

  console.log('选择分类:', category.name, '分类ID:', category.categoryId);
  console.log('更新后的表单数据:', formData.value);

  // 关闭模态框
  showCategoryModal.value = false;
  console.log('关闭模态框');

  // 显示选择成功提示
  uni.showToast({
    title: `已选择：${category.name}`,
    icon: 'success',
    duration: 1500
  });
};



// 移除新旧程度选择函数，因为已简化表单结构

// 移除交易方式切换函数，因为已简化表单结构

// 增加数量
const increaseQuantity = () => {
  const quantity = parseInt(formData.value.quantity);
  if (quantity < 999) {
    formData.value.quantity = (quantity + 1).toString();
  }
};

// 减少数量
const decreaseQuantity = () => {
  const quantity = parseInt(formData.value.quantity);
  if (quantity > 1) {
    formData.value.quantity = (quantity - 1).toString();
  }
};

// 详细表单验证函数
const validateFormDetailed = (): { isValid: boolean; message: string } => {
  // 商品名称验证
  if (!formData.value.productName.trim()) {
    return { isValid: false, message: '请输入商品名称' };
  }
  if (formData.value.productName.trim().length < 2) {
    return { isValid: false, message: '商品名称至少2个字符' };
  }
  if (formData.value.productName.trim().length > 100) {
    return { isValid: false, message: '商品名称不能超过100个字符' };
  }

  // 商品描述验证
  if (!formData.value.productDescription.trim()) {
    return { isValid: false, message: '请输入商品描述' };
  }
  if (formData.value.productDescription.trim().length < 10) {
    return { isValid: false, message: '商品描述至少10个字符' };
  }
  if (formData.value.productDescription.trim().length > 1000) {
    return { isValid: false, message: '商品描述不能超过1000个字符' };
  }

  // 价格验证
  if (!formData.value.price) {
    return { isValid: false, message: '请输入商品价格' };
  }
  const price = parseFloat(formData.value.price);
  if (isNaN(price) || price <= 0) {
    return { isValid: false, message: '请输入有效的价格' };
  }
  if (price > 999999) {
    return { isValid: false, message: '价格不能超过999999元' };
  }

  // 数量验证
  if (!formData.value.quantity) {
    return { isValid: false, message: '请输入商品数量' };
  }
  const quantity = parseInt(formData.value.quantity);
  if (isNaN(quantity) || quantity <= 0) {
    return { isValid: false, message: '请输入有效的数量' };
  }
  if (quantity > 9999) {
    return { isValid: false, message: '数量不能超过9999' };
  }

  // 分类验证
  if (!formData.value.category || !formData.value.categoryId) {
    return { isValid: false, message: '请选择商品分类' };
  }

  // 图片验证
  if (!imageList.value || imageList.value.length === 0) {
    return { isValid: false, message: '请至少上传一张商品图片' };
  }
  if (imageList.value.length > 9) {
    return { isValid: false, message: '最多只能上传9张图片' };
  }

  // 移除交易方式和联系方式验证，因为已简化表单结构
  // 只保留基本的商品信息验证

  return { isValid: true, message: '' };
};

// 发布商品
const publishProduct = async () => {
  // 如果正在发布中，直接返回
  if (isPublishing.value) {
    return;
  }

  // 详细表单验证
  const validation = validateFormDetailed();
  if (!validation.isValid) {
    uni.showToast({
      title: validation.message,
      icon: 'none',
      duration: 2500
    });
    return;
  }
  
  // 检查用户是否已登录
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.showToast({
      title: '请先登录后再发布商品',
      icon: 'none',
      duration: 2000
    });
    // 可以在这里添加跳转到登录页的逻辑
    // uni.navigateTo({ url: '/pages/login/login' });
    return;
  }

  isPublishing.value = true;

  try {
    // 检查是否有图片
    if (imageList.value.length === 0) {
      throw new Error('请选择要上传的图片');
    }

    // 过滤出有效的文件路径
    // 小程序的临时文件路径格式：http://tmp/... 或其他本地路径
    const localImageFiles = imageList.value.filter(path => {
      // 保留临时文件路径和本地文件路径，排除已上传到服务器的URL
      return path.startsWith('http://tmp/') ||
             path.startsWith('wxfile://') ||
             (!path.startsWith('http://') && !path.startsWith('https://'));
    });

    if (localImageFiles.length === 0) {
      throw new Error('没有有效的本地图片文件');
    }

    console.log(`准备上传${localImageFiles.length}张图片文件`);
    console.log('所有图片路径:', imageList.value);
    console.log('过滤后的本地文件:', localImageFiles);

    // 使用新的多文件上传API
    uni.showToast({
      title: `正在上传 0/${localImageFiles.length} 张图片...`,
      icon: 'loading',
      duration: 0 // 持续显示
    });

    // 创建一个带进度显示的上传函数
    const uploadWithProgress = async (filePaths: string[]) => {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < filePaths.length; i++) {
        // 更新进度提示
        uni.showToast({
          title: `正在上传 ${i + 1}/${filePaths.length} 张图片...`,
          icon: 'loading',
          duration: 1000
        });

        try {
          // 调用单个文件上传
          const result = await new Promise<{url: string}>((resolve, reject) => {
            const token = uni.getStorageSync('token');
            uni.uploadFile({
              url: `${config.baseURL}/files/upload`,
              fileType: "image",
              filePath: filePaths[i],
              name: 'files',
              header: {
                'Authorization': `Bearer ${token}`
              },
              success: (response) => {
                if (response.statusCode === 200) {
                  try {
                    const data = JSON.parse(response.data);
                    if (data.urls && Array.isArray(data.urls)) {
                      resolve({ url: data.urls[0] });
                    } else if (data.url) {
                      resolve({ url: data.url });
                    } else {
                      reject(new Error('服务器响应格式错误'));
                    }
                  } catch (e) {
                    reject(new Error('解析响应失败'));
                  }
                } else {
                  reject(new Error(`上传失败: ${response.statusCode}`));
                }
              },
              fail: (error) => {
                reject(new Error(`上传失败: ${error.errMsg}`));
              }
            });
          });

          uploadedUrls.push(result.url);
          console.log(`第${i + 1}张图片上传成功:`, result.url);

        } catch (error) {
          console.error(`第${i + 1}张图片上传失败:`, error);
          throw new Error(`第${i + 1}张图片上传失败，请重试`);
        }
      }

      return { urls: uploadedUrls };
    };

    const uploadResult = await uploadWithProgress(localImageFiles);
    console.log('所有图片上传完成:', uploadResult.urls);

    // 构建商品数据，包含所有图片URL
    const productData: CreateProductPayload = {
      title: formData.value.productName,
      description: formData.value.productDescription,
      price: parseFloat(formData.value.price),
      stock: parseInt(formData.value.quantity),
      categoryId: formData.value.categoryId, // 已经是string类型，无需转换
      imageUrls: uploadResult.urls // 使用所有上传的图片URL
    };

    console.log('发布商品数据:', productData);

    // 使用JSON API创建商品
    const result = await createProductWithUrls(productData);
    console.log('发布成功:', result);

    uni.showToast({
      title: '发布成功！',
      icon: 'success',
      duration: 2000
    });

    // 清除草稿
    clearDraft();

    // 重置表单数据
    resetForm();

    // 发布成功后跳转到商品详情页面
    setTimeout(() => {
      try {
        if (result && result.productId) {
          // 跳转到新发布商品的详情页面
          uni.redirectTo({
            url: `/pages/product?id=${result.productId}`
          });
        } else {
          // 如果没有商品ID，则返回上一页或首页
          const pages = getCurrentPages();
          if (pages.length > 1) {
            uni.navigateBack();
          } else {
            uni.switchTab({ url: '/pages/home' });
          }
        }
      } catch (e) {
        console.error('导航错误:', e);
        // 出错时默认跳转到首页
        uni.switchTab({ url: '/pages/home' });
      }
    }, 2000);

  } catch (error) {
    console.error('发布失败详情:', error);

    let errorMessage = '发布失败，请重试';
    
    // 使用类型断言和类型保护安全地处理错误
    if (error instanceof Error) {
      // 标准Error对象
      errorMessage = error.message;
      
      if (errorMessage.includes('网络')) {
        errorMessage = '网络连接失败，请检查网络';
      } else if (errorMessage.includes('HTTP')) {
        errorMessage = `服务器错误: ${errorMessage}`;
      } else if (errorMessage.includes('401') || errorMessage.includes('未授权') || errorMessage.includes('未登录')) {
        errorMessage = '请先登录后再发布商品';
        // 可以在这里添加跳转到登录页的逻辑
      }
      } else {
      // 处理非标准错误对象
      const unknownError = error as any;
      if (unknownError && typeof unknownError === 'object' && 'message' in unknownError) {
        errorMessage = String(unknownError.message);
      }
    }

    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000
    });
  } finally {
    isPublishing.value = false;
  }
};

// 重置表单数据
const resetForm = () => {
  formData.value = {
    productName: '',
    productDescription: '',
    price: '',
    quantity: '1',
    category: '', // 重置为空，等待用户选择
    categoryId: '' // 重置为空，等待用户选择
  };
  imageList.value = [];
};

// 保存草稿
const saveDraft = () => {
  try {
    const draftData = {
      ...formData.value,
      imageList: imageList.value,
      timestamp: Date.now()
    };
    uni.setStorageSync('publish_draft', draftData);
    uni.showToast({
      title: '草稿已保存',
      icon: 'success',
      duration: 1500
    });
  } catch (error) {
    console.error('保存草稿失败:', error);
    uni.showToast({
      title: '保存草稿失败',
      icon: 'none'
    });
  }
};

// 加载草稿
const loadDraft = () => {
  try {
    const draftData = uni.getStorageSync('publish_draft');
    if (draftData && draftData.timestamp) {
      // 检查草稿是否过期（7天）
      const isExpired = Date.now() - draftData.timestamp > 7 * 24 * 60 * 60 * 1000;
      if (!isExpired) {
        uni.showModal({
          title: '发现草稿',
          content: '检测到未完成的发布内容，是否恢复？',
          success: (res) => {
            if (res.confirm) {
              formData.value = {
                productName: draftData.productName || '',
                productDescription: draftData.productDescription || '',
                price: draftData.price || '',
                quantity: draftData.quantity || '1',
                category: draftData.category || '',
                categoryId: draftData.categoryId || ''
              };
              imageList.value = draftData.imageList || [];
              uni.showToast({
                title: '草稿已恢复',
                icon: 'success'
              });
            }
          }
        });
      } else {
        // 清除过期草稿
        uni.removeStorageSync('publish_draft');
      }
    }
  } catch (error) {
    console.error('加载草稿失败:', error);
  }
};

// 清除草稿
const clearDraft = () => {
  try {
    uni.removeStorageSync('publish_draft');
  } catch (error) {
    console.error('清除草稿失败:', error);
  }
};

// 检查图片URL是否包含可疑的未来日期
const checkImageUrlDate = (url: string): boolean => {
  if (!url || typeof url !== 'string') return true;
  
  // 查找URL中的日期格式 YYYY/MM/DD
  const dateRegex = /\/(\d{4})\/(\d{2})\/(\d{2})\//;
  const match = url.match(dateRegex);
  
  if (!match) return true; // 没有找到日期格式，认为没问题
  
  const year = parseInt(match[1]);
  const month = parseInt(match[2]);
  const day = parseInt(match[3]);
  
  // 获取当前日期
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // 检查日期是否在未来
  if (year > currentYear + 1) { // 允许最多一年的误差
    console.warn(`检测到可能的未来日期在图片URL中: ${year}/${month}/${day}，当前年份: ${currentYear}`);
    return false;
  }
  
  return true;
}

// 检查编辑模式
const checkEditMode = () => {
  try {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = (currentPage as any).options || {};

    if (options.mode === 'edit' && options.id) {
      isEditMode.value = true;
      editProductId.value = options.id;
      loadProductForEdit(options.id);
    }
  } catch (error) {
    console.error('检查编辑模式失败:', error);
  }
};

// 加载商品数据用于编辑
const loadProductForEdit = async (productId: string) => {
  try {
    // 这里需要调用获取商品详情的API
    // 暂时使用模拟数据，实际应该调用 getProductById
    console.log('加载商品数据用于编辑:', productId);

    // TODO: 实现加载商品数据的逻辑
    uni.showToast({
      title: '编辑模式开发中',
      icon: 'none'
    });
  } catch (error) {
    console.error('加载商品数据失败:', error);
    uni.showToast({
      title: '加载商品数据失败',
      icon: 'none'
    });
  }
};

// 页面初始化
onMounted(() => {
  // 检查是否为编辑模式
  checkEditMode();

  // 预加载分类数据
  loadCategories();

  // 如果不是编辑模式，加载草稿数据
  if (!isEditMode.value) {
    loadDraft();
  }
  
  // 检查并恢复已上传的图片
  try {
    const uploadedImages: string[] = uni.getStorageSync('uploaded_images') || [];
    if (uploadedImages.length > 0) {
      console.log('找到之前上传的图片:', uploadedImages);
      
      // 检查草稿中是否已有图片，如果没有则考虑恢复之前的上传
      if (imageList.value.length === 0 && !formData.value.productName) {
        // 只在用户没有开始新的编辑时恢复
        uni.showModal({
          title: '恢复图片',
          content: '是否恢复之前上传的图片？',
          success: (res) => {
            if (res.confirm) {
              // 只添加最近的5张图片
              const recentImages: string[] = uploadedImages.slice(-5);
              
              // 检查图片URL中是否有异常日期
              const validImages: string[] = recentImages.filter((url: string) => checkImageUrlDate(url));
              
              if (validImages.length > 0) {
                imageList.value = validImages;
                console.log('已恢复之前上传的图片:', validImages);
              } else {
                console.warn('之前上传的图片URL可能有问题，未恢复');
              }
            }
          }
        });
      }
    }
  } catch (e) {
    console.error('恢复上传图片失败:', e);
  }
});
</script>

<style scoped>
/* CSS变量定义 - 与HTML版本完全一致 */
:root {
  --primary-color: #3b82f6;
  --background-color: #f8fafc;
  --input-background: #ffffff;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

/* 页面容器 */
.publish-page {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 100vh;
  flex-direction: column;
  justify-content: space-between;
  overflow-x: hidden;
  background-color: var(--background-color);
  font-family: Inter, "Noto Sans", sans-serif;
}

/* 顶部导航栏 */
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--background-color);
  padding: 12px 16px;
}

.header-back-btn,
.header-help-btn {
  display: flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 18px;
  transition: all 0.3s ease;
}

.header-back-btn:active,
.header-help-btn:active {
  background: rgba(59, 130, 246, 0.1);
  transform: scale(0.95);
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 16px;
}

/* 图片上传区域 */
.image-upload-section {
  margin-bottom: 24px;
}

.section-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.image-upload-area {
  position: relative;
  display: flex;
  aspect-ratio: 16/9;
  width: 100%;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 2px dashed var(--border-color);
  background: var(--input-background);
  transition: border-color 0.2s;
}

.image-upload-area:hover {
  border-color: var(--primary-color);
}

.upload-placeholder {
  text-align: center;
}

.upload-icon {
  margin: 0 auto 8px;
}

.upload-text {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  color: var(--text-secondary);
}

.upload-hint {
  font-size: 12px;
  color: #9ca3af;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  padding: 8px;
}

.image-item {
  position: relative;
  width: calc(33.333% - 6px);
  aspect-ratio: 1;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  object-fit: cover;
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-more-btn {
  width: calc(33.333% - 6px);
  aspect-ratio: 1;
  border: 1px dashed var(--border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
}

/* 表单区域 */
.form-section {
  background: white;
  border-radius: 12px;
  padding: 22px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-item {
  margin-bottom: 24px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.form-input {
  display: block;
  width: 100%;
  padding: 14px 16px;
  min-height: 48px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-background);
  color: var(--text-primary);
  font-size: 16px;
  box-sizing: border-box;
  line-height: 1.6;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  display: block;
  width: 100%;
  min-height: 140px;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-background);
  color: var(--text-primary);
  font-size: 16px;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.6;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 20px;
}

.price-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.price-symbol {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 16px;
  font-weight: 500;
  z-index: 1;
}

.price-input {
  padding-left: 38px !important;
  font-weight: 500;
}

/* 通用区域样式 */
.upload-section,
.info-section,
.price-section,
.trade-section,
.contact-section {
  background: #fff;
  margin: 12px 16px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.title-count {
  font-size: 14px;
  color: #3b82f6;
  font-weight: 500;
}

/* 图片上传区域 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-delete {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-upload-btn {
  aspect-ratio: 1;
  border: 2px dashed #ddd;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  transition: all 0.3s ease;
}

.image-upload-btn:active {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.upload-btn-text {
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
}

.upload-tips {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tip-text {
  font-size: 12px;
  color: #6b7280;
}

/* 表单输入组 */
.input-group {
  margin-bottom: 20px;
  position: relative;
}

.input-label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.label-text {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.label-required {
  color: #3b82f6;
  margin-left: 4px;
  font-weight: 600;
}

.input-field,
.textarea-field {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  color: #111827;
  background: #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.input-field:focus,
.textarea-field:focus {
  border-color: #3b82f6;
  background: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.textarea-field {
  min-height: 100px;
  resize: vertical;
  line-height: 1.5;
}

.input-counter {
  position: absolute;
  right: 12px;
  bottom: -20px;
  font-size: 12px;
  color: #6b7280;
}

/* 选择器字段 */
.selector-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
  background: #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.selector-field:active {
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.selector-text {
  font-size: 15px;
  color: #111827;
}

.selector-text.placeholder {
  color: #6b7280;
}

/* 新旧程度选项 */
.condition-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.condition-item {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  text-align: center;
  background: #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.condition-item.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.condition-text {
  font-size: 13px;
  font-weight: 500;
}

/* 价格区域 */
.price-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.price-group,
.quantity-group {
  display: flex;
  flex-direction: column;
}

.price-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.price-symbol {
  position: absolute;
  left: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
  z-index: 1;
}

.price-input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px 12px 36px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  background: #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.price-input:focus {
  border-color: #3b82f6;
  background: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.quantity-controls {
  display: flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.quantity-btn {
  width: 36px;
  height: 48px;
  border: none;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.quantity-btn:active {
  background: #e5e7eb;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  flex: 1;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  color: #111827;
  padding: 12px 8px;
}

.price-suggestion {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 8px 12px;
  background: #eff6ff;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

.suggestion-text {
  font-size: 12px;
  color: #3b82f6;
}

/* 交易方式 */
.trade-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.trade-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.trade-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.trade-text {
  font-size: 15px;
  color: #111827;
  font-weight: 500;
}

/* 底部间距 */
.bottom-spacing {
  height: 120px;
}

/* 底部区域 */
.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  background: #fff;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 999;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 确保在小屏幕上也固定在底部 */
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
}

.footer-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
}

.tips-text {
  font-size: 11px;
  color: #6b7280;
}

/* 按钮组样式 */
.button-group {
  display: flex;
  gap: 12px;
  width: 100%;
}

.draft-btn {
  flex: 0 0 auto;
  height: 50px;
  padding: 0 20px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s ease;
}

.draft-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.draft-btn:active {
  transform: translateY(1px);
  background: #f3f4f6;
}

.draft-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.draft-btn-text {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.publish-btn {
  flex: 1;
  height: 50px;
  border: none !important;
  border-radius: 8px;
  background: #3b82f6 !important;
  background-color: #3b82f6 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.publish-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #3b82f6;
  z-index: -1;
}

/* 强制覆盖任何默认样式 */
.publish-btn,
.publish-btn::before,
.publish-btn::after {
  background: #3b82f6 !important;
  background-color: #3b82f6 !important;
}

.publish-btn:hover {
  background: #2563eb !important;
  background-color: #2563eb !important;
}

.publish-btn:active {
  transform: translateY(1px);
  background: #1d4ed8 !important;
  background-color: #1d4ed8 !important;
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
}

.publish-btn.disabled {
  background: #9ca3af !important;
  background-color: #9ca3af !important;
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.6;
}

.publish-btn:disabled {
  background: #9ca3af !important;
  background-color: #9ca3af !important;
  box-shadow: none;
  cursor: not-allowed;
}

.publish-btn.loading {
  background: #3b82f6 !important;
  background-color: #3b82f6 !important;
}

.publish-btn-text {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 375px) {
  .upload-section,
  .info-section,
  .price-section,
  .trade-section,
  .contact-section {
    margin: 8px 12px;
    padding: 16px;
  }

  .price-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .condition-options {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .page-container {
    background: #1f2937;
  }

  .header {
    background: #1f2937;
    border-bottom-color: #374151;
  }

  .scroll-content {
    background: #111827;
  }

  .upload-section,
  .info-section,
  .price-section,
  .trade-section,
  .contact-section {
    background: #1f2937;
    color: #f9fafb;
  }

  .title-text,
  .label-text,
  .selector-text,
  .condition-text,
  .trade-text {
    color: #f9fafb;
  }

  .input-field,
  .textarea-field,
  .selector-field,
  .condition-item,
  .trade-option,
  .price-input,
  .quantity-controls {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .input-field:focus,
  .textarea-field:focus,
  .selector-field:active,
  .price-input:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
  }

  .condition-item.active {
    border-color: #60a5fa;
    background: #1e3a8a;
    color: #60a5fa;
  }

  .trade-option.active {
    border-color: #60a5fa;
    background: #1e3a8a;
  }
}

/* 简洁的底部按钮样式覆盖 */
.footer {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  padding: 10px 16px;
  background: var(--background-color);
  border-top: 1px solid var(--border-color);
  box-sizing: border-box;
  z-index: 100;
}

.publish-btn {
  display: flex !important;
  width: 100% !important;
  max-width: 550px !important;
  height: 44px !important;
  align-items: center !important;
  justify-content: center !important;
  border: none !important;
  border-radius: 8px !important;
  background: var(--primary-color) !important;
  color: white !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
  margin: 0 auto !important;
}

.publish-btn:hover {
  background: #2563eb !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4) !important;
}

.publish-btn:active {
  transform: translateY(0) !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3) !important;
}

.publish-btn.disabled {
  background: #9ca3af !important;
  cursor: not-allowed !important;
  opacity: 0.6 !important;
  box-shadow: none !important;
}

.publish-btn.disabled:hover {
  background: #9ca3af !important;
  transform: none !important;
  box-shadow: none !important;
}

.publish-btn.loading {
  background: var(--primary-color) !important;
  cursor: not-allowed !important;
}

.publish-btn-text {
  font-size: 16px !important;
  font-weight: 700 !important;
  color: white !important;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 重写样式 - 完全按照HTML版本 */
.header-left {
  display: flex !important;
  width: 40px !important;
  height: 40px !important;
  align-items: center !important;
  justify-content: center !important;
  color: var(--text-primary) !important;
  cursor: pointer !important;
}

.header-right {
  width: 40px !important;
  height: 40px !important;
}

.header-title {
  font-size: 18px !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
}

/* 主要内容区域 */
.main-content {
  padding: 16px;
  padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px)); /* 为底部按钮留出更多空间 */
}

/* 图片上传区域 */
.image-upload-section {
  margin-bottom: 24px;
}

.section-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.image-upload-area {
  position: relative;
  display: flex;
  aspect-ratio: 16/9;
  width: 100%;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 2px dashed var(--border-color);
  background: var(--input-background);
  transition: border-color 0.2s;
}

.image-upload-area:hover {
  border-color: var(--primary-color);
}

.upload-placeholder {
  text-align: center;
}

.upload-icon {
  margin: 0 auto 8px;
  color: var(--text-secondary);
}

.upload-text {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  color: var(--text-secondary);
}

.upload-hint {
  font-size: 12px;
  color: #9ca3af;
}

.uploaded-images {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-swiper {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
}

.swiper-item {
  width: 100%;
  height: 100%;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.swiper-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: rgba(255, 0, 0, 0.8);
  transform: scale(1.1);
}

.delete-icon {
  color: white;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
}

.image-count {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.add-more-btn {
  position: absolute;
  bottom: 8px;
  left: 8px;
  width: 32px;
  height: 32px;
  background: rgba(59, 130, 246, 0.9);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.add-more-btn:hover {
  background: rgba(59, 130, 246, 1);
  transform: scale(1.1);
}

.add-icon {
  color: white;
  font-size: 20px;
  font-weight: bold;
  line-height: 1;
}

/* 表单区域 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.form-input {
  display: block;
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-background);
  color: var(--text-primary);
  font-size: 16px;
  box-sizing: border-box;
  line-height: 1.6;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  display: block;
  width: 100%;
  min-height: 120px;
  padding: 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-background);
  color: var(--text-primary);
  font-size: 16px;
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.6;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.price-input-wrapper {
  position: relative;
}

.price-symbol {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 16px;
}

.price-input {
  padding-left: 32px !important;
}

/* 分类选择器 */
.category-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 48px;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-background);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.category-selector:hover {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.category-selector:active {
  transform: scale(0.98);
}

.category-content {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
}

.category-text {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
  font-weight: 500;
}

.category-text.placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.loading-text {
  font-size: 12px;
  color: var(--primary-color);
  font-weight: 400;
}

.category-arrow {
  font-size: 16px;
  color: var(--text-secondary);
  transform: rotate(90deg);
  transition: transform 0.2s;
  font-weight: bold;
}

.category-selector:hover .category-arrow {
  color: var(--primary-color);
  transform: rotate(90deg) scale(1.1);
}

/* 分类选择模态框 */
.category-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.category-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--background-color);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: #f5f5f5;
  color: #666;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e5e5e5;
  color: #333;
}

.modal-content {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.loading-container .loading-text {
  font-size: 16px;
  color: var(--primary-color);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.category-item:hover {
  border-color: var(--primary-color);
  background: rgba(59, 130, 246, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.category-item.selected {
  border-color: var(--primary-color);
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.category-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: rgba(59, 130, 246, 0.1);
  margin-bottom: 8px;
}

.category-emoji {
  font-size: 20px;
}

.category-image {
  width: 20px;
  height: 20px;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.2;
}

.category-item.selected .category-name {
  color: var(--primary-color);
  font-weight: 600;
}

/* 底部发布按钮 */
.footer {
  position: sticky;
  bottom: 0;
  border-top: 1px solid var(--border-color);
  background-color: var(--background-color);
  padding: 16px;
}

.publish-btn {
  display: flex !important;
  width: 100% !important;
  cursor: pointer !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 12px !important;
  background: var(--primary-color) !important;
  height: 48px !important;
  padding: 0 20px !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
  transition: all 0.2s ease !important;
  border: none !important;
}

.publish-btn:hover {
  background: #2563eb !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4) !important;
}

.publish-btn:active {
  transform: translateY(0) !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3) !important;
}

.publish-btn.disabled {
  background: #9ca3af !important;
  cursor: not-allowed !important;
  opacity: 0.6 !important;
  box-shadow: none !important;
}

.publish-btn.disabled:hover {
  background: #9ca3af !important;
  transform: none !important;
  box-shadow: none !important;
}

.publish-btn.loading {
  background: var(--primary-color) !important;
  cursor: not-allowed !important;
}

.publish-btn-text {
  font-size: 16px !important;
  font-weight: 700 !important;
  color: white !important;
}

.loading-icon {
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 设置placeholder文本样式，确保清晰可见 */
.form-input::placeholder, 
.form-textarea::placeholder {
  color: #9ca3af;
  font-size: 15px;
  opacity: 1;
  line-height: 1.4;
}

/* 调整价格输入框的内边距 */
.price-input {
  padding-left: 32px !important;
  font-weight: 500;
}
</style>