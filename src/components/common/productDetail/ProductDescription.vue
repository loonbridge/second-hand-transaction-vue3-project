<template>
  <view class="product-description">
    <view class="description-header">
      <text class="section-title">商品描述</text>
    </view>
    
    <view class="description-content">
      <view class="description-text" :class="{ 'expanded': isExpanded }">
        <text class="description">{{ description || '暂无商品描述' }}</text>
      </view>
      
      <!-- 展开/收起按钮 -->
      <view v-if="shouldShowToggle" class="toggle-container">
        <button class="toggle-btn" @click="handleToggleExpand">
          <text class="toggle-text">{{ isExpanded ? '收起' : '展开' }}</text>
          <uni-icons 
            :type="isExpanded ? 'up' : 'down'" 
            color="#6b7280" 
            size="14"
          ></uni-icons>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';

// Props
const props = defineProps<{
  description: string;
}>();

// 响应式数据
const isExpanded = ref(false);
const shouldShowToggle = ref(false);
const maxLines = 3; // 最大显示行数

// 计算属性
const formattedDescription = computed(() => {
  if (!props.description) return '暂无商品描述';
  return props.description.trim();
});

// 生命周期
onMounted(() => {
  nextTick(() => {
    checkTextOverflow();
  });
});

// 检查文本是否超出限制
const checkTextOverflow = () => {
  // 简单的字符数量判断，实际项目中可以使用更精确的方法
  const textLength = formattedDescription.value.length;
  const estimatedLines = Math.ceil(textLength / 30); // 假设每行约30个字符
  shouldShowToggle.value = estimatedLines > maxLines;
};

// 切换展开/收起状态
const handleToggleExpand = () => {
  isExpanded.value = !isExpanded.value;
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

.product-description {
  background-color: var(--background-color);
}

.description-header {
  padding: 0 0 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.description-content {
  padding-top: 16px;
}

.description-text {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:not(.expanded) {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    max-height: 4.5em; // 约3行的高度
  }

  &.expanded {
    max-height: none;
    -webkit-line-clamp: unset;
  }
}

.description {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  word-break: break-word;
  white-space: pre-wrap; // 保留换行符
}

.toggle-container {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background-color: var(--surface-color);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--border-color);
  }

  &:active {
    transform: scale(0.95);
  }
}

.toggle-text {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

// 响应式设计
@media (max-width: 375px) {
  .description {
    font-size: 13px;
  }

  .description-text:not(.expanded) {
    max-height: 4em; // 在小屏幕上稍微减少高度
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
