<template>
  <view class="product-card" @click="handleCardClick">
    <!-- 商品封面图片 -->
    <view class="image-container">
      <image
        :src="imageUrl"
        mode="aspectFill"
        class="product-image"
        @error="handleImageError"
      />
      
      <!-- 状态标签 -->
      <view v-if="showStatus && getStatusInfo()" class="status-badge" :class="getStatusInfo()?.class">
        <text class="status-text">{{ getStatusInfo()?.text }}</text>
      </view>
      
      <!-- 操作按钮 -->
      <view v-if="showActions && actions.length > 0" class="action-buttons">
        <button 
          v-for="action in actions" 
          :key="action.type"
          class="action-btn" 
          :class="action.class"
          @click.stop="handleActionClick(action.type)"
        >
          <uni-icons :type="action.icon" size="14" :color="action.color"></uni-icons>
        </button>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="product-info">
      <text class="product-title">{{ product.title }}</text>

      <!-- 分类信息 -->
      <view v-if="product.categoryName" class="category-info">
        <text class="category-tag">{{ product.categoryName }}</text>
      </view>

      <view class="product-meta">
        <text class="product-price">¥{{ product.price.toFixed(2) }}</text>
        <text v-if="showStock" class="stock-info">库存{{ product.stock }}件</text>
        <text v-if="showSeller" class="seller-name">{{ product.sellerInfo?.nickname || '匿名用户' }}</text>
      </view>
      <text v-if="showTime" class="time-info">{{ formatTime(product.postedAt || product.createdAt || product.favoriteTime) }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import type { ProductSummary } from '@/api/types/productTypes';

// 定义操作类型
export type ActionType = 'edit' | 'delete' | 'unfavorite' | 'share';

// 定义操作按钮接口
export interface CardAction {
  type: ActionType;
  icon: string;
  color: string;
  class?: string;
}

// 定义状态信息接口
interface StatusInfo {
  text: string;
  class: string;
}

// Props
const props = withDefaults(defineProps<{
  product: ProductSummary;
  showStatus?: boolean;
  showActions?: boolean;
  showStock?: boolean;
  showSeller?: boolean;
  showTime?: boolean;
  actions?: CardAction[];
  cardType?: 'published' | 'favorite' | 'default';
}>(), {
  showStatus: false,
  showActions: false,
  showStock: false,
  showSeller: false,
  showTime: false,
  actions: () => [],
  cardType: 'default'
});

// 计算图片URL并添加调试日志
const imageUrl = computed(() => {
  const product = props.product;

  console.log('🔍 [ProductCard] 调试商品信息:');
  console.log('  - 卡片类型:', props.cardType);
  console.log('  - 商品ID:', product.productId);
  console.log('  - 商品标题:', product.title);
  console.log('  - 分类ID:', product.categoryId);
  console.log('  - 分类名称:', product.categoryName);
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
  console.log('🔄 [ProductCard] 商品数据变化:');
  console.log('  - 卡片类型:', props.cardType);
  console.log('  - 旧商品:', oldProduct?.productId);
  console.log('  - 新商品:', newProduct?.productId);
  console.log('  - 新商品完整数据:', newProduct);
}, { deep: true });

// 组件挂载时输出调试信息
onMounted(() => {
  console.log('🚀 [ProductCard] 组件挂载:');
  console.log('  - 卡片类型:', props.cardType);
  console.log('  - 商品数据:', props.product);
});

// 事件定义
const emit = defineEmits<{
  click: [product: ProductSummary];
  action: [type: ActionType, product: ProductSummary];
}>();

// 卡片点击
const handleCardClick = () => {
  emit('click', props.product);
};

// 操作按钮点击
const handleActionClick = (actionType: ActionType) => {
  emit('action', actionType, props.product);
};

// 获取状态信息
const getStatusInfo = (): StatusInfo | null => {
  if (!props.showStatus) return null;
  
  if (props.product.stock === 0) {
    return {
      text: '已售完',
      class: 'sold-out'
    };
  }
  
  return null;
};

// 图片加载失败处理
const handleImageError = () => {
  console.log('商品图片加载失败，使用默认图片');
};

// 格式化时间
const formatTime = (dateString?: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 0 ? '刚刚' : `${diffMinutes}分钟前`;
      }
      return `${diffHours}小时前`;
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
  } catch (error) {
    console.error('日期格式化失败:', error);
    return '';
  }
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
  --error-color: #ef4444;
  --warning-color: #f59e0b;
}

.product-card {
  background-color: var(--background-color);
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
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
    background-color: var(--error-color);
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
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-info {
  margin-bottom: 8px;
}

.category-tag {
  display: inline-block;
  font-size: 12px;
  color: var(--primary-color);
  background-color: rgba(11, 128, 238, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid rgba(11, 128, 238, 0.2);
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
}

.stock-info {
  font-size: 12px;
  color: var(--text-secondary);
  background-color: var(--surface-color);
  padding: 2px 8px;
  border-radius: 10px;
}

.seller-name {
  font-size: 12px;
  color: var(--text-secondary);
}

.time-info {
  font-size: 12px;
  color: var(--text-secondary);
}

// 响应式设计
@media (max-width: 375px) {
  .product-card {
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
