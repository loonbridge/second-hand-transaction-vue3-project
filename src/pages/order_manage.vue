<template>
  <OrderPageLayout @back-click="handleBackClick">
    <!-- 标签页导航 -->
    <template #tabs>
      <OrderTabs :active-tab="activeTab" @tab-change="handleTabChange" />
    </template>

    <!-- 主要内容 -->
    <template #content>
      <!-- 加载状态 -->
      <view v-if="isLoading" class="loading-container">
        <uni-icons type="spinner-cycle" size="32" color="#3b82f6"></uni-icons>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 订单列表 -->
      <view v-else-if="filteredOrders.length > 0" class="orders-container">
        <OrderCard
          v-for="order in filteredOrders"
          :key="order.orderId"
          :order="order"
          :highlight="order.orderId === highlightOrderId"
          @product-click="handleProductClick"
          @action-click="handleActionClick"
        />
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-container">
        <uni-icons type="shop" size="64" color="#9ca3af"></uni-icons>
        <text class="empty-title">暂无订单</text>
        <text class="empty-subtitle">{{ getEmptyMessage() }}</text>
      </view>
    </template>
  </OrderPageLayout>

  <!-- 确认对话框 -->
  <ConfirmDialog
    :visible="confirmDialog.visible"
    :title="confirmDialog.title"
    :message="confirmDialog.message"
    :confirm-text="confirmDialog.confirmText"
    :cancel-text="confirmDialog.cancelText"
    :loading="confirmDialog.loading"
    @confirm="handleConfirmAction"
    @cancel="handleCancelDialog"
    @close="handleCancelDialog"
  />
</template>

<script setup lang="ts">
import { cancelOrder, getMyOrder, remindShip, requestRefund } from '@/api/ordersApi';
import type { OrderStatus, OrderSummary } from '@/api/types/orderTypes';
import ConfirmDialog from '@/components/common/orderPage/ConfirmDialog.vue';
import OrderCard from '@/components/common/orderPage/OrderCard.vue';
import OrderTabs from '@/components/common/orderPage/OrderTabs.vue';
import OrderPageLayout from '@/components/layout/OrderPageLayout.vue';
import { computed, onActivated, onMounted, ref } from 'vue';

// 响应式数据
const activeTab = ref<OrderStatus | 'All'>('All');
const orders = ref<OrderSummary[]>([]);
const isLoading = ref(false);
const highlightOrderId = ref<string>(''); // 需要高亮显示的订单ID

// 确认对话框状态
const confirmDialog = ref({
  visible: false,
  title: '',
  message: '',
  confirmText: '确认',
  cancelText: '取消',
  loading: false,
  action: null as { type: string; orderId: string } | null
});

// 计算属性 - 根据当前标签页过滤订单
const filteredOrders = computed(() => {
  console.log('🔍 [OrderManage] 过滤订单:', {
    activeTab: activeTab.value,
    totalOrders: orders.value.length
  });

  if (activeTab.value === 'All') {
    return orders.value;
  }

  // 使用新的状态常量进行过滤
  const filtered = orders.value.filter(order => {
    const orderStatus = order.status;
    console.log('🔍 [OrderManage] 检查订单状态:', {
      orderId: order.orderId,
      orderStatus,
      activeTab: activeTab.value
    });

    return orderStatus === activeTab.value;
  });

  console.log('🔍 [OrderManage] 过滤结果:', {
    activeTab: activeTab.value,
    filteredCount: filtered.length
  });

  return filtered;
});

// 获取空状态提示信息
const getEmptyMessage = (): string => {
  const messages: Record<OrderStatus | 'All', string> = {
    'All': '您还没有任何订单，快去购买商品吧！',
    'TO_PAY': '您没有待付款的订单',
    'TO_SHIP': '您没有待发货的订单',
    'TO_RECEIVE': '您没有待收货的订单',
    'COMPLETED': '您没有已完成的订单',
    'CANCELED': '您没有已取消的订单'
  };
  return messages[activeTab.value] || '暂无相关订单';
};

// 加载订单数据
const loadOrders = async () => {
  try {
    isLoading.value = true;
    // 加载所有订单，在客户端进行过滤
    const result = await getMyOrder({});
    orders.value = result;
  } catch (error) {
    console.error('加载订单失败:', error);
    uni.showToast({
      title: error instanceof Error ? error.message : '加载订单失败',
      icon: 'none',
      duration: 2000
    });
  } finally {
    isLoading.value = false;
  }
};

// 返回按钮点击处理
const handleBackClick = () => {
  uni.navigateBack();
};

// 标签页切换处理
const handleTabChange = (tab: OrderStatus | 'All') => {
  activeTab.value = tab;
};

// 商品点击处理
const handleProductClick = (orderId: string) => {
  // TODO: 跳转到订单详情页
  console.log('点击商品，订单ID:', orderId);
  uni.showToast({
    title: '跳转到订单详情',
    icon: 'none'
  });
};

// 操作按钮点击处理
const handleActionClick = (actionType: string, orderId: string) => {
  switch (actionType) {
    case 'cancel':
      showConfirmDialog('取消订单', '确定要取消这个订单吗？', actionType, orderId);
      break;
    case 'pay':
      handlePayOrder(orderId);
      break;
    case 'refund':
      showConfirmDialog('申请退款', '确定要申请退款吗？', actionType, orderId);
      break;
    case 'remind':
      showConfirmDialog('提醒发货', '确定要提醒卖家发货吗？', actionType, orderId);
      break;
    case 'logistics':
      handleViewLogistics(orderId);
      break;
    case 'service':
      handleAfterSales(orderId);
      break;
    default:
      console.log('未知操作类型:', actionType);
  }
};

// 显示确认对话框
const showConfirmDialog = (title: string, message: string, actionType: string, orderId: string) => {
  confirmDialog.value = {
    visible: true,
    title,
    message,
    confirmText: '确认',
    cancelText: '取消',
    loading: false,
    action: { type: actionType, orderId }
  };
};

// 处理确认操作
const handleConfirmAction = async () => {
  if (!confirmDialog.value.action) return;

  const { type, orderId } = confirmDialog.value.action;
  confirmDialog.value.loading = true;

  try {
    switch (type) {
      case 'cancel':
        await cancelOrder(orderId);
        uni.showToast({ title: '订单已取消', icon: 'success' });
        break;
      case 'refund':
        await requestRefund(orderId);
        uni.showToast({ title: '退款申请已提交', icon: 'success' });
        break;
      case 'remind':
        await remindShip(orderId);
        uni.showToast({ title: '已提醒卖家发货', icon: 'success' });
        break;
    }

    // 刷新订单列表
    await loadOrders();
    handleCancelDialog();
  } catch (error) {
    console.error('操作失败:', error);
    uni.showToast({
      title: error instanceof Error ? error.message : '操作失败',
      icon: 'none',
      duration: 2000
    });
  } finally {
    confirmDialog.value.loading = false;
  }
};

// 取消对话框
const handleCancelDialog = () => {
  confirmDialog.value.visible = false;
  confirmDialog.value.action = null;
};

// 支付订单
const handlePayOrder = (orderId: string) => {
  // TODO: 实现支付逻辑
  console.log('支付订单:', orderId);
  uni.showToast({
    title: '跳转到支付页面',
    icon: 'none'
  });
};

// 查看物流
const handleViewLogistics = (orderId: string) => {
  // TODO: 实现查看物流逻辑
  console.log('查看物流:', orderId);
  uni.showToast({
    title: '查看物流信息',
    icon: 'none'
  });
};

// 申请售后
const handleAfterSales = (orderId: string) => {
  // TODO: 实现申请售后逻辑
  console.log('申请售后:', orderId);
  uni.showToast({
    title: '申请售后服务',
    icon: 'none'
  });
};

// 页面生命周期
onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = (currentPage as any).options || {};

  // 设置初始标签页
  if (options.tab) {
    activeTab.value = options.tab as OrderStatus | 'All';
  }

  // 设置需要高亮的订单ID
  if (options.highlight) {
    highlightOrderId.value = options.highlight;
  }

  loadOrders();

  // 如果有高亮订单，3秒后清除高亮
  if (highlightOrderId.value) {
    setTimeout(() => {
      highlightOrderId.value = '';
    }, 3000);
  }
});

onActivated(() => {
  // 页面显示时刷新数据
  loadOrders();
});

// 下拉刷新
const onPullDownRefresh = () => {
  loadOrders().finally(() => {
    uni.stopPullDownRefresh();
  });
};

// 上拉加载更多
const onReachBottom = () => {
  // TODO: 实现分页加载
  console.log('触底加载更多');
};

// 导出生命周期函数供uni-app使用
defineExpose({
  onPullDownRefresh,
  onReachBottom
});
</script>

<style lang="scss" scoped>
// CSS变量，与HTML模板保持一致
:root {
  --primary-color: #3b82f6;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --background-color: #f8fafc;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 1rem;
}

.loading-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.orders-container {
  /* 订单列表容器，无需额外样式 */
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  gap: 1rem;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 1rem;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}
</style>