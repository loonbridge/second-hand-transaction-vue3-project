<template>
  <view v-if="visible" class="dialog-overlay" @click="handleOverlayClick">
    <view class="dialog-container" @click.stop>
      <!-- 对话框头部 -->
      <view class="dialog-header">
        <text class="dialog-title">{{ title }}</text>
      </view>
      
      <!-- 对话框内容 -->
      <view class="dialog-content">
        <text class="dialog-message">{{ message }}</text>
      </view>
      
      <!-- 对话框按钮 -->
      <view class="dialog-actions">
        <button class="dialog-button cancel-button" @click="handleCancel">
          <text class="button-text">{{ cancelText }}</text>
        </button>
        <button class="dialog-button confirm-button" @click="handleConfirm" :disabled="loading">
          <text class="button-text">{{ loading ? '处理中...' : confirmText }}</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 定义props
defineProps<{
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}>();

// 定义事件
const emit = defineEmits<{
  confirm: [];
  cancel: [];
  close: [];
}>();

// 遮罩层点击处理
const handleOverlayClick = () => {
  emit('close');
};

// 取消按钮点击处理
const handleCancel = () => {
  emit('cancel');
};

// 确认按钮点击处理
const handleConfirm = () => {
  emit('confirm');
};
</script>

<style lang="scss" scoped>
// CSS变量，与HTML模板保持一致
:root {
  --primary-color: #3b82f6;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --danger-color: #dc2626;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.dialog-container {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 20rem;
  width: 100%;
  overflow: hidden;
  animation: dialogSlideIn 0.2s ease-out;
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.dialog-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.5;
}

.dialog-content {
  padding: 1rem 1.5rem;
}

.dialog-message {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.dialog-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25;
  transition: all 0.2s ease;
  border: none;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.cancel-button {
  background-color: #f8fafc;
  color: var(--text-secondary);
  border: 1px solid #e2e8f0;
  
  &:hover:not(:disabled) {
    background-color: #f1f5f9;
  }
}

.confirm-button {
  background-color: var(--danger-color);
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #b91c1c;
  }
}

.button-text {
  white-space: nowrap;
}
</style>
