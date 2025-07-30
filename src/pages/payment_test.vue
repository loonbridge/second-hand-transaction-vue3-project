<template>
  <view class="payment-test-page">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-content">
        <text class="header-title">支付测试</text>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 测试商品信息 -->
      <view class="product-card">
        <view class="product-info">
          <text class="product-title">测试商品</text>
          <text class="product-desc">用于测试支付功能的虚拟商品</text>
          <text class="product-price">¥{{ testProduct.price }}</text>
        </view>
      </view>

      <!-- 订单信息表单 -->
      <view class="form-section">
        <view class="form-title">订单信息</view>
        
        <view class="form-item">
          <text class="form-label">商品ID:</text>
          <input 
            class="form-input" 
            v-model="orderForm.productId" 
            placeholder="请输入商品ID"
            type="number"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">购买数量:</text>
          <view class="quantity-control">
            <button class="quantity-btn" @click="decreaseQuantity">-</button>
            <text class="quantity-text">{{ orderForm.quantity }}</text>
            <button class="quantity-btn" @click="increaseQuantity">+</button>
          </view>
        </view>
        
        <view class="form-item">
          <text class="form-label">收货地址:</text>
          <input 
            class="form-input" 
            v-model="orderForm.address" 
            placeholder="请输入收货地址"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">联系电话:</text>
          <input 
            class="form-input" 
            v-model="orderForm.phone" 
            placeholder="请输入联系电话"
            type="number"
          />
        </view>
      </view>

      <!-- 支付测试按钮 -->
      <view class="payment-section">
        <view class="total-price">
          <text class="total-label">总计:</text>
          <text class="total-amount">¥{{ totalAmount }}</text>
        </view>
        
        <button 
          class="payment-btn" 
          @click="testCreateOrder"
          :disabled="isLoading"
        >
          {{ isLoading ? '处理中...' : '测试创建订单并支付' }}
        </button>
        
        <button 
          class="test-btn" 
          @click="testGetOrders"
          :disabled="isLoading"
        >
          {{ isLoading ? '加载中...' : '测试获取订单列表' }}
        </button>
      </view>

      <!-- 测试结果显示 -->
      <view class="result-section" v-if="testResult">
        <view class="result-title">测试结果:</view>
        <view class="result-content">
          <text class="result-text">{{ testResult }}</text>
        </view>
      </view>

      <!-- 订单列表 -->
      <view class="orders-section" v-if="ordersList.length > 0">
        <view class="orders-title">我的订单:</view>
        <view class="order-item" v-for="order in ordersList" :key="order.orderId">
          <view class="order-info">
            <text class="order-id">订单ID: {{ order.orderId }}</text>
            <text class="order-status">状态: {{ getStatusText(order.status) }}</text>
            <text class="order-amount">金额: ¥{{ order.totalPrice }}</text>
            <text class="order-count">商品数量: {{ order.productCount }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { createOrder, getMyOrder } from '@/api/ordersApi';
import type { CreateOrderPayload, OrderSummary } from '@/api/types/orderTypes';
import { computed, ref } from 'vue';

// 测试商品信息
const testProduct = ref({
  id: '1',
  name: '测试商品',
  price: 0.01
});

// 订单表单数据
const orderForm = ref({
  productId: '1',
  quantity: 1,
  address: '测试地址',
  phone: '13800138000'
});

// 加载状态
const isLoading = ref(false);

// 测试
const testResult = ref('');

// 订单列表
const ordersList = ref<OrderSummary[]>([]);

// 计算总金额
const totalAmount = computed(() => {
  return (testProduct.value.price * orderForm.value.quantity).toFixed(2);
});

// 增加数量
const increaseQuantity = () => {
  orderForm.value.quantity++;
};

// 减少数量
const decreaseQuantity = () => {
  if (orderForm.value.quantity > 1) {
    orderForm.value.quantity--;
  }
};

// 获取订单状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'ToPay': '待支付',
    'ToShip': '待发货',
    'ToReceive': '待收货',
    'Completed': '已完成',
    'Canceled': '已取消'
  };
  return statusMap[status] || status;
};

// 测试创建订单
const testCreateOrder = async () => {
  if (!orderForm.value.productId) {
    uni.showToast({
      title: '请输入商品ID',
      icon: 'none'
    });
    return;
  }

  isLoading.value = true;
  testResult.value = '';

  try {
    // 构建请求数据 - 使用API类型定义
    const requestData: CreateOrderPayload = {
      productId: orderForm.value.productId,
      quantity: orderForm.value.quantity
    };

    console.log('创建订单请求数据:', requestData);

    // 调用现有的API
    const response = await createOrder(requestData);

    console.log('创建订单响应:', response);

    testResult.value = `订单创建成功！\n订单ID: ${response.orderId}\n状态: ${getStatusText(response.status)}\n总价: ¥${response.totalPrice}\n商品数量: ${response.productCount}`;

    // 如果返回的是支付参数，可以调用微信支付
    // 注意：根据API文档，这里应该返回微信支付参数
    // await callWeChatPay(response);

    // 刷新订单列表
    await testGetOrders();

  } catch (error: any) {
    console.error('创建订单错误:', error);
    testResult.value = `请求失败: ${error.message || error.errMsg || '网络错误'}`;
  } finally {
    isLoading.value = false;
  }
};

// 测试获取订单列表
const testGetOrders = async () => {
  isLoading.value = true;
  testResult.value = '';

  try {
    console.log('获取订单列表...');

    // 调用现有的API
    const response = await getMyOrder({});

    console.log('获取订单列表响应:', response);

    ordersList.value = response || [];
    testResult.value = `成功获取 ${ordersList.value.length} 个订单`;

  } catch (error: any) {
    console.error('获取订单错误:', error);
    testResult.value = `请求失败: ${error.message || error.errMsg || '网络错误'}`;
  } finally {
    isLoading.value = false;
  }
};

// 调用微信支付（示例）
const callWeChatPay = async (payParams: any) => {
  try {
    // 注意：这里是微信小程序支付的示例代码
    // 实际使用时需要根据平台调整
    console.log('准备调用微信支付:', payParams);

    // 模拟支付调用
    uni.showModal({
      title: '支付测试',
      content: `模拟支付调用\n支付参数: ${JSON.stringify(payParams, null, 2)}`,
      success: (res) => {
        if (res.confirm) {
          testResult.value += '\n模拟支付成功！';
        } else {
          testResult.value += '\n模拟支付取消';
        }
      }
    });

  } catch (error: any) {
    console.error('支付调用错误:', error);
    testResult.value += `\n支付调用错误: ${error.message || error.errMsg || '未知错误'}`;
  }
};
</script>

<style scoped lang="scss">
.payment-test-page {
  min-height: 100vh;
  background-color: #f9fafb;
}

/* 顶部导航栏 */
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

/* 主要内容区域 */
.main-content {
  padding: 16px;
}

/* 商品卡片 */
.product-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.product-desc {
  font-size: 14px;
  color: #6b7280;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: #ef4444;
}

/* 表单区域 */
.form-section {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.form-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  width: 80px;
  font-size: 14px;
  color: #374151;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: #ffffff;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-text {
  font-size: 16px;
  font-weight: 500;
  min-width: 24px;
  text-align: center;
}

/* 支付区域 */
.payment-section {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.total-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.total-label {
  font-size: 16px;
  color: #374151;
}

.total-amount {
  font-size: 20px;
  font-weight: 700;
  color: #ef4444;
}

.payment-btn, .test-btn {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:disabled {
    opacity: 0.6;
  }
}

.payment-btn {
  background-color: #0b80ee;
  color: #ffffff;
}

.test-btn {
  background-color: #10b981;
  color: #ffffff;
}

/* 结果区域 */
.result-section {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.result-content {
  background-color: #f3f4f6;
  border-radius: 4px;
  padding: 12px;
}

.result-text {
  font-size: 14px;
  color: #374151;
  white-space: pre-wrap;
}

/* 订单列表 */
.orders-section {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.orders-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.order-item {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-id, .order-status, .order-amount, .order-count {
  font-size: 14px;
  color: #374151;
}
</style>
