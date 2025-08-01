<template>
  <view class="product-card" @click="handleCardClick">
    <!-- 商品封面图片 -->
    <view class="image-container">
      <image 
        :src="product.imageUrls[0] || '/static/images/placeholder.png'" 
        mode="aspectFill" 
        class="product-image"
        @error="handleImageError"
      />
      <!-- 商品状态标签 -->
      <view v-if="product.stock === 0" class="status-badge sold-out">
        <text class="status-text">已售完</text>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="product-info">
      <view class="product-header">
        <text class="product-title">{{ product.title }}</text>
        <text class="product-price">¥{{ product.price }}</text>
      </view>
      
      <view class="product-meta">
        <text class="publish-time">{{ formatPublishTime(product.postedAt) }}</text>
        <view class="stock-info">
          <text class="stock-text">库存: {{ product.stock }}</text>
        </view>
      </view>
      
      <!-- 商品描述 -->
      <text class="product-description">{{ truncateDescription(product.description) }}</text>
    </view>

    <!-- 操作按钮区域 -->
    <view class="action-area">
      <uni-icons type="right" color="#d1d5db" size="16"></uni-icons>
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
}>();

// 卡片点击
const handleCardClick = () => {
  emit('click', props.product);
};

// 图片加载失败处理
const handleImageError = () => {
  console.log('商品图片加载失败，使用默认图片');
};

// 格式化发布时间
const formatPublishTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 0 ? '刚刚发布' : `${diffMinutes}分钟前`;
      }
      return `${diffHours}小时前`;
    } else if (diffDays === 1) {
      return '昨天发布';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
  } catch (error) {
    console.error('日期格式化失败:', error);
    return '发布时间未知';
  }
};

// 截断商品描述
const truncateDescription = (description: string): string => {
  if (description.length <= 50) {
    return description;
  }
  return description.substring(0, 50) + '...';
};
</script>

<style lang="scss" scoped>
:root {
  --background-color: #ffffff;
  --surface-color: #f9fafb;
  --border-color: #e5e7eb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --primary-color: #0b80ee;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
}

.product-card {
  display: flex;
  background-color: var(--background-color);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

.image-container {
  position: relative;
  margin-right: 16px;
  flex-shrink: 0;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.status-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;

  &.sold-out {
    background-color: var(--danger-color);
  }
}

.status-text {
  color: #ffffff;
  font-size: 10px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.product-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  word-break: break-word;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--danger-color);
  flex-shrink: 0;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.publish-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.stock-info {
  display: flex;
  align-items: center;
}

.stock-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.product-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
  word-break: break-word;
}

.action-area {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  flex-shrink: 0;
}

// 响应式设计
@media (max-width: 375px) {
  .product-card {
    padding: 12px;
  }

  .product-image {
    width: 70px;
    height: 70px;
  }

  .image-container {
    margin-right: 12px;
  }

  .product-title {
    font-size: 15px;
  }

  .product-price {
    font-size: 16px;
  }

  .product-description {
    font-size: 13px;
  }
}

// 深色模式支持
@media (prefers-color-scheme: dark) {
  :root {
    --background-color: #1f2937;
    --surface-color: #374151;
    --border-color: #4b5563;
    --text-primary: #f9fafb;
    --text-secondary: #d1d5db;
  }
}
</style>
