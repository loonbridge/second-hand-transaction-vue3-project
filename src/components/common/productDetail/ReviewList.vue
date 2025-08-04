<template>
  <view class="review-list">
    <!-- 评论区头部 -->
    <view class="reviews-header">
      <view class="header-left">
        <text class="section-title">商品评论</text>
        <text v-if="totalCount > 0" class="review-count">({{ totalCount }})</text>
      </view>
      
      <view 
        v-if="canAddReview" 
        class="add-review-btn" 
        @click="handleAddReviewClick"
      >
        <uni-icons type="compose" color="#0b80ee" size="16"></uni-icons>
        <text class="add-review-text">写评论</text>
      </view>
    </view>
    
    <!-- 评论表单模态框 -->
    <view v-if="showForm" class="review-form-modal">
      <view class="modal-overlay" @click="handleFormClose"></view>
      <view class="modal-content">
        <ReviewForm
          :is-edit="false"
          :show-close-button="true"
          @submit="handleFormSubmit"
          @cancel="handleFormCancel"
          @close="handleFormClose"
        />
      </view>
    </view>
    
    <!-- 评论列表 -->
    <view class="reviews-content">
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <uni-load-more status="loading"></uni-load-more>
      </view>
      
      <!-- 评论列表 -->
      <view v-else-if="reviews.length > 0" class="reviews-list">
        <ReviewItem
          v-for="review in reviews"
          :key="review.reviewId"
          :review="review"
        />
        
        <!-- 加载更多 -->
        <view v-if="hasMore" class="load-more-container">
          <button class="load-more-btn" @click="handleLoadMore" :disabled="loadingMore">
            <text class="load-more-text">
              {{ loadingMore ? '加载中...' : '加载更多' }}
            </text>
          </button>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-else class="empty-reviews">
        <uni-icons type="chat" color="#d1d5db" size="48"></uni-icons>
        <text class="empty-text">暂无评论</text>
        <text class="empty-desc">成为第一个评论的人吧</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Review, CreateReviewRequest } from '@/api/types/productTypes';
import ReviewItem from './ReviewItem.vue';
import ReviewForm from './ReviewForm.vue';

// Props
const props = defineProps<{
  reviews: Review[];
  totalCount: number;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  canAddReview: boolean;
}>();

// 事件定义
const emit = defineEmits<{
  addReview: [data: CreateReviewRequest];
  loadMore: [];
}>();

// 响应式数据
const showForm = ref(false);

// 添加评论按钮点击
const handleAddReviewClick = () => {
  showForm.value = true;
};

// 表单提交
const handleFormSubmit = (data: CreateReviewRequest) => {
  emit('addReview', data);
  handleFormClose();
};

// 表单取消
const handleFormCancel = () => {
  showForm.value = false;
};

// 表单关闭
const handleFormClose = () => {
  showForm.value = false;
};

// 加载更多
const handleLoadMore = () => {
  emit('loadMore');
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
}

.review-list {
  background-color: var(--background-color);
}

.reviews-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 -16px 16px -16px;
  padding: 0 16px 16px 16px;
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.review-count {
  font-size: 14px;
  color: var(--text-secondary);
}

.add-review-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  height: 28px;
  border: 1px solid var(--primary-color);
  border-radius: 14px;
  background-color: transparent;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(11, 128, 238, 0.1);
  }

  &:active {
    transform: scale(0.95);
  }
}

.add-review-text {
  font-size: 12px;
  color: var(--primary-color);
  font-weight: 500;
}

.review-form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  z-index: 1001;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  background-color: var(--background-color);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.reviews-content {
  padding-top: 16px;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.reviews-list {
  // ReviewItem 组件会处理自己的样式
}

.load-more-container {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.load-more-btn {
  padding: 8px 24px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background-color: var(--surface-color);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--border-color);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.load-more-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.empty-reviews {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-text {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 12px 0 4px 0;
  font-weight: 500;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-secondary);
  opacity: 0.8;
}

// 响应式设计
@media (max-width: 375px) {
  .section-title {
    font-size: 15px;
  }

  .review-count {
    font-size: 13px;
  }

  .add-review-text {
    font-size: 12px;
  }

  .empty-reviews {
    padding: 30px 16px;
  }

  .empty-text {
    font-size: 15px;
  }

  .empty-desc {
    font-size: 13px;
  }

  .review-form-modal {
    padding: 16px;
  }

  .modal-content {
    border-radius: 12px;
    max-height: 85vh;
  }
}
</style>
