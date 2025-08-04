<template>
  <view class="purchase-modal" v-if="visible" @click="handleMaskClick">
    <view class="modal-content" @click.stop>
      <!-- 顶部关闭按钮 -->
      <view class="modal-header">
        <text class="modal-title">确认订单</text>
        <button class="close-btn" @click="handleCancel">
          <uni-icons type="close" size="20" color="#999"></uni-icons>
        </button>
      </view>

      <!-- 商品信息卡片 -->
      <view class="product-card">
        <image
          :src="product.imageUrls?.[0] || product.mainImageUrl || '/static/images/placeholder.png'"
          class="product-image"
          mode="aspectFill"
          @error="handleImageError"
        />
        <view class="product-details">
          <text class="product-title">{{ product.title }}</text>
          <view class="price-stock-row">
            <text class="product-price">¥{{ product.price.toFixed(2) }}</text>
            <text class="stock-info">库存{{ product.stock }}件</text>
          </view>
        </view>
      </view>

      <!-- 数量选择区域 -->
      <view class="quantity-section">
        <view class="section-header">
          <text class="section-label">购买数量</text>
          <view class="quantity-controls">
            <button
              class="quantity-btn decrease"
              :class="{ disabled: quantity <= 1 }"
              @click="decreaseQuantity"
            >
              <uni-icons type="minus" size="14" color="#666"></uni-icons>
            </button>
            <text class="quantity-display">{{ quantity }}</text>
            <button
              class="quantity-btn increase"
              :class="{ disabled: quantity >= product.stock }"
              @click="increaseQuantity"
            >
              <uni-icons type="plus" size="14" color="#666"></uni-icons>
            </button>
          </view>
        </view>
      </view>

      <!-- 收货信息 -->
      <view class="shipping-section">
        <text class="section-label">收货信息</text>

        <!-- 地址选择 -->
        <view class="address-selector" @click="showAddressPicker">
          <view class="address-icon">
            <uni-icons type="location" size="18" color="#ff6b35"></uni-icons>
          </view>
          <view class="address-content">
            <view v-if="selectedAddress" class="selected-address">
              <view class="address-header">
                <text class="address-name">{{ selectedAddress.receiverName }}</text>
                <text class="address-phone">{{ selectedAddress.phoneNumber }}</text>
                <view v-if="selectedAddress.isDefault" class="default-badge">默认</view>
              </view>
              <text class="address-detail">{{ selectedAddress.address }}</text>
            </view>
            <view v-else class="no-address">
              <text class="no-address-text">请选择收货地址</text>
            </view>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>

        <!-- 联系电话 -->
        <view class="phone-input-section">
          <view class="phone-icon">
            <uni-icons type="phone" size="18" color="#ff6b35"></uni-icons>
          </view>
          <view class="phone-input-wrapper">
            <input
              class="phone-input"
              :class="{ error: phoneNumberError }"
              type="number"
              placeholder="请输入联系电话"
              v-model="phoneNumber"
              maxlength="11"
            />
            <text v-if="phoneNumberError" class="error-text">{{ phoneNumberError }}</text>
          </view>
        </view>
      </view>

      <!-- 订单金额 -->
      <view class="order-amount">
        <view class="amount-row">
          <text class="amount-label">商品金额</text>
          <text class="amount-value">¥{{ (product.price * quantity).toFixed(2) }}</text>
        </view>
        <view class="amount-row">
          <text class="amount-label">运费</text>
          <text class="amount-value free">包邮</text>
        </view>
        <view class="total-row">
          <text class="total-label">实付款</text>
          <text class="total-price">¥{{ totalPrice.toFixed(2) }}</text>
        </view>
      </view>

      <!-- 底部操作按钮 -->
      <view class="bottom-actions">
        <button
          class="purchase-btn"
          :class="{ disabled: !canPurchase, loading: loading }"
          @click="handlePurchase"
          :disabled="!canPurchase || loading"
        >
          <text v-if="loading">支付中...</text>
          <text v-else>立即购买</text>
        </button>
      </view>
    </view>

    <!-- 地址选择器 -->
    <view class="address-picker" v-if="showAddressModal" @click="hideAddressPicker">
      <view class="address-picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">选择收货地址</text>
          <button class="close-btn" @click="hideAddressPicker">×</button>
        </view>
        <scroll-view class="address-list" scroll-y>
          <view 
            v-for="address in addresses" 
            :key="address.addressId"
            class="address-item"
            :class="{ selected: selectedAddress?.addressId === address.addressId }"
            @click="selectAddress(address)"
          >
            <view class="address-info">
              <text class="address-name">{{ address.receiverName }}</text>
              <text class="address-phone">{{ address.phoneNumber }}</text>
              <text class="address-detail">{{ address.address }}</text>
            </view>
            <view v-if="address.isDefault" class="default-tag">默认</view>
          </view>
        </scroll-view>
        <button class="add-address-btn" @click="addNewAddress">新增地址</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { ProductDetail } from '@/api/types/productTypes';
import type { Address } from '@/api/types/addressTypes';
import { getMyAddresses } from '@/api/addressApi';
import { createOrder } from '@/api/ordersApi';
import type { WeChatPayParams } from '@/api/types/orderTypes';
import { requestWeChatPayment } from '@/utils/payment';

// Props
const props = defineProps<{
  visible: boolean;
  product: ProductDetail;
}>();

// Events
const emit = defineEmits<{
  close: [];
  success: [orderId: string];
}>();

// 响应式数据
const quantity = ref(1);
const phoneNumber = ref('');
const selectedAddress = ref<Address | null>(null);
const addresses = ref<Address[]>([]);
const showAddressModal = ref(false);
const loading = ref(false);

// 计算属性
const totalPrice = computed(() => {
  return props.product.price * quantity.value;
});

const canPurchase = computed(() => {
  return selectedAddress.value &&
         phoneNumber.value.length === 11 &&
         quantity.value > 0 &&
         quantity.value <= props.product.stock &&
         !loading.value;
});

// 表单验证
const phoneNumberError = computed(() => {
  if (!phoneNumber.value) return '';
  if (phoneNumber.value.length < 11) return '手机号长度不足';
  if (!/^1[3-9]\d{9}$/.test(phoneNumber.value)) return '手机号格式不正确';
  return '';
});

const addressError = computed(() => {
  if (!selectedAddress.value) return '请选择收货地址';
  return '';
});

const quantityError = computed(() => {
  if (quantity.value <= 0) return '购买数量不能为0';
  if (quantity.value > props.product.stock) return '购买数量超过库存';
  return '';
});

const hasErrors = computed(() => {
  return phoneNumberError.value || addressError.value || quantityError.value;
});

// 数量控制
const increaseQuantity = () => {
  if (quantity.value < props.product.stock) {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// 地址相关
const showAddressPicker = () => {
  showAddressModal.value = true;
};

const hideAddressPicker = () => {
  showAddressModal.value = false;
};

const selectAddress = (address: Address) => {
  selectedAddress.value = address;
  // 如果地址有电话号码，自动填入
  if (address.phoneNumber && !phoneNumber.value) {
    phoneNumber.value = address.phoneNumber;
  }
  hideAddressPicker();
};

const addNewAddress = () => {
  // 跳转到添加地址页面
  uni.navigateTo({
    url: '/pages/address_manage'
  });
  hideAddressPicker();
};

// 加载地址列表
const loadAddresses = async () => {
  try {
    addresses.value = await getMyAddresses();
    // 自动选择默认地址
    const defaultAddress = addresses.value.find(addr => addr.isDefault);
    if (defaultAddress) {
      selectedAddress.value = defaultAddress;
      if (defaultAddress.phoneNumber) {
        phoneNumber.value = defaultAddress.phoneNumber;
      }
    }
  } catch (error) {
    console.error('加载地址失败:', error);
    uni.showToast({
      title: '加载地址失败',
      icon: 'none'
    });
  }
};

// 处理购买
const handlePurchase = async () => {
  // 验证表单
  if (hasErrors.value) {
    if (phoneNumberError.value) {
      uni.showToast({
        title: phoneNumberError.value,
        icon: 'none'
      });
      return;
    }
    if (addressError.value) {
      uni.showToast({
        title: addressError.value,
        icon: 'none'
      });
      return;
    }
    if (quantityError.value) {
      uni.showToast({
        title: quantityError.value,
        icon: 'none'
      });
      return;
    }
    return;
  }

  if (!canPurchase.value || loading.value) return;

  loading.value = true;

  try {
    // 显示加载提示
    uni.showLoading({
      title: '正在创建订单...',
      mask: true
    });

    const orderData = {
      productId: props.product.productId,
      quantity: quantity.value,
      addressId: selectedAddress.value!.addressId,
      phoneNumber: phoneNumber.value
    };

    console.log('创建订单数据:', orderData);
    const payParams = await createOrder(orderData);
    console.log('获取支付参数:', payParams);

    // 隐藏加载提示
    uni.hideLoading();

    // 显示支付提示
    uni.showLoading({
      title: '正在调起支付...',
      mask: true
    });

    // 调用微信支付
    await handleWeChatPayment(payParams);

  } catch (error) {
    console.error('购买失败:', error);
    uni.hideLoading();

    let errorMessage = '购买失败，请重试';
    if (error instanceof Error) {
      if (error.message.includes('库存不足')) {
        errorMessage = '商品库存不足';
      } else if (error.message.includes('认证失败')) {
        errorMessage = '登录已过期，请重新登录';
      } else if (error.message.includes('网络')) {
        errorMessage = '网络连接失败，请检查网络';
      } else {
        errorMessage = error.message;
      }
    }

    uni.showModal({
      title: '购买失败',
      content: errorMessage,
      showCancel: false,
      confirmText: '我知道了'
    });
  } finally {
    loading.value = false;
    uni.hideLoading();
  }
};

// 微信支付处理
const handleWeChatPayment = async (payParams: WeChatPayParams): Promise<void> => {
  try {
    await requestWeChatPayment(payParams);

    // 支付成功后的处理
    uni.hideLoading();

    // 显示成功提示
    uni.showToast({
      title: '支付成功',
      icon: 'success',
      duration: 2000
    });

    // 延迟关闭弹窗并触发成功回调
    setTimeout(() => {
      emit('success', payParams.orderId);
      handleCancel();
    }, 1500);

  } catch (error) {
    uni.hideLoading();
    console.error('支付处理失败:', error);

    // 如果是用户取消支付，不需要额外处理
    if (error && typeof error === 'object' && 'errMsg' in error) {
      const errMsg = (error as any).errMsg;
      if (errMsg && (errMsg.includes('cancel') || errMsg.includes('用户取消'))) {
        return; // 用户取消支付，不抛出错误
      }
    }

    // 其他支付错误，重新抛出
    throw error;
  }
};

// 图片加载失败处理
const handleImageError = () => {
  console.log('商品图片加载失败，使用默认图片');
};

// 处理取消
const handleCancel = () => {
  emit('close');
};

// 处理遮罩点击
const handleMaskClick = () => {
  handleCancel();
};

// 重置表单数据
const resetFormData = () => {
  quantity.value = 1;
  phoneNumber.value = '';
  selectedAddress.value = null;
  showAddressModal.value = false;
  loading.value = false;
};

// 监听弹窗显示状态
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    // 重置数据
    resetFormData();
    // 加载地址
    loadAddresses();
  }
});

// 监听商品变化，重置表单
watch(() => props.product?.productId, (newProductId, oldProductId) => {
  if (newProductId && newProductId !== oldProductId) {
    resetFormData();
  }
});

onMounted(() => {
  if (props.visible) {
    loadAddresses();
  }
});
</script>

<style lang="scss" scoped>
.purchase-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-content {
  background-color: #ffffff;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
}

// 顶部标题栏
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;

  &:active {
    background-color: #f5f5f5;
  }
}

// 商品信息卡片
.product-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #fafafa;
  margin: 0 20px 20px;
  border-radius: 12px;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  margin-right: 16px;
  background-color: #f0f0f0;
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-stock-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: #ff6b35;
}

.stock-info {
  font-size: 12px;
  color: #999;
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}

// 数量选择
.quantity-section {
  padding: 0 20px 20px;
  border-bottom: 1px solid #f5f5f5;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-label {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  overflow: hidden;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: none;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;

  &.disabled {
    opacity: 0.3;
  }

  &:not(.disabled):active {
    background-color: #f5f5f5;
  }
}

.quantity-display {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  min-width: 40px;
  text-align: center;
  padding: 0 8px;
  background-color: #fafafa;
  height: 32px;
  line-height: 32px;
}

// 收货信息
.shipping-section {
  padding: 20px;
  border-bottom: 1px solid #f5f5f5;
}

.address-selector {
  display: flex;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.address-icon,
.phone-icon {
  margin-right: 12px;
  margin-top: 2px;
}

.address-content {
  flex: 1;
  margin-right: 12px;
}

.selected-address {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.address-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.address-phone {
  font-size: 14px;
  color: #666;
}

.default-badge {
  background-color: #ff6b35;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
}

.address-detail {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.no-address {
  display: flex;
  align-items: center;
  height: 40px;
}

.no-address-text {
  color: #999;
  font-size: 14px;
}

.phone-input-section {
  display: flex;
  align-items: flex-start;
}

.phone-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.phone-input {
  padding: 12px 0;
  border: none;
  font-size: 16px;
  color: #333;
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;

  &::placeholder {
    color: #999;
  }

  &.error {
    border-bottom-color: #ff4757;
  }

  &:focus {
    border-bottom-color: #ff6b35;
  }
}

.error-text {
  font-size: 12px;
  color: #ff4757;
  margin-top: 4px;
  line-height: 1.2;
}

// 订单金额
.order-amount {
  padding: 20px;
  background-color: #fafafa;
  margin: 0 20px 20px;
  border-radius: 12px;
}

.amount-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.amount-label {
  font-size: 14px;
  color: #666;
}

.amount-value {
  font-size: 14px;
  color: #333;

  &.free {
    color: #10b981;
    font-weight: 500;
  }
}

.total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
  margin-top: 8px;
}

.total-label {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.total-price {
  font-size: 20px;
  font-weight: 700;
  color: #ff6b35;
}

// 底部操作按钮
.bottom-actions {
  padding: 20px;
  background-color: #ffffff;
  border-top: 1px solid #f5f5f5;
}

.purchase-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
  }

  &.disabled {
    background: #cccccc;
    color: #999999;
    box-shadow: none;
    transform: none;
  }

  &.loading {
    background: #cccccc;
    color: #999999;
    box-shadow: none;
  }
}

// 地址选择器样式
.address-picker {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease-out;
}

.address-picker-content {
  background-color: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.picker-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.picker-header .close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;

  &:active {
    background-color: #f5f5f5;
  }
}

.address-list {
  flex: 1;
  padding: 0 20px;
  overflow-y: auto;
}

.address-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background-color 0.2s ease;

  &.selected {
    background-color: rgba(255, 107, 53, 0.1);
    border-color: #ff6b35;
  }

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  &:active {
    background-color: #f5f5f5;
  }
}

.address-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.default-tag {
  background-color: #ff6b35;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
}

.add-address-btn {
  margin: 16px 20px 20px;
  height: 48px;
  background-color: #ff6b35;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;

  &:active {
    background-color: #e55a2b;
  }
}

// 响应式设计
@media (max-width: 375px) {
  .modal-content {
    max-height: 90vh;
  }

  .product-card {
    margin: 0 16px 16px;
    padding: 16px;
  }

  .quantity-section,
  .shipping-section {
    padding: 16px;
  }

  .order-amount {
    margin: 0 16px 16px;
    padding: 16px;
  }

  .bottom-actions {
    padding: 16px;
  }
}
</style>
