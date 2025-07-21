<template>
  <!-- The main layout container, styled to match the prototype's body -->
  <view class="home-layout">
    <!-- A single sticky header containing both the title bar and search bar, with a backdrop blur effect -->
    <header class="sticky-header">
      <view class="header-slot">
        <slot name="header"></slot>
      </view>
      <view class="search-slot">
        <slot name="search"></slot>
      </view>
    </header>

    <!-- The main content area -->
    <main class="content-slot">
        <view>
            <slot name="category"></slot>
        </view>

        <view>

            <slot name="product"></slot>
        </view>
        </main>
  </view>
</template>

<script setup lang="ts">
// No script changes needed
</script>

<style lang="scss" scoped>
// CSS variables from the prototype for consistent styling
:root {
  --background-color: #ffffff;
  --surface-color: #f9fafb;
  --border-color: #e5e7eb;
  --status-bar-height: 10px;
}

.home-layout {
  display: flex;
  flex-direction: column;
  background-color: var(--background-color); // Page background is white
  min-height: 100vh;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.8); // white with 80% opacity
  backdrop-filter: blur(4px); // Blur effect for content scrolling underneath
  padding: 0 1rem; // 16px horizontal padding
//   padding-top: var(--status-bar-height); // Accommodate device status bar
}

.search-slot {
    padding-top:1rem;
  padding-bottom: 0.75rem; // 12px bottom padding
//   margin-top: 2rem;
}

.content-slot {
  padding: 0 1rem; // 16px horizontal padding
}
</style>