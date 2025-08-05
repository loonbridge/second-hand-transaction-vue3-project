<template>
  <view class="product-group">
    <!-- Container for the image and price overlay -->
    <view class="image-container">
      <!-- The product image, using a view with background-image for better control -->
      <!-- <view  class="product-image" :style="{ backgroundImage: 'url(' + product.mainImageUrl + ')' }"></view> -->
      <image  class="product-image"
      :src="product.mainImageUrl"
      @click="handleProductImageClick()"
      mode="aspectFill"
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
import { onMounted, watch } from 'vue';
import type { ProductSummary } from '@/api/types/productTypes';

const props = defineProps<{
    product: ProductSummary
}>();

// 组件挂载时输出调试信息
onMounted(() => {
  console.log('🚀 [HomeProductCard] 组件挂载:');
  console.log('  - 商品ID:', props.product.productId);
  console.log('  - 商品标题:', props.product.title);
  console.log('  - mainImageUrl:', props.product.mainImageUrl);
  console.log('  - mainImageUrl类型:', typeof props.product.mainImageUrl);
  console.log('  - 商品完整数据:', props.product);
});

// 监听product变化
watch(() => props.product, (newProduct, oldProduct) => {
  console.log('🔄 [HomeProductCard] 商品数据变化:');
  console.log('  - 旧商品:', oldProduct?.productId);
  console.log('  - 新商品:', newProduct?.productId);
  console.log('  - 新商品mainImageUrl:', newProduct?.mainImageUrl);
}, { deep: true });

const handleProductImageClick = () => {
  console.log('👆 [HomeProductCard] 商品点击:', props.product.productId);
  // 跳转到商品详情页面
  uni.navigateTo({
    url: `/pages/product?id=${props.product.productId}`
  });
};
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
  gap: 8px;
  box-sizing: border-box;
  width: 100%; // 填充父容器
  height: 100%; // 确保高度一致
}

.image-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  width: 100%;
  height: 160px; // 使用更小的固定高度
  background-color: #f3f4f6;
}

.product-image {
  display: block;
  width: 100%;
  height: 160px; // 明确指定高度，确保一致性
  border-radius: 8px;
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
  padding: 0.25rem 0; // 添加一些内边距
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