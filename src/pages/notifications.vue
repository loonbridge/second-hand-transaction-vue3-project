<template>
  <view class="page-root">
    <!-- 顶部导航栏 & Tab 切换 -->
    <view class="header">
      <view class="header-inner">
        <view class="header-spacer" />
        <text class="title">消息</text>
        <button class="settings-btn" @click="onSettings">
          <span class="material-symbols-outlined">settings</span>
        </button>
      </view>
      <view class="tabs">
        <text
            v-for="tab in tabs"
            :key="tab"
            class="tab-item"
            :class="{ active: currentTab === tab }"
            @click="selectTab(tab)"
        >
          {{ tab }}
        </text>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view class="message-list" scroll-y>
      <view
          v-for="(msg, idx) in filteredMessages"
          :key="idx"
          class="message-item"
      >
        <view class="message-inner">
          <view
              class="icon"
              :class="msg.type === '系统消息' ? 'icon-system' : 'icon-trade'"
              @click="navigateToProduct(msg.id)"
          >
            <uni-icons
                :type="msg.type === '系统消息' ? 'notifications' : 'inventory_2'"
                size="24"

            />
          </view>
          <view class="message-content">
            <view class="message-header" @click="navigateToProduct(msg.id)">
              <text class="message-type" >{{ msg.type }}</text>
              <text class="message-time">{{ msg.time }}</text>
            </view>
            <text class="message-text">{{ msg.content }}</text>
          </view>
          <view v-if="msg.isNew" class="badge" />
        </view>
      </view>
    </scroll-view>


  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const tabs = ['所有', '系统消息', '交易消息']
const currentTab = ref('所有')

const currentBottom = ref('messages')

const messages = ref([
  { id:0,type: '系统消息', time: '2024-01-01 10:00', content: '您的商品已被下架', isNew: true },
  { id:1,type: '交易消息', time: '2023-12-31 15:30', content: '您的订单已发货', isNew: true },
  { id:2,type: '交易消息', time: '2023-12-30 12:00', content: '您的商品已被购买', isNew: false },
  { id:3,type: '交易消息', time: '2023-12-29 18:45', content: '您的商品已被收货', isNew: false }
])

const filteredMessages = computed(() =>
    currentTab.value === '所有'
        ? messages.value
        : messages.value.filter(m => m.type === currentTab.value)
)

function selectTab(tab: string) {
  currentTab.value = tab
}

function onSettings() {
  // 跳转到“个人中心”
  uni.switchTab({ url: '/pages/product' })
}

function navigate(tab: { name: string; path: string }) {
  currentBottom.value = tab.name
  if (['home', 'publish', 'messages', 'profile'].includes(tab.name)) {
    uni.switchTab({ url: `/${tab.path}` })
  } else {
    uni.navigateTo({ url: `/${tab.path}` })
  }
}
const navigateToProduct = (id: number) => {
  console.log('Navigate to product:', id)
  // uni.navigateTo({
  //   url: `/pages/product/product?id=${id}`
  // })
}
</script>

<style scoped>
.page-root {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
  background-color: #F9FAFB;
  font-family: 'Plus Jakarta Sans', 'Noto Sans', sans-serif;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #FFFFFF;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}
.header-spacer {
  width: 48px;
}
.title {
  flex: 1;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}
.settings-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #E5E7EB;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 0.875rem;
  color: #6B7280;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}
.tab-item.active {
  color: #2563EB;
  border-color: #3B82F6;
  font-weight: 600;
}

/* Message list */
.message-list {
  flex: 1;
}
.message-item {
  background-color: #FFFFFF;
  padding: 16px;
  border-bottom: 1px solid #E5E7EB;
}
.message-inner {
  display: flex;
  gap: 16px;
  position: relative;
}
.icon {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-system {
  background-color: #DBEAFE;
  color: #2563EB;
}
.icon-trade {
  background-color: #CCFBF1;
  color: #14B8A6;
}
.message-content {
  flex: 1;
}
.message-header {
  display: flex;
  justify-content: space-between;
}
.message-type {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}
.message-time {
  font-size: 0.75rem;
  color: #6B7280;
}
.message-text {
  margin-top: 4px;
  font-size: 0.875rem;
  color: #4B5563;
}
.badge {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 8px;
  height: 8px;
  background-color: #3B82F6;
  border-radius: 4px;
}


</style>
