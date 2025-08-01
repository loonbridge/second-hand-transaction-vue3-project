<template>
  <view class="product-detail-layout">
    <!-- 头部导航区域 -->
    <header class="sticky-header">
      <view class="header-content">
        <view class="nav-bar">
          <BackButton variant="circle" @click="handleBackClick" />
          <text class="page-title">商品详情</text>
          <view class="header-actions">
            <slot name="header-actions"></slot>
          </view>
        </view>
      </view>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 商品图片轮播区域 -->
      <section class="product-images-section">
        <slot name="product-images"></slot>
      </section>

      <!-- 商品基本信息区域 -->
      <section class="product-info-section">
        <slot name="product-info"></slot>
      </section>

      <!-- 卖家信息区域 -->
      <section class="seller-info-section">
        <slot name="seller-info"></slot>
      </section>

      <!-- 商品描述区域 -->
      <section class="product-description-section">
        <slot name="product-description"></slot>
      </section>

      <!-- 评论区域 -->
      <section class="reviews-section">
        <slot name="reviews"></slot>
      </section>
    </main>

    <!-- 底部操作栏 -->
    <footer class="bottom-actions">
      <slot name="bottom-actions"></slot>
    </footer>
  </view>
</template>

<script setup lang="ts">
import BackButton from '@/components/common/BackButton.vue';

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
  --status-bar-height: 20px;
}

.product-detail-layout {
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
  min-height: 100vh;
  position: relative;
}

.sticky-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  padding: var(--status-bar-height) 1rem 0 1rem;
  min-height: 64px;
  display: flex;
  align-items: center;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
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
  padding-top: calc(var(--status-bar-height) + 44px + 8px); // 为固定header留出空间
  padding-bottom: 80px; // 为底部操作栏留出空间
}

.product-images-section,
.product-info-section,
.seller-info-section,
.product-description-section,
.reviews-section {
  background-color: var(--background-color);
  margin-bottom: 8px;
  position: relative;
  z-index: 1; // 确保内容在header下方
}

.product-images-section {
  margin-bottom: 0;
  margin-top: 0; // 确保图片区域不会覆盖header
}

.product-info-section,
.seller-info-section,
.product-description-section,
.reviews-section {
  padding: 16px;
  border-bottom: 8px solid var(--surface-color);
}

.reviews-section {
  border-bottom: none;
  margin-bottom: 0;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background-color: var(--background-color);
  border-top: 1px solid var(--border-color);
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

// 响应式设计
@media (max-width: 375px) {
  .header-content {
    padding: 0 12px;
    padding-top: var(--status-bar-height);
  }

  .product-info-section,
  .seller-info-section,
  .product-description-section,
  .reviews-section {
    padding: 12px;
  }

  .bottom-actions {
    padding: 10px 12px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }
}

// 深色模式支持（可选）
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
