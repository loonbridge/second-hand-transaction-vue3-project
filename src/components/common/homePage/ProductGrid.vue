<template>
  <view class="recommend-section">
    <text class="section-title">为您推荐</text>
    <!-- A simple grid layout for the products -->
    <view class="product-grid">
      <ProductCard v-for="item in products" :key="item.productId" :product="item" />
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ProductSummary } from '@/api/types/productTypes';
import ProductCard from './ProductCard.vue';

// No need to split into columns manually with CSS grid
defineProps<{
  products: ProductSummary[];
}>();
</script>

<style scoped lang="scss">
:root {
  --text-primary: #111827;
}

.recommend-section {
  // No specific styles needed for the container itself
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
  display: grid;
  grid-template-columns: repeat(2, 1fr); // Two-column grid
  gap: 1rem; // 16px gap
  padding-bottom: 1rem; // Add some space at the bottom
}
</style>