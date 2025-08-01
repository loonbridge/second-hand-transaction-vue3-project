<template>
  <view class="product-info">
    <!-- 价格和标题 -->
    <view class="price-title-section">
      <view class="price-container">
        <text class="currency">¥</text>
        <text class="price">{{ product.price }}</text>
      </view>
      <text class="product-title">{{ product.title }}</text>
    </view>

    <!-- 商品基本信息 -->
    <view class="basic-info">
      <view class="info-item">
        <text class="info-label">库存</text>
        <text class="info-value">{{ product.stock }}件</text>
      </view>
      <view class="info-item">
        <text class="info-label">发布时间</text>
        <text class="info-value">{{ formatDate(product.postedAt) }}</text>
      </view>
    </view>

    <!-- 操作按钮区域 -->
    <view class="action-buttons">
      <button 
        class="action-btn favorite-btn" 
        :class="{ 'favorited': product.isFavorite }"
        @click="handleFavoriteClick"
      >
        <uni-icons 
          :type="product.isFavorite ? 'heart-filled' : 'heart'" 
          :color="product.isFavorite ? '#ff4757' : '#6b7280'" 
          size="20"
        ></uni-icons>
        <text class="btn-text">{{ product.isFavorite ? '已收藏' : '收藏' }}</text>
      </button>
      
      <button class="action-btn share-btn" @click="handleShareClick">
        <uni-icons type="redo" color="#6b7280" size="20"></uni-icons>
        <text class="btn-text">分享</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ProductDetail } from '@/api/types/productTypes';

// Props
const props = defineProps<{
  product: ProductDetail;
}>();

// 事件定义
const emit = defineEmits<{
  favoriteClick: [];
  shareClick: [];
}>();

// 格式化日期
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  } catch (error) {
    console.error('日期格式化失败:', error);
    return dateString;
  }
};

// 收藏按钮点击
const handleFavoriteClick = () => {
  emit('favoriteClick');
};

// 分享按钮点击
const handleShareClick = () => {
  emit('shareClick');
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
  --danger-color: #ef4444;
}

.product-info {
  background-color: var(--background-color);
  padding: 20px 16px;
}

.price-title-section {
  margin-bottom: 20px;
}

.price-container {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}

.currency {
  font-size: 20px;
  font-weight: 600;
  color: var(--danger-color);
  margin-right: 2px;
}

.price {
  font-size: 32px;
  font-weight: 700;
  color: var(--danger-color);
  line-height: 1;
}

.product-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  word-break: break-word;
}

.basic-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: var(--surface-color);
  border-radius: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--background-color);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--surface-color);
  }

  &:active {
    transform: scale(0.98);
  }
}

.favorite-btn {
  &.favorited {
    border-color: #ff4757;
    background-color: rgba(255, 71, 87, 0.1);
  }
}

.btn-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.favorited .btn-text {
  color: #ff4757;
}

// 响应式设计
@media (max-width: 375px) {
  .product-info {
    padding: 16px 12px;
  }

  .price {
    font-size: 28px;
  }

  .product-title {
    font-size: 16px;
  }

  .basic-info {
    padding: 12px;
  }

  .action-btn {
    height: 40px;
  }
}
</style>
