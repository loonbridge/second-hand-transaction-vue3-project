<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <button class="header-back-btn" @click="goBack">
        <uni-icons type="left" size="20" color="#333"></uni-icons>
      </button>
      <view class="header-title">发布闲置</view>
      <button class="header-help-btn" @click="showHelp">
        <uni-icons type="help" size="20" color="#666"></uni-icons>
      </button>
    </view>

    <!-- 滚动内容区域 -->
    <scroll-view class="scroll-content" scroll-y="true">
      <!-- 图片上传区域 -->
      <view class="upload-section">
        <view class="section-title">
          <text class="title-text">添加图片</text>
          <text class="title-count">{{ imageList.length }}/9</text>
        </view>
        <view class="image-grid">
          <view
            v-for="(image, index) in imageList"
            :key="index"
            class="image-item"
          >
            <image :src="image" class="uploaded-image" mode="aspectFill"></image>
            <view class="image-delete" @click="deleteImage(index)">
              <uni-icons type="clear" size="16" color="#fff"></uni-icons>
            </view>
          </view>
          <view
            v-if="imageList.length < 9"
            class="image-upload-btn"
            @click="chooseImage"
          >
            <uni-icons type="camera" size="32" color="#999"></uni-icons>
            <text class="upload-btn-text">添加图片</text>
          </view>
        </view>
        <view class="upload-tips">
          <text class="tip-text">• 第一张图片将作为封面</text>
          <text class="tip-text">• 建议上传清晰的实物图片</text>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="info-section">
        <view class="section-title">
          <text class="title-text">基本信息</text>
        </view>

        <!-- 商品标题 -->
        <view class="input-group">
          <view class="input-label">
            <text class="label-text">标题</text>
            <text class="label-required">*</text>
          </view>
          <input
            class="input-field"
            v-model="formData.productName"
            placeholder="一句话描述你的宝贝"
            maxlength="30"
          />
          <view class="input-counter">{{ formData.productName.length }}/30</view>
        </view>

        <!-- 商品描述 -->
        <view class="input-group">
          <view class="input-label">
            <text class="label-text">描述</text>
            <text class="label-required">*</text>
          </view>
          <textarea
            class="textarea-field"
            v-model="formData.productDescription"
            placeholder="详细描述商品的品牌、型号、购买时间、使用情况、转让原因等"
            maxlength="1000"
          ></textarea>
          <view class="input-counter">{{ formData.productDescription.length }}/1000</view>
        </view>

        <!-- 分类选择 -->
        <view class="input-group" @click="showCategoryPicker">
          <view class="input-label">
            <text class="label-text">分类</text>
            <text class="label-required">*</text>
          </view>
          <view class="selector-field">
            <text class="selector-text" :class="{ 'placeholder': !formData.category }">
              {{ formData.category || '请选择商品分类' }}
            </text>
            <uni-icons type="right" size="16" color="#999"></uni-icons>
          </view>
        </view>

        <!-- 新旧程度 -->
        <view class="input-group">
          <view class="input-label">
            <text class="label-text">新旧程度</text>
          </view>
          <view class="condition-options">
            <view
              v-for="condition in conditionOptions"
              :key="condition.value"
              class="condition-item"
              :class="{ 'active': formData.condition === condition.value }"
              @click="selectCondition(condition.value)"
            >
              <text class="condition-text">{{ condition.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 价格信息 -->
      <view class="price-section">
        <view class="section-title">
          <text class="title-text">价格信息</text>
        </view>

        <view class="price-row">
          <view class="price-group">
            <view class="input-label">
              <text class="label-text">售价</text>
              <text class="label-required">*</text>
            </view>
            <view class="price-input-wrapper">
              <text class="price-symbol">¥</text>
              <input
                class="price-input"
                v-model="formData.price"
                placeholder="0"
                type="digit"
              />
            </view>
          </view>

          <view class="quantity-group">
            <view class="input-label">
              <text class="label-text">数量</text>
            </view>
            <view class="quantity-controls">
              <button class="quantity-btn" @click="decreaseQuantity" :disabled="formData.quantity <= 1">
                <uni-icons type="minus" size="14" color="#666"></uni-icons>
              </button>
              <input
                class="quantity-input"
                v-model="formData.quantity"
                type="number"
                min="1"
              />
              <button class="quantity-btn" @click="increaseQuantity">
                <uni-icons type="plus" size="14" color="#666"></uni-icons>
              </button>
            </view>
          </view>
        </view>

        <!-- 价格建议 -->
        <view class="price-suggestion" v-if="priceSuggestion">
          <uni-icons type="info" size="14" color="#ff6b35"></uni-icons>
          <text class="suggestion-text">{{ priceSuggestion }}</text>
        </view>
      </view>

      <!-- 交易方式 -->
      <view class="trade-section">
        <view class="section-title">
          <text class="title-text">交易方式</text>
        </view>

        <view class="trade-options">
          <view
            v-for="option in tradeOptions"
            :key="option.value"
            class="trade-option"
            :class="{ 'active': formData.tradeMethod.includes(option.value) }"
            @click="toggleTradeMethod(option.value)"
          >
            <uni-icons
              :type="formData.tradeMethod.includes(option.value) ? 'checkbox-filled' : 'circle'"
              size="20"
              :color="formData.tradeMethod.includes(option.value) ? '#3b82f6' : '#ccc'"
            ></uni-icons>
            <text class="trade-text">{{ option.label }}</text>
          </view>
        </view>
      </view>

      <!-- 联系方式 -->
      <view class="contact-section">
        <view class="section-title">
          <text class="title-text">联系方式</text>
        </view>

        <view class="input-group">
          <view class="input-label">
            <text class="label-text">手机号</text>
          </view>
          <input
            class="input-field"
            v-model="formData.phone"
            placeholder="请输入手机号"
            type="number"
            maxlength="11"
          />
        </view>

        <view class="input-group">
          <view class="input-label">
            <text class="label-text">微信号</text>
          </view>
          <input
            class="input-field"
            v-model="formData.wechat"
            placeholder="请输入微信号（可选）"
            maxlength="20"
          />
        </view>
      </view>

      <!-- 底部间距 -->
      <view class="bottom-spacing"></view>
    </scroll-view>

    <!-- 底部发布按钮 -->
    <view class="footer">
      <view class="footer-tips">
        <uni-icons type="info" size="12" color="#999"></uni-icons>
        <text class="tips-text">发布即表示同意《用户协议》和《隐私政策》</text>
      </view>
      <view
        class="publish-btn"
        @click="publishProduct"
        :class="{
          'loading': isPublishing,
          'disabled': !isFormValid
        }"
      >
        <uni-icons v-if="isPublishing" type="spinner-cycle" size="16" color="#fff" class="loading-icon"></uni-icons>
        <text class="publish-btn-text">{{ isPublishing ? '发布中...' : '立即发布' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { getChosenImagePaths, uploadImage } from '@/api/filesApi';

// 响应式数据
const imageList = ref<string[]>([]);
const isUploading = ref<boolean>(false);
const isPublishing = ref<boolean>(false);

// 表单数据
const formData = ref({
  productName: '',
  productDescription: '',
  price: '',
  quantity: '1',
  category: '',
  condition: '9成新',
  tradeMethod: ['面交'],
  phone: '',
  wechat: ''
});

// 新旧程度选项
const conditionOptions = ref([
  { label: '全新', value: '全新' },
  { label: '9成新', value: '9成新' },
  { label: '8成新', value: '8成新' },
  { label: '7成新', value: '7成新' },
  { label: '6成新', value: '6成新' },
  { label: '5成新', value: '5成新' }
]);

// 交易方式选项
const tradeOptions = ref([
  { label: '面交', value: '面交' },
  { label: '邮寄', value: '邮寄' },
  { label: '同城配送', value: '同城配送' }
]);

// 价格建议
const priceSuggestion = computed(() => {
  const price = parseFloat(formData.value.price);
  if (price > 10000) {
    return '价格较高，建议提供更多商品细节图片';
  } else if (price < 10) {
    return '价格较低，可能会吸引更多买家';
  }
  return '';
});

// 计算属性：表单验证
const isFormValid = computed(() => {
  return formData.value.productName.trim() !== '' &&
         formData.value.productDescription.trim() !== '' &&
         formData.value.price.trim() !== '' &&
         formData.value.category !== '' &&
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

      // 显示本地图片预览
      imageList.value.push(...imagePaths);

      // 逐个上传图片到服务器
      for (let i = 0; i < imagePaths.length; i++) {
        try {
          const uploadResult = await uploadImage(imagePaths[i]);
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
        }
      }

      uni.showToast({
        title: '图片上传完成',
        icon: 'success'
      });
    }
  } catch (error) {
    console.error('选择图片失败:', error);
    uni.showToast({
      title: '选择图片失败',
      icon: 'error'
    });
  } finally {
    isUploading.value = false;
  }
};

// 删除图片
const deleteImage = (index: number) => {
  imageList.value.splice(index, 1);
};

// 显示分类选择器
const showCategoryPicker = () => {
  const categories = ['数码产品', '服装配饰', '家居用品', '图书音像', '运动户外', '美妆护肤', '母婴用品', '其他'];

  uni.showActionSheet({
    itemList: categories,
    success: (res) => {
      formData.value.category = categories[res.tapIndex];
    }
  });
};

// 选择新旧程度
const selectCondition = (condition: string) => {
  formData.value.condition = condition;
};

// 切换交易方式
const toggleTradeMethod = (method: string) => {
  const index = formData.value.tradeMethod.indexOf(method);
  if (index > -1) {
    formData.value.tradeMethod.splice(index, 1);
  } else {
    formData.value.tradeMethod.push(method);
  }
};

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

// 发布商品
const publishProduct = async () => {
  // 如果表单无效或正在发布中，直接返回
  if (!isFormValid.value || isPublishing.value) {
    if (!isFormValid.value) {
      uni.showToast({
        title: '请完善必填信息',
        icon: 'none'
      });
    }
    return;
  }

  if (formData.value.tradeMethod.length === 0) {
    uni.showToast({
      title: '请选择交易方式',
      icon: 'none'
    });
    return;
  }

  isPublishing.value = true;

  try {
    // 这里可以调用发布商品的API
    const productData = {
      name: formData.value.productName,
      description: formData.value.productDescription,
      price: parseFloat(formData.value.price),
      quantity: parseInt(formData.value.quantity),
      category: formData.value.category,
      condition: formData.value.condition,
      tradeMethod: formData.value.tradeMethod,
      phone: formData.value.phone,
      wechat: formData.value.wechat,
      images: imageList.value
    };

    console.log('发布商品数据:', productData);

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    uni.showToast({
      title: '发布成功',
      icon: 'success'
    });

    // 发布成功后返回上一页
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);

  } catch (error) {
    console.error('发布失败:', error);
    uni.showToast({
      title: '发布失败，请重试',
      icon: 'error'
    });
  } finally {
    isPublishing.value = false;
  }
};
</script>

<style scoped>
/* 页面容器 */
.page-container {
  background-color: #f8fafc;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
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
  font-weight: 600;
  color: #111827;
  letter-spacing: 0.5px;
}

/* 滚动内容区域 */
.scroll-content {
  flex: 1;
  background: #f8fafc;
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

.publish-btn {
  width: 100%;
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
</style>