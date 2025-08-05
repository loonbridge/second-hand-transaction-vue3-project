<template>
  <view class="published-card" @click="handleCardClick">
    <!-- 商品封面图片 -->
    <view class="image-container">
      <image
        :src="imageUrl"
        mode="aspectFill"
        class="product-image"
        @error="handleImageError"
      />
      <!-- 商品状态标签 -->
      <view v-if="product.stock === 0" class="status-badge sold-out">
        <text class="status-text">已售完</text>
      </view>
      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-btn edit-btn" @click.stop="handleEdit">
          <uni-icons type="compose" size="14" color="#ff6b35"></uni-icons>
        </button>
        <button class="action-btn delete-btn" @click.stop="handleDelete">
          <uni-icons type="trash" size="14" color="#ff6b35"></uni-icons>
        </button>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="product-info">
      <text class="product-title">{{ product.title }}</text>
      <view class="product-meta">
        <text class="product-price">¥{{ product.price.toFixed(2) }}</text>
        <text class="stock-info">库存{{ product.stock }}件</text>
      </view>
      <text class="publish-time">{{ formatPublishTime(product.postedAt) }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import type { ProductSummary } from '@/api/types/productTypes';

// Props
const props = defineProps<{
  product: ProductSummary;
}>();

// 事件定义
const emit = defineEmits<{
  click: [product: ProductSummary];
  edit: [product: ProductSummary];
  delete: [product: ProductSummary];
}>();

// 计算图片URL并添加调试日志
const imageUrl = computed(() => {
  const product = props.product;

  console.log('🔍 [PublishedProductCard] 调试商品图片URL:');
  console.log('  - 商品ID:', product.productId);
  console.log('  - 商品标题:', product.title);
  console.log('  - imageUrls:', product.imageUrls);
  console.log('  - imageUrls类型:', typeof product.imageUrls);
  console.log('  - imageUrls长度:', product.imageUrls?.length);
  console.log('  - imageUrls[0]:', product.imageUrls?.[0]);
  console.log('  - mainImageUrl:', product.mainImageUrl);
  console.log('  - mainImageUrl类型:', typeof product.mainImageUrl);

  const finalUrl = product.imageUrls?.[0] || product.mainImageUrl || 'https://via.placeholder.com/300x300/f5f5f5/999999?text=暂无图片';
  console.log('  - 最终使用的URL:', finalUrl);
  console.log('  - URL来源:', product.imageUrls?.[0] ? 'imageUrls[0]' : product.mainImageUrl ? 'mainImageUrl' : '占位符');

  return finalUrl;
});

// 监听product变化
watch(() => props.product, (newProduct, oldProduct) => {
  console.log('🔄 [PublishedProductCard] 商品数据变化:');
  console.log('  - 旧商品:', oldProduct?.productId);
  console.log('  - 新商品:', newProduct?.productId);
  console.log('  - 新商品完整数据:', newProduct);
}, { deep: true });

// 组件挂载时输出调试信息
onMounted(() => {
  console.log('🚀 [PublishedProductCard] 组件挂载:');
  console.log('  - 商品数据:', props.product);
});

// 卡片点击
const handleCardClick = () => {
  console.log('👆 [PublishedProductCard] 卡片点击:', props.product.productId);
  emit('click', props.product);
};

// 编辑商品
const handleEdit = () => {
  emit('edit', props.product);
};

// 删除商品
const handleDelete = () => {
  emit('delete', props.product);
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
.published-card {
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

.status-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;

  &.sold-out {
    background-color: #ff4757;
  }
}

.status-text {
  color: #ffffff;
  font-size: 10px;
}

.action-buttons {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:active {
    background-color: rgba(255, 107, 53, 0.1);
    transform: scale(0.95);
  }
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
  margin-bottom: 8px;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff6b35;
}

.stock-info {
  font-size: 12px;
  color: #999;
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.publish-time {
  font-size: 12px;
  color: #999;
}

// 响应式设计
@media (max-width: 375px) {
  .published-card {
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
