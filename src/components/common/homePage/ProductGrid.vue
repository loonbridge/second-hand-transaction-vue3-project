<template>
  <view class="recommend-section">
    <text class="section-title">为您推荐</text>
    <!-- A simple grid layout for the products -->
    <view class="product-grid">
      <view class="product-item" v-for="item in products" :key="item.productId">
        <ProductCard :product="item" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ProductSummary } from '@/api/types/productTypes';
import ProductCard from './ProductCard.vue';

defineProps<{
  products: ProductSummary[];
}>();
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
</style>