<template>
  <PageLayout :title="isEditMode ? '编辑商品' : '发布商品'" @back-click="handleBackClick">
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <button 
        class="save-draft-btn" 
        @click="handleSaveDraft" 
        v-if="!isEditMode"
      >
        <text class="save-draft-text">保存草稿</text>
      </button>
    </template>

    <view class="edit-product-page">
      <!-- 图片上传区域 -->
      <view class="image-upload-section">
        <text class="section-title">商品图片</text>
        <view class="image-upload-container">
          <view 
            v-for="(image, index) in productForm.imageUrls" 
            :key="index" 
            class="image-item"
          >
            <image 
              :src="image" 
              mode="aspectFill" 
              class="uploaded-image"
            />
            <view class="image-delete-btn" @click="removeImage(index)">
              <uni-icons type="clear" color="#ffffff" size="16"></uni-icons>
            </view>
          </view>
          
          <view 
            v-if="productForm.imageUrls.length < 9" 
            class="add-image-btn" 
            @click="chooseImage"
          >
            <uni-icons type="camera" color="#9ca3af" size="32"></uni-icons>
            <text class="add-image-text">添加图片</text>
          </view>
        </view>
        <text class="image-tip">最多可上传9张图片，第一张为封面图</text>
      </view>

      <!-- 基本信息 -->
      <view class="form-section">
        <text class="section-title">基本信息</text>
        
        <!-- 商品标题 -->
        <view class="form-item">
          <text class="form-label">商品标题 *</text>
          <input 
            v-model="productForm.title"
            class="form-input"
            placeholder="请输入商品标题"
            maxlength="100"
          />
        </view>

        <!-- 商品描述 -->
        <view class="form-item">
          <text class="form-label">商品描述 *</text>
          <textarea 
            v-model="productForm.description"
            class="form-textarea"
            placeholder="详细描述商品的特点、使用情况等"
            maxlength="1000"
          />
        </view>

        <!-- 价格 -->
        <view class="form-item">
          <text class="form-label">价格 *</text>
          <view class="price-input-container">
            <text class="price-symbol">¥</text>
            <input 
              v-model="productForm.price"
              class="price-input"
              type="digit"
              placeholder="0.00"
            />
          </view>
        </view>

        <!-- 库存 -->
        <view class="form-item">
          <text class="form-label">库存数量 *</text>
          <input 
            v-model.number="productForm.stock"
            class="form-input"
            type="number"
            placeholder="1"
            min="1"
          />
        </view>

        <!-- 分类选择 -->
        <view class="form-item">
          <text class="form-label">商品分类 *</text>
          <view class="category-selector" @click="showCategoryPicker = true">
            <text class="category-text" :class="{ placeholder: !selectedCategory }">
              {{ selectedCategory?.name || '请选择分类' }}
            </text>
            <uni-icons type="right" color="#9ca3af" size="16"></uni-icons>
          </view>
        </view>

        <!-- 成色选择 -->
        <view class="form-item">
          <text class="form-label">商品成色 *</text>
          <view class="condition-options">
            <view 
              v-for="condition in conditionOptions" 
              :key="condition.value"
              class="condition-option"
              :class="{ active: productForm.condition === condition.value }"
              @click="productForm.condition = condition.value"
            >
              <text class="condition-text">{{ condition.label }}</text>
            </view>
          </view>
        </view>

        <!-- 交易方式 -->
        <view class="form-item">
          <text class="form-label">交易方式 *</text>
          <view class="trade-methods">
            <view 
              v-for="method in tradeMethodOptions" 
              :key="method.value"
              class="trade-method-item"
            >
              <checkbox 
                :value="method.value"
                :checked="productForm.tradeMethods.includes(method.value)"
                @change="handleTradeMethodChange($event, method.value)"
              />
              <text class="trade-method-text">{{ method.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 发布按钮 -->
      <view class="publish-container">
        <button 
          class="publish-btn" 
          :class="{ disabled: !isFormValid || submitting }"
          :disabled="!isFormValid || submitting"
          @click="handleSubmit"
        >
          <uni-icons 
            v-if="submitting" 
            type="spinner-cycle" 
            color="#ffffff" 
            size="18"
          ></uni-icons>
          <text class="publish-text">
            {{ submitting ? '提交中...' : (isEditMode ? '更新商品' : '发布商品') }}
          </text>
        </button>
      </view>
    </view>

    <!-- 分类选择弹窗 -->
    <uni-popup ref="categoryPopup" v-model:show="showCategoryPicker" type="bottom">
      <view class="category-popup">
        <view class="popup-header">
          <text class="popup-title">选择分类</text>
          <button class="popup-close" @click="showCategoryPicker = false">
            <uni-icons type="clear" color="#6b7280" size="20"></uni-icons>
          </button>
        </view>
        <view class="category-list">
          <view 
            v-for="category in categories" 
            :key="category.id"
            class="category-item"
            @click="selectCategory(category)"
          >
            <text class="category-name">{{ category.name }}</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { uploadImage } from '@/api/filesApi';
import { createProductWithUrls, updateProduct, getProductById, getCategories } from '@/api/productsApi';
import { getUserInfo } from '@/utils/auth';
import type { ProductDetail, CreateProductRequest, UpdateProductRequest, Category } from '@/api/types/productTypes';

// 导入组件
import PageLayout from '@/components/layout/PageLayout.vue';

// 页面参数
const isEditMode = ref<boolean>(false);
const editProductId = ref<string>('');
const originalProduct = ref<ProductDetail | null>(null);

// 表单数据
const productForm = ref<CreateProductRequest>({
  title: '',
  description: '',
  price: '',
  stock: 1,
  categoryId: '',
  condition: '',
  imageUrls: [],
  tradeMethods: ['PICKUP'],
  locationId: ''
});

// 其他状态
const submitting = ref(false);
const showCategoryPicker = ref(false);
const categories = ref<Category[]>([]);
const selectedCategory = ref<Category | null>(null);

// 选项数据
const conditionOptions = [
  { value: 'NEW', label: '全新' },
  { value: 'LIKE_NEW', label: '几乎全新' },
  { value: 'GOOD', label: '成色较好' },
  { value: 'FAIR', label: '成色一般' },
  { value: 'POOR', label: '成色较差' }
];

const tradeMethodOptions = [
  { value: 'PICKUP', label: '自提' },
  { value: 'DELIVERY', label: '快递' },
  { value: 'MEET', label: '面交' }
];

// 表单验证
const isFormValid = computed(() => {
  return (
    productForm.value.title.trim() &&
    productForm.value.description.trim() &&
    productForm.value.price &&
    parseFloat(productForm.value.price) > 0 &&
    productForm.value.stock > 0 &&
    productForm.value.categoryId &&
    productForm.value.condition &&
    productForm.value.imageUrls.length > 0 &&
    productForm.value.tradeMethods.length > 0
  );
});

// 页面初始化
onMounted(async () => {
  await loadCategories();
  checkEditMode();
});

// 加载分类数据
const loadCategories = async () => {
  try {
    const response = await getCategories();
    categories.value = response.items || [];
  } catch (error) {
    console.error('加载分类失败:', error);
    uni.showToast({
      title: '加载分类失败',
      icon: 'none'
    });
  }
};

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

// 加载要编辑的商品数据
const loadProductForEdit = async (productId: string) => {
  try {
    const product = await getProductById(productId);
    originalProduct.value = product;

    // 填充表单数据
    productForm.value = {
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock,
      categoryId: product.categoryId,
      condition: product.condition,
      imageUrls: [...product.imageUrls],
      tradeMethods: [...product.tradeMethods],
      locationId: product.locationId || ''
    };

    // 设置选中的分类
    selectedCategory.value = categories.value.find(cat => cat.id === product.categoryId) || null;

    console.log('加载编辑商品数据成功:', product);
  } catch (error: any) {
    console.error('加载商品数据失败:', error);
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none'
    });
    
    // 加载失败时返回上一页
    uni.navigateBack();
  }
};

// 返回按钮处理
const handleBackClick = () => {
  // 检查是否有未保存的更改
  if (hasUnsavedChanges()) {
    uni.showModal({
      title: '确认离开',
      content: '您有未保存的更改，确定要离开吗？',
      success: (res) => {
        if (res.confirm) {
          navigateBack();
        }
      }
    });
  } else {
    navigateBack();
  }
};

// 检查是否有未保存的更改
const hasUnsavedChanges = (): boolean => {
  if (!isEditMode.value) {
    // 新建模式：检查是否有任何输入
    return (
      productForm.value.title.trim() ||
      productForm.value.description.trim() ||
      productForm.value.price ||
      productForm.value.imageUrls.length > 0 ||
      productForm.value.categoryId ||
      productForm.value.condition ||
      productForm.value.locationId
    );
  } else {
    // 编辑模式：检查是否与原始数据不同
    if (!originalProduct.value) return false;
    
    return (
      productForm.value.title !== originalProduct.value.title ||
      productForm.value.description !== originalProduct.value.description ||
      parseFloat(productForm.value.price) !== originalProduct.value.price ||
      productForm.value.stock !== originalProduct.value.stock ||
      productForm.value.categoryId !== originalProduct.value.categoryId ||
      productForm.value.condition !== originalProduct.value.condition ||
      JSON.stringify(productForm.value.imageUrls) !== JSON.stringify(originalProduct.value.imageUrls) ||
      JSON.stringify(productForm.value.tradeMethods) !== JSON.stringify(originalProduct.value.tradeMethods)
    );
  }
};

// 导航返回
const navigateBack = () => {
  try {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      uni.navigateBack();
    } else {
      uni.switchTab({ url: '/pages/home' });
    }
  } catch (error) {
    console.error('导航返回失败:', error);
    uni.switchTab({ url: '/pages/home' });
  }
};

// 选择图片
const chooseImage = () => {
  const remainingCount = 9 - productForm.value.imageUrls.length;

  uni.chooseImage({
    count: remainingCount,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      try {
        uni.showLoading({ title: '上传中...' });

        for (const tempFilePath of res.tempFilePaths) {
          const uploadResult = await uploadImage(tempFilePath);
          productForm.value.imageUrls.push(uploadResult.url);
        }

        uni.hideLoading();
        uni.showToast({
          title: '上传成功',
          icon: 'success'
        });
      } catch (error) {
        uni.hideLoading();
        console.error('图片上传失败:', error);
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        });
      }
    }
  });
};

// 删除图片
const removeImage = (index: number) => {
  productForm.value.imageUrls.splice(index, 1);
};

// 交易方式选择
const handleTradeMethodChange = (e: any, method: string) => {
  const checked = e.detail.value.length > 0;
  if (checked) {
    if (!productForm.value.tradeMethods.includes(method)) {
      productForm.value.tradeMethods.push(method);
    }
  } else {
    const index = productForm.value.tradeMethods.indexOf(method);
    if (index > -1) {
      productForm.value.tradeMethods.splice(index, 1);
    }
  }
};

// 选择分类
const selectCategory = (category: Category) => {
  productForm.value.categoryId = category.id;
  selectedCategory.value = category;
  showCategoryPicker.value = false;
};

// 保存草稿
const handleSaveDraft = () => {
  uni.showToast({
    title: '草稿保存功能开发中',
    icon: 'none'
  });
};

// 提交表单
const handleSubmit = async () => {
  if (!isFormValid.value || submitting.value) return;

  submitting.value = true;

  try {
    if (isEditMode.value) {
      // 编辑模式 - 使用 PUT 方法更新
      const updateData: UpdateProductRequest = {
        title: productForm.value.title,
        description: productForm.value.description,
        price: parseFloat(productForm.value.price),
        stock: productForm.value.stock,
        categoryId: productForm.value.categoryId,
        condition: productForm.value.condition,
        imageUrls: productForm.value.imageUrls,
        tradeMethods: productForm.value.tradeMethods,
        locationId: productForm.value.locationId
      };

      await updateProduct(editProductId.value, updateData);

      uni.showToast({
        title: '更新成功',
        icon: 'success'
      });

      // 更新成功后返回商品详情页
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    } else {
      // 新建模式
      const productData: CreateProductRequest = {
        ...productForm.value,
        price: parseFloat(productForm.value.price)
      };

      const response = await createProductWithUrls(productData);

      uni.showToast({
        title: '发布成功',
        icon: 'success'
      });

      // 发布成功后跳转到商品详情页面
      setTimeout(() => {
        if (response.productId) {
          // 跳转到新发布商品的详情页面
          uni.redirectTo({
            url: `/pages/product?id=${response.productId}`
          });
        } else {
          // 出错时默认跳转到首页
          uni.switchTab({
            url: '/pages/home'
          });
        }
      }, 1500);
    }
  } catch (error: any) {
    console.error('提交失败:', error);
    uni.showToast({
      title: error.message || '提交失败',
      icon: 'none'
    });
  } finally {
    submitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
:root {
  --background-color: #ffffff;
  --surface-color: #f9fafb;
  --border-color: #e5e7eb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --primary-color: #0b80ee;
  --success-color: #10b981;
  --error-color: #ef4444;
}

.edit-product-page {
  padding: 16px;
  background-color: var(--background-color);
  min-height: 100vh;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  display: block;
}

// 图片上传区域
.image-upload-section {
  margin-bottom: 24px;
}

.image-upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-image-btn {
  width: 80px;
  height: 80px;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.add-image-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.image-tip {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
  display: block;
}

// 表单区域
.form-section {
  background-color: var(--surface-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.form-item {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
  display: block;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  background-color: var(--background-color);
}

.form-textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  background-color: var(--background-color);
  resize: vertical;
}

.price-input-container {
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--background-color);
  overflow: hidden;
}

.price-symbol {
  padding: 12px 16px;
  background-color: var(--surface-color);
  color: var(--text-secondary);
  font-size: 16px;
  border-right: 1px solid var(--border-color);
}

.price-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  font-size: 16px;
  background-color: transparent;
}

// 分类选择器
.category-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--background-color);
}

.category-text {
  font-size: 16px;
  color: var(--text-primary);

  &.placeholder {
    color: var(--text-secondary);
  }
}

// 成色选择
.condition-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.condition-option {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background-color: var(--background-color);

  &.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);

    .condition-text {
      color: #ffffff;
    }
  }
}

.condition-text {
  font-size: 14px;
  color: var(--text-primary);
}

// 交易方式
.trade-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trade-method-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trade-method-text {
  font-size: 16px;
  color: var(--text-primary);
}

// 发布按钮
.publish-container {
  padding: 16px 0;
}

.publish-btn {
  width: 100%;
  padding: 16px;
  background-color: var(--primary-color);
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &.disabled {
    background-color: var(--border-color);
    opacity: 0.6;
  }
}

.publish-text {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

// 分类弹窗
.category-popup {
  background-color: var(--background-color);
  border-radius: 16px 16px 0 0;
  max-height: 60vh;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.popup-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.popup-close {
  background: none;
  border: none;
  padding: 4px;
}

.category-list {
  max-height: 400px;
  overflow-y: auto;
}

.category-item {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }
}

.category-name {
  font-size: 16px;
  color: var(--text-primary);
}

// 头部保存草稿按钮
.save-draft-btn {
  background: none;
  border: 1px solid var(--primary-color);
  border-radius: 6px;
  padding: 6px 12px;
}

.save-draft-text {
  font-size: 14px;
  color: var(--primary-color);
}
</style>
