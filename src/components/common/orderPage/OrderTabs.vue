<template>
  <view class="order-tabs">
    <view 
      v-for="tab in tabs" 
      :key="tab.value"
      class="tab-item"
      :class="{ 'tab-active': activeTab === tab.value, 'tab-inactive': activeTab !== tab.value }"
      @click="handleTabClick(tab.value)"
    >
      <text class="tab-text">{{ tab.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { OrderStatus } from '@/api/types/orderTypes';

// 定义标签页数据类型
interface TabItem {
  label: string;
  value: OrderStatus | 'All';
}

// 定义props
defineProps<{
  activeTab: OrderStatus | 'All';
}>();

// 定义事件
const emit = defineEmits<{
  tabChange: [tab: OrderStatus | 'All']
}>();

// 标签页配置 - 使用新的状态常量
const tabs: TabItem[] = [
  { label: '全部', value: 'All' },
  { label: '待付款', value: 'TO_PAY' },
  { label: '待发货', value: 'TO_SHIP' },
  { label: '待收货', value: 'TO_RECEIVE' },
  { label: '已完成', value: 'COMPLETED' }
];

// 标签页点击处理
const handleTabClick = (tabValue: OrderStatus | 'All') => {
  emit('tabChange', tabValue);
};
</script>

<style lang="scss" scoped>
// CSS变量，与HTML模板保持一致
:root {
  --primary-color: #3b82f6;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
}

.order-tabs {
  display: flex;
  gap: 1.5rem;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid transparent;
  padding-bottom: 0.75rem;
  padding-top: 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tab-active {
  border-bottom-color: var(--primary-color);
  
  .tab-text {
    color: var(--primary-color);
    font-weight: 600;
  }
}

.tab-inactive {
  border-bottom-color: transparent;
  
  .tab-text {
    color: var(--text-secondary);
    font-weight: 600;
  }
  
  &:hover .tab-text {
    color: var(--text-primary);
  }
}

.tab-text {
  font-size: 0.875rem;
  line-height: 1.25;
  transition: color 0.2s ease;
}
</style>
