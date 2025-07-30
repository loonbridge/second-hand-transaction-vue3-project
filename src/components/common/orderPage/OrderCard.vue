<template>
  <view class="order-card">
    <!-- 订单内容区域 -->
    <view class="order-content">
      <view class="order-info">
        <!-- 商品图片 -->
        <view class="product-image-container">
          <image
            class="product-image"
            :src="order.orderItems[0]?.mainImageUrl || ''"
            mode="aspectFill"
            @click="handleProductClick"
          />
        </view>

        <!-- 商品信息 -->
        <view class="product-info">
          <text class="product-title">{{ order.orderItems[0]?.title || '商品信息' }}</text>
          <text class="product-quantity">共 {{ order.productCount }} 件商品</text>
        </view>
        
        <!-- 价格和状态 -->
        <view class="price-status">
          <text class="total-price">¥{{ order.totalPrice.toFixed(2) }}</text>
          <text class="order-status" :class="getStatusClass(order.status)">{{ getStatusText(order.status) }}</text>
        </view>
      </view>
    </view>
    
    <!-- 操作按钮区域 -->
    <view class="action-buttons">
      <button 
        v-for="action in getOrderActions(order.status)" 
        :key="action.type"
        class="action-button"
        :class="action.primary ? 'primary-button' : 'secondary-button'"
        @click="handleActionClick(action.type)"
      >
        <text class="button-text">{{ action.label }}</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { OrderStatus, OrderSummary } from '@/api/types/orderTypes';

// 定义操作类型
type ActionType = 'cancel' | 'pay' | 'refund' | 'remind' | 'logistics' | 'service';

// 定义操作按钮接口
interface OrderAction {
  type: ActionType;
  label: string;
  primary: boolean;
}

// 定义props
const props = defineProps<{
  order: OrderSummary;
}>();

// 定义事件
const emit = defineEmits<{
  productClick: [orderId: string];
  actionClick: [action: ActionType, orderId: string];
}>();

// 获取订单状态显示文本
const getStatusText = (status: OrderStatus): string => {
  const statusMap: Record<string, string> = {
    'ToPay': '待付款',
    'TO_PAY': '待付款',
    'ToShip': '待发货',
    'TO_SHIP': '待发货',
    'ToReceive': '待收货',
    'TO_RECEIVE': '待收货',
    'Completed': '已完成',
    'COMPLETED': '已完成',
    'Canceled': '已取消',
    'CANCELLED': '已取消'
  };
  return statusMap[status] || status;
};

// 获取订单状态样式类
const getStatusClass = (status: OrderStatus): string => {
  const classMap: Record<string, string> = {
    'ToPay': 'status-to-pay',
    'TO_PAY': 'status-to-pay',
    'ToShip': 'status-to-ship',
    'TO_SHIP': 'status-to-ship',
    'ToReceive': 'status-to-receive',
    'TO_RECEIVE': 'status-to-receive',
    'Completed': 'status-completed',
    'COMPLETED': 'status-completed',
    'Canceled': 'status-canceled',
    'CANCELLED': 'status-canceled'
  };
  return classMap[status] || '';
};

// 根据订单状态获取可用操作
const getOrderActions = (status: OrderStatus): OrderAction[] => {
  const actionsMap: Record<string, OrderAction[]> = {
    'ToPay': [
      { type: 'cancel', label: '取消订单', primary: false },
      { type: 'pay', label: '立即支付', primary: true }
    ],
    'TO_PAY': [
      { type: 'cancel', label: '取消订单', primary: false },
      { type: 'pay', label: '立即支付', primary: true }
    ],
    'ToShip': [
      { type: 'refund', label: '申请退款', primary: false },
      { type: 'remind', label: '提醒发货', primary: false }
    ],
    'TO_SHIP': [
      { type: 'refund', label: '申请退款', primary: false },
      { type: 'remind', label: '提醒发货', primary: false }
    ],
    'ToReceive': [
      { type: 'logistics', label: '查看物流', primary: false },
      { type: 'service', label: '申请售后', primary: false }
    ],
    'TO_RECEIVE': [
      { type: 'logistics', label: '查看物流', primary: false },
      { type: 'service', label: '申请售后', primary: false }
    ],
    'Completed': [
      { type: 'logistics', label: '查看物流', primary: false },
      { type: 'service', label: '申请售后', primary: false }
    ],
    'COMPLETED': [
      { type: 'logistics', label: '查看物流', primary: false },
      { type: 'service', label: '申请售后', primary: false }
    ],
    'Canceled': [],
    'CANCELLED': []
  };
  return actionsMap[status] || [];
};

// 商品点击处理
const handleProductClick = () => {
  emit('productClick', props.order.orderId);
};

// 操作按钮点击处理
const handleActionClick = (actionType: ActionType) => {
  emit('actionClick', actionType, props.order.orderId);
};
</script>

<style lang="scss" scoped>
// CSS变量，与HTML模板保持一致
:root {
  --primary-color: #3b82f6;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --background-color: #f8fafc;
}

.order-card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  margin-bottom: 1rem;
  overflow: hidden;
}

.order-content {
  padding: 1rem;
}

.order-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.product-image-container {
  flex-shrink: 0;
}

.product-image {
  width: 4rem;
  height: 4rem;
  border-radius: 0.5rem;
  background-color: #f3f4f6;
}

.product-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}

.product-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.375;
  margin-bottom: 0.25rem;
  
  // 限制显示两行
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-quantity {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.25;
}

.price-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.total-price {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.order-status {
  font-size: 0.75rem;
  font-weight: 500;
}

// 订单状态样式
.status-to-pay {
  color: var(--text-secondary);
}

.status-to-ship {
  color: #059669;
  font-weight: 500;
}

.status-to-receive {
  color: #0891b2;
  font-weight: 500;
}

.status-completed {
  color: #64748b;
}

.status-canceled {
  color: #dc2626;
}

.action-buttons {
  border-top: 1px solid #f1f5f9;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.action-button {
  display: flex;
  min-width: 5.25rem;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 9999px;
  height: 2.25rem;
  padding: 0 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: 0.025em;
  transition: all 0.2s ease;
  border: none;
}

.primary-button {
  background-color: var(--primary-color);
  color: white;
  
  &:hover {
    background-color: #2563eb;
  }
}

.secondary-button {
  background-color: white;
  color: var(--text-secondary);
  border: 1px solid #e2e8f0;
  
  &:hover {
    background-color: #f8fafc;
  }
}

.button-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
