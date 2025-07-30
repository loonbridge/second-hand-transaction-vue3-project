<template>
  <view class="order-layout">
    <!-- 头部导航区域 -->
    <header class="sticky-header">
      <view class="header-content">
        <view class="nav-bar">
          <button class="back-button" @click="handleBackClick">
            <uni-icons type="back" size="24" color="#1e293b"></uni-icons>
          </button>
          <text class="page-title">订单管理</text>
          <view class="placeholder"></view>
        </view>
        
        <!-- 标签页导航 -->
        <nav class="tab-navigation">
          <slot name="tabs"></slot>
        </nav>
      </view>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <slot name="content"></slot>
    </main>
  </view>
</template>

<script setup lang="ts">
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
// CSS变量，与HTML模板保持一致
:root {
  --primary-color: #3b82f6;
  --secondary-color: #f1f5f9;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --background-color: #f8fafc;
}

.order-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-color);
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #e2e8f0;
}

.header-content {
  background-color: white;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 1rem;
  position: relative;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f1f5f9;
  }
}

.page-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.25;
}

.placeholder {
  width: 2.5rem;
  height: 2.5rem;
}

.tab-navigation {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 1rem;
  gap: 1.5rem;
}

.main-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}
</style>
