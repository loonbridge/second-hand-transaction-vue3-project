<template>
  <view class="publish-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="header-left" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
          <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
        </svg>
      </view>
      <view class="header-title">发布商品</view>
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
            <text class="category-text" :class="{ 'placeholder': !formData.category }">
              {{ formData.category || '请选择分类' }}
            </text>
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
import { getChosenImagePaths, uploadImage } from '@/api/filesApi';
import { createProduct, getCategories } from '@/api/productsApi';
import type { Category, CreateProductPayload } from '@/api/types/productTypes';
import { computed, onMounted, ref } from 'vue';

// 响应式数据
const imageList = ref<string[]>([]);
const isUploading = ref<boolean>(false);
const isPublishing = ref<boolean>(false);
const categories = ref<Category[]>([]);
const isLoadingCategories = ref<boolean>(false);
const uploadProgress = ref<number>(0);
const uploadingImageIndex = ref<number>(0);

// 表单数据
const formData = ref({
  productName: '',
  productDescription: '',
  price: '',
  quantity: '1',
  category: '其他', // 默认分类名称
  categoryId: 8 // 默认分类ID为8（其他）
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
         formData.value.categoryId > 0 &&
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
          uni.navigateBack();
        }
      }
    });
  } else {
    uni.navigateBack();
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

// 选择图片
const chooseImage = async () => {
  try {
    const maxCount = 9 - imageList.value.length;
    if (maxCount <= 0) {
      uni.showToast({
        title: '最多只能上传9张图片',
        icon: 'none'
      });
      return;
    }

    const imagePaths = await getChosenImagePaths(maxCount);
    if (imagePaths.length > 0) {
      isUploading.value = true;

      // 逐个上传图片到服务器
      for (let i = 0; i < imagePaths.length; i++) {
        try {
          // 先显示本地预览
          imageList.value.push(imagePaths[i]);

          // 显示上传进度
          uni.showToast({
            title: `正在上传第${i + 1}张图片...`,
            icon: 'loading',
            duration: 1000
          });

          // 立即上传到服务器
          const uploadResult = await uploadImage(imagePaths[i]);

          // 替换为服务器URL
          const index = imageList.value.indexOf(imagePaths[i]);
          if (index !== -1) {
            imageList.value[index] = uploadResult.url;
          }
        } catch (error) {
          console.error('上传图片失败:', error);
          // 移除上传失败的图片
          const index = imageList.value.indexOf(imagePaths[i]);
          if (index !== -1) {
            imageList.value.splice(index, 1);
          }

          uni.showToast({
            title: `第${i + 1}张图片上传失败`,
            icon: 'error',
            duration: 2000
          });
        }
      }

      if (imageList.value.length > 0) {
        uni.showToast({
          title: '图片上传完成',
          icon: 'success'
        });
      }
    }
  } catch (error) {
    console.error('选择图片失败:', error);
    // 只有在非取消操作时才显示错误提示
    if (error && error.errMsg && !error.errMsg.includes('cancel')) {
      uni.showToast({
        title: '选择图片失败',
        icon: 'error'
      });
    }
  } finally {
    isUploading.value = false;
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

    // 检查是否是网络连接问题
    if (error && error.message && error.message.includes('网络请求失败')) {
      uni.showToast({
        title: '网络连接失败，请检查后端服务',
        icon: 'none',
        duration: 3000
      });
    }

    // 如果API失败，使用默认分类
    categories.value = [
      { categoryId: 1, name: '数码产品', iconUrl: '' },
      { categoryId: 2, name: '服装配饰', iconUrl: '' },
      { categoryId: 3, name: '家居用品', iconUrl: '' },
      { categoryId: 4, name: '图书音像', iconUrl: '' },
      { categoryId: 5, name: '运动户外', iconUrl: '' },
      { categoryId: 6, name: '美妆护肤', iconUrl: '' },
      { categoryId: 7, name: '母婴用品', iconUrl: '' },
      { categoryId: 8, name: '其他', iconUrl: '' }
    ];
  } finally {
    isLoadingCategories.value = false;
  }
};

// 显示分类选择器
const showCategoryPicker = async () => {
  // 确保分类数据已加载
  if (categories.value.length === 0) {
    await loadCategories();
  }

  if (isLoadingCategories.value) {
    uni.showToast({
      title: '分类加载中...',
      icon: 'none'
    });
    return;
  }

  const categoryNames = categories.value.map(cat => cat.name);

  uni.showActionSheet({
    itemList: categoryNames,
    success: (res) => {
      const selectedCategory = categories.value[res.tapIndex];
      formData.value.category = selectedCategory.name;
      // 存储选中的分类ID，用于提交时使用
      formData.value.categoryId = selectedCategory.categoryId;
    }
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

  isPublishing.value = true;

  try {
    // 先上传所有图片
    const uploadedImageUrls: string[] = [];
    const totalImages = imageList.value.length;

    for (let i = 0; i < imageList.value.length; i++) {
      const imagePath = imageList.value[i];
      uploadingImageIndex.value = i + 1;
      uploadProgress.value = Math.round(((i + 1) / totalImages) * 100);

      try {
        // 检查是否已经是服务器URL（已上传过的图片）
        if (imagePath.startsWith('http')) {
          uploadedImageUrls.push(imagePath);
          continue;
        }

        // 上传新图片
        const uploadResult = await uploadImage(imagePath);
        uploadedImageUrls.push(uploadResult.url);

        // 显示上传进度
        uni.showToast({
          title: `上传图片 ${i + 1}/${totalImages}`,
          icon: 'loading',
          duration: 500
        });
      } catch (uploadError) {
        console.error('图片上传失败:', uploadError);
        throw new Error(`第${i + 1}张图片上传失败`);
      }
    }

    // 构建符合API接口的商品数据
    const productData: CreateProductPayload = {
      title: formData.value.productName,
      description: formData.value.productDescription,
      price: parseFloat(formData.value.price),
      stock: parseInt(formData.value.quantity),
      categoryId: formData.value.categoryId || 8, // 使用选中的分类ID，默认为8（其他）
      imageUrls: uploadedImageUrls
    };

    console.log('发布商品数据:', productData);

    // 调用真实的发布商品API
    const result = await createProduct(productData);
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

    // 发布成功后返回上一页
    setTimeout(() => {
      uni.navigateBack();
    }, 2000);

  } catch (error) {
    console.error('发布失败:', error);

    let errorMessage = '发布失败，请重试';
    if (error instanceof Error) {
      if (error.message.includes('网络')) {
        errorMessage = '网络连接失败，请检查网络';
      } else if (error.message.includes('HTTP')) {
        errorMessage = '服务器错误，请稍后重试';
      } else {
        errorMessage = error.message || errorMessage;
      }
    }

    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000
    });
  } finally {
    isPublishing.value = false;
    uploadProgress.value = 0;
    uploadingImageIndex.value = 0;
  }
};

// 重置表单数据
const resetForm = () => {
  formData.value = {
    productName: '',
    productDescription: '',
    price: '',
    quantity: '1',
    category: '其他', // 默认分类名称
    categoryId: 8 // 默认分类ID为8（其他）
  };
  imageList.value = [];
  uploadProgress.value = 0;
  uploadingImageIndex.value = 0;
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
                category: draftData.category || '其他',
                categoryId: draftData.categoryId || 8
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





// 页面初始化
onMounted(() => {
  // 预加载分类数据
  loadCategories();
  // 加载草稿数据
  loadDraft();
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
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.form-input {
  display: block;
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-background);
  color: var(--text-primary);
  font-size: 16px;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  display: block;
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-background);
  color: var(--text-primary);
  font-size: 16px;
  resize: vertical;
  box-sizing: border-box;
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

.form-item.half {
  margin-bottom: 0;
}

.price-input-container {
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
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 20px 20px;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
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
  padding: 16px;
  background: var(--background-color);
  border-top: 1px solid var(--border-color);
}

.publish-btn {
  display: flex !important;
  width: 100% !important;
  height: 48px !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  border: none !important;
  border-radius: 12px !important;
  background: var(--primary-color) !important;
  color: white !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
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
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.form-input {
  display: block;
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-background);
  color: var(--text-primary);
  font-size: 16px;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  display: block;
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-background);
  color: var(--text-primary);
  font-size: 16px;
  resize: vertical;
  box-sizing: border-box;
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
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-background);
  cursor: pointer;
  transition: border-color 0.2s;
}

.category-selector:hover {
  border-color: var(--primary-color);
}

.category-text {
  flex: 1;
  font-size: 16px;
  color: var(--text-primary);
}

.category-text.placeholder {
  color: var(--text-secondary);
}

.category-arrow {
  font-size: 16px;
  color: var(--text-secondary);
  transform: rotate(90deg);
  transition: transform 0.2s;
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
</style>