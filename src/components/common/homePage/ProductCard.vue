<template>
  <view class="product-group">
    <!-- Container for the image and price overlay -->
    <view class="image-container">
      <!-- The product image, using a view with background-image for better control -->
      <!-- <view  class="product-image" :style="{ backgroundImage: 'url(' + product.mainImageUrl + ')' }"></view> -->
      <image  class="product-image" 
      :src="product.mainImageUrl"
      @click="handleProductImageClick()"
      mode="widthFix"
      ></image>
      <!-- Price overlay with a gradient background -->
      <view class="price-overlay">
        <text class="product-price">¥{{ product.price }}</text>
      </view>
    </view>
    
    <!-- Container for the text content below the image -->
    <view class="info-container">
      <text class="product-title">{{ product.title }}</text>
      <!-- <text class="product-desc">{{ product.description }}</text> -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ProductSummary } from '@/api/types/productTypes';

defineProps<{
    product:ProductSummary
}>();
</script>

<style scoped lang="scss">
// CSS variables from the prototype
:root {
  --text-primary: #111827;
  --text-secondary: #6b7280;
}

.product-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; // 8px gap between image and text blocks
}

.image-container {
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem; // 8px rounded corners
  width: 100%;
}

.product-image {
    display: block;
    height : auto;
  width: 100%;
  aspect-ratio: 1 / 1; // Creates a square aspect ratio
//   background-size: cover;
//   background-position: center;

    object-fit: cover;
    object-position: center;
}

.price-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem; // 8px padding
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
}

.product-price {
  font-size: 1.125rem; // 18px
  font-weight: 700; // bold
  color: #ffffff;
}

.info-container {
  // Container for text, no extra styles needed
}

.product-title {
  font-size: 0.9375rem; // 15px
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; // Truncate long titles
}

.product-desc {
  font-size: 0.875rem; // 14px
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>