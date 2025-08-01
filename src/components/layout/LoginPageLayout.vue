<template>
  <!-- 登录页面布局容器 -->
  <view class="login-layout">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 头部区域 -->
    <header class="login-header-container">
      <slot name="header"></slot>
    </header>

    <!-- 主要内容区域 -->
    <main class="login-content-container">
      <slot name="content"></slot>
    </main>
  </view>
</template>

<script setup lang="ts">
// 无需额外的脚本逻辑
</script>

<style lang="scss" scoped>
// CSS变量，与项目主题保持一致
:root {
  --background-color: #ffffff;
  --surface-color: #f9fafb;
  --border-color: #e5e7eb;
  --status-bar-height: 44px; // iOS状态栏高度
}

.login-layout {
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
  min-height: 100vh;
  position: relative;
}

.status-bar {
  height: var(--status-bar-height);
  background-color: var(--background-color);
  
  // 条件编译：仅在小程序中显示状态栏占位
  /* #ifdef MP-WEIXIN */
  height: var(--status-bar-height);
  /* #endif */
  
  /* #ifdef H5 */
  height: 0;
  /* #endif */
}

.login-header-container {
  flex-shrink: 0;
  background-color: var(--background-color);
  padding: 0 1rem; // 16px 水平内边距
}

.login-content-container {
  flex: 1;
  background-color: var(--background-color);
  overflow-y: auto;
}
</style>
