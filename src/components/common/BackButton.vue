<template>
  <button 
    class="back-button" 
    :class="[variant, { disabled: disabled }]"
    @click="handleClick"
    :disabled="disabled"
  >
    <uni-icons 
      type="back" 
      :size="iconSize" 
      :color="iconColor"
    ></uni-icons>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 定义按钮变体类型
type ButtonVariant = 'default' | 'circle' | 'minimal';

// Props定义
const props = withDefaults(defineProps<{
  variant?: ButtonVariant;
  disabled?: boolean;
  iconSize?: number;
  customIconColor?: string;
}>(), {
  variant: 'default',
  disabled: false,
  iconSize: 24,
  customIconColor: ''
});

// 事件定义
const emit = defineEmits<{
  click: []
}>();

// 计算图标颜色
const iconColor = computed(() => {
  if (props.customIconColor) {
    return props.customIconColor;
  }
  
  if (props.disabled) {
    return '#9ca3af';
  }
  
  switch (props.variant) {
    case 'circle':
      return '#1e293b';
    case 'minimal':
      return '#6b7280';
    default:
      return '#1e293b';
  }
});

// 点击处理
const handleClick = () => {
  if (!props.disabled) {
    emit('click');
  }
};
</script>

<style lang="scss" scoped>
// CSS变量，与项目主题保持一致
:root {
  --background-color: #ffffff;
  --border-color: #e5e7eb;
  --text-primary: #1e293b;
  --text-secondary: #6b7280;
  --disabled-color: #9ca3af;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
    
    &:active {
      transform: none;
    }
  }
}

// 默认样式 - 简单的返回按钮
.default {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: transparent;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  &:active {
    background-color: rgba(0, 0, 0, 0.1);
  }
}

// 圆形样式 - 带边框和背景的圆形按钮（商品详情页样式）
.circle {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(0, 0, 0, 0.4);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 10001;

  &:hover {
    background-color: rgba(255, 255, 255, 1);
    border-color: rgba(0, 0, 0, 0.6);
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }

  &:active {
    transform: scale(0.95);
  }
}

// 极简样式 - 只有图标，无背景
.minimal {
  width: 32px;
  height: 32px;
  padding: 4px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }
}

// 响应式设计
@media (max-width: 375px) {
  .back-button {
    &.default,
    &.circle {
      width: 36px;
      height: 36px;
    }
    
    &.minimal {
      width: 28px;
      height: 28px;
    }
  }
}
</style>
