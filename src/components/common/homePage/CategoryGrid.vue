<template>
  <view class="category-section">
    <text class="section-title">分类</text>
    <view class="grid-container">
      <!-- Looping through categories to display them in a grid -->
      <view class="category-item" v-for="(item, index) in categories" :key="index">
        <view class="icon-wrapper" @click="hanleCategoryClick()">
          <!-- Using uni-icons as placeholders, styled to match the prototype -->
          <uni-icons :type="item.iconUrl" size="32" color="#0b80ee" @click=""></uni-icons>
        </view>
        <text class="category-name">{{ item.name }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Category } from '@/api/types/productTypes';

defineProps<{
    categories: Category[],
}>();
</script>

<style scoped lang="scss">
// CSS variables from the prototype
:root {
  --primary-color: #0b80ee;
  --secondary-color: #f0f8ff;
  --text-primary: #111827;
  --text-secondary: #6b7280;
}

.category-section {
  // The container no longer needs its own background or padding
}

.section-title {
  font-size: 1.25rem; // 20px
  font-weight: 700;   // bold
  color: var(--text-primary);
  display: block; // To apply padding
  padding-bottom: 0.75rem; // 12px
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr); // 4-column grid
  gap: 1rem; // 16px gap between items
  text-align: center;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem; // 8px gap between icon and text
}

.icon-wrapper {
  width: 3.5rem; // 56px
  height: 3.5rem; // 56px
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--secondary-color); // Light blue background
  color: var(--primary-color);
}

.category-name {
  font-size: 0.875rem; // 14px
  font-weight: 500;
  color: var(--text-secondary);
}
</style>