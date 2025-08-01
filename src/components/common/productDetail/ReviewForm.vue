<template>
  <view class="review-form">
    <view class="form-header">
      <text class="form-title">发表评论</text>
      <button v-if="showCloseButton" class="close-btn" @click="handleClose">
        <uni-icons type="close" color="#6b7280" size="20"></uni-icons>
      </button>
    </view>
    
    <!-- 评分选择 -->
    <view class="rating-section">
      <text class="section-label">评分</text>
      <view class="rating-stars">
        <button 
          v-for="star in 5" 
          :key="star"
          class="star-btn"
          @click="handleRatingClick(star)"
        >
          <uni-icons 
            type="star-filled" 
            :color="star <= formData.rating ? '#fbbf24' : '#e5e7eb'" 
            size="24"
          ></uni-icons>
        </button>
      </view>
    </view>
    
    <!-- 评论内容 -->
    <view class="content-section">
      <text class="section-label">评论内容</text>
      <textarea 
        v-model="formData.content"
        class="content-textarea"
        placeholder="请输入您的评论..."
        :maxlength="500"
        :show-confirm-bar="false"
        auto-height
      ></textarea>
      <view class="char-count">
        <text class="count-text">{{ formData.content.length }}/500</text>
      </view>
    </view>
    
    <!-- 操作按钮 -->
    <view class="form-actions">
      <button 
        class="action-btn cancel-btn" 
        @click="handleCancel"
      >
        <text class="btn-text">取消</text>
      </button>
      
      <button 
        class="action-btn submit-btn" 
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        <text class="btn-text submit-text">发布</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { CreateReviewRequest } from '@/api/types/productTypes';

// Props
const props = defineProps<{
  showCloseButton?: boolean;
}>();

// 事件定义
const emit = defineEmits<{
  submit: [data: CreateReviewRequest];
  cancel: [];
  close: [];
}>();

// 表单数据
const formData = ref({
  rating: 5,
  content: ''
});

// 计算属性
const canSubmit = computed(() => {
  return formData.value.rating > 0 && formData.value.content.trim().length > 0;
});



// 评分点击处理
const handleRatingClick = (rating: number) => {
  formData.value.rating = rating;
};

// 关闭按钮点击
const handleClose = () => {
  emit('close');
};

// 取消按钮点击
const handleCancel = () => {
  // 重置表单
  formData.value = {
    rating: 5,
    content: ''
  };
  emit('cancel');
};

// 提交按钮点击
const handleSubmit = () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请完善评论信息',
      icon: 'none'
    });
    return;
  }

  const submitData = {
    rating: formData.value.rating,
    content: formData.value.content.trim()
  };

  emit('submit', submitData);
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

.review-form {
  background-color: var(--background-color);
  border-radius: 12px;
  padding: 24px;
  border: none;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--surface-color);
  }
}

.rating-section,
.content-section {
  margin-bottom: 20px;
}

.section-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.rating-stars {
  display: flex;
  gap: 4px;
}

.star-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--surface-color);
  }

  &:active {
    transform: scale(0.95);
  }
}

.content-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  background-color: var(--background-color);
  resize: none;
  box-sizing: border-box;

  &:focus {
    border-color: var(--primary-color);
    outline: none;
  }

  &::placeholder {
    color: var(--text-secondary);
  }
}

.char-count {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.count-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.action-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;

  &:active {
    transform: scale(0.98);
  }
}

.cancel-btn {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);

  .btn-text {
    color: var(--text-secondary);
  }

  &:hover {
    background-color: var(--border-color);
  }
}

.submit-btn {
  background-color: var(--primary-color);

  .submit-text {
    color: #ffffff;
  }

  &:hover {
    background-color: #0969da;
  }

  &:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;

    .submit-text {
      color: var(--text-secondary);
    }
  }
}

// 响应式设计
@media (max-width: 375px) {
  .review-form {
    padding: 16px;
  }

  .form-title {
    font-size: 16px;
  }

  .star-btn {
    width: 36px;
    height: 36px;
  }

  .content-textarea {
    min-height: 70px;
    padding: 10px;
  }

  .action-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style>
