<template>
  <view class="favorite-card" @click="handleCardClick">
    <!-- 商品封面图片 -->
    <view class="image-container">
      <image 
        :src="product.mainImageUrl || 'https://via.placeholder.com/300x300/f5f5f5/999999?text=暂无图片'"
        mode="aspectFill" 
        class="product-image"
        @error="handleImageError"
      />
      <!-- 收藏状态标签 -->
      <view class="favorite-badge">
        <uni-icons type="heart-filled" size="16" color="#ff6b35"></uni-icons>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="product-info">
      <text class="product-title">{{ product.title }}</text>
      <view class="product-meta">
        <text class="product-price">¥{{ product.price.toFixed(2) }}</text>
        <button class="unfavorite-btn" @click.stop="handleUnfavorite">
          <uni-icons type="heart" size="18" color="#ff6b35"></uni-icons>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ProductSummary } from '@/api/types/productTypes';

// Props
const props = defineProps<{
  product: ProductSummary;
}>();

// 事件定义
const emit = defineEmits<{
  click: [product: ProductSummary];
  unfavorite: [product: ProductSummary];
}>();

// 卡片点击
const handleCardClick = () => {
  emit('click', props.product);
};

// 取消收藏
const handleUnfavorite = () => {
  emit('unfavorite', props.product);
};

// 图片加载失败处理
const handleImageError = () => {
  console.log('图片加载失败:', props.product.mainImageUrl);
};
</script>

<style lang="scss" scoped>
.favorite-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
}

.image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  transition: transform 0.3s ease;
}

.favorite-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-info {
  padding: 16px;
}

.product-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff6b35;
}

.unfavorite-btn {
  width: 36px;
  height: 36px;
  border: none;
  background-color: rgba(255, 107, 53, 0.1);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:active {
    background-color: rgba(255, 107, 53, 0.2);
    transform: scale(0.95);
  }
}

// 响应式设计
@media (max-width: 375px) {
  .favorite-card {
    margin-bottom: 12px;
  }
  
  .product-info {
    padding: 12px;
  }
  
  .product-title {
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .product-price {
    font-size: 16px;
  }
}
</style>
