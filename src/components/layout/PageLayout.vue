<template>
  <view class="page-layout">
    <!-- 头部导航区域 -->
    <header class="sticky-header">
      <view class="header-content">
        <view class="nav-bar">
          <BackButton variant="default" @click="handleBackClick" />
          <text class="page-title">{{ title }}</text>
          <view class="header-actions">
            <slot name="header-actions"></slot>
          </view>
        </view>
      </view>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <slot></slot>
    </main>
  </view>
</template>

<script setup lang="ts">
import BackButton from '@/components/common/BackButton.vue';

// Props
const props = defineProps<{
  title: string;
}>();

// 定义事件
const emit = defineEmits<{
  backClick: []
}>();

// 返回按钮点击处理
const handleBackClick = () => {
  emit('backClick');
};
</script>

<style lang="scss" scoped>
// CSS变量，与项目主题保持一致
:root {
  --background-color: #ffffff;
  --surface-color: #f9fafb;
  --border-color: #e5e7eb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --primary-color: #0b80ee;
  --status-bar-height: 44px;
}

.page-layout {
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
  min-height: 100vh;
  position: relative;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border-color);
}

.header-content {
  padding: 0 1rem;
  padding-top: var(--status-bar-height);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  position: relative;
}



.page-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.main-content {
  flex: 1;
  padding: 16px;
}

// 响应式设计
@media (max-width: 375px) {
  .header-content {
    padding: 0 12px;
    padding-top: var(--status-bar-height);
  }

  .main-content {
    padding: 12px;
  }

  .page-title {
    font-size: 16px;
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
