<template>
  <view class="review-item">
    <!-- 评论者信息 -->
    <view class="reviewer-info">
      <view class="avatar-container">
        <image 
          :src="review.author.avatarUrl || '/static/images/default-avatar.png'" 
          mode="aspectFill" 
          class="reviewer-avatar"
          @error="handleAvatarError"
        />
      </view>
      
      <view class="reviewer-details">
        <view class="reviewer-header">
          <text class="reviewer-name">{{ review.author.nickname || '匿名用户' }}</text>
          <view class="rating-stars">
            <uni-icons 
              v-for="star in 5" 
              :key="star"
              type="star-filled" 
              :color="star <= review.rating ? '#fbbf24' : '#e5e7eb'" 
              size="14"
            ></uni-icons>
          </view>
        </view>
        <text class="review-date">{{ formatDate(review.createdAt) }}</text>
      </view>
      

    </view>
    
    <!-- 评论内容 -->
    <view class="review-content">
      <text class="review-text">{{ review.content }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Review } from '@/api/types/productTypes';

// Props
const props = defineProps<{
  review: Review;
}>();

// 格式化日期
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 1) {
      return '刚刚';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
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

// 头像加载失败处理
const handleAvatarError = () => {
  console.log('评论者头像加载失败，使用默认头像');
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
  --danger-color: #ef4444;
}

.review-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }
}

.reviewer-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.avatar-container {
  margin-right: 12px;
}

.reviewer-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
}

.reviewer-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reviewer-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reviewer-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.review-date {
  font-size: 12px;
  color: var(--text-secondary);
}



.review-content {
  margin-left: 48px; // 与头像对齐
}

.review-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  word-break: break-word;
  white-space: pre-wrap;
}

// 响应式设计
@media (max-width: 375px) {
  .review-item {
    padding: 12px 0;
  }

  .reviewer-avatar {
    width: 32px;
    height: 32px;
  }

  .reviewer-name {
    font-size: 13px;
  }

  .review-text {
    font-size: 13px;
  }

  .review-content {
    margin-left: 44px;
  }
}
</style>
