<template>
  <view class="recommend-section">
    <text class="section-title">为您推荐</text>
    <!-- A simple grid layout for the products -->
    <view class="product-grid">
      <view class="product-item" v-for="item in products" :key="item.productId">
        <ProductCard :product="item" />
      </view>
    </view>

    <!-- 加载更多按钮 -->
    <view v-if="hasMore" class="load-more-container">
      <button
        class="load-more-btn"
        @click="handleLoadMore"
        :disabled="isLoadingMore"
      >
        <text class="load-more-text">
          {{ isLoadingMore ? '加载中...' : '加载更多' }}
        </text>
      </button>
    </view>

    <!-- 没有更多数据提示 -->
    <view v-else-if="products.length > 0" class="no-more-container">
      <text class="no-more-text">没有更多商品了</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ProductSummary } from '@/api/types/productTypes';
import ProductCard from './ProductCard.vue';

// 定义props
const props = defineProps<{
  products: ProductSummary[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
}>();

// 定义事件
const emit = defineEmits<{
  loadMore: [];
}>();

// 加载更多处理
const handleLoadMore = () => {
  console.log('🔄 [ProductGrid] 点击加载更多');
  emit('loadMore');
};
</script>

<style scoped lang="scss">
:root {
  --text-primary: #111827;
}

.recommend-section {
  padding: 0 1rem; // 添加水平内边距
}

.section-title {
  display: block;
  padding-top: 2rem;    // 32px
  padding-bottom: 0.75rem; // 12px
  font-size: 1.25rem;   // 20px
  font-weight: 700;     // bold
  color: var(--text-primary);
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 16px;
  width: 100%;
  gap: 8px; // 商品之间的间距
}

.product-item {
  width: calc(50% - 4px); // 每行两列，减去gap的一半
  box-sizing: border-box;
  margin-bottom: 8px;
}

.load-more-container {
  display: flex;
  justify-content: center;
  padding: 20px 16px;
}

.load-more-btn {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 24px;
  min-width: 120px;
  transition: all 0.2s ease;
}

.load-more-btn:hover {
  background-color: #e9ecef;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.load-more-text {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.no-more-container {
  display: flex;
  justify-content: center;
  padding: 20px 16px;
}

.no-more-text {
  font-size: 14px;
  color: #9ca3af;
}
</style>