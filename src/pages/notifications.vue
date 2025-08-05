<template>
  <view class="page-root">
    <!-- 顶部导航栏 & Tab 切换 -->
    <view class="header">
      <view class="header-inner">
        <view class="header-spacer" />
        <text class="title">消息</text>
        <view class="header-actions">
          <text 
            v-if="hasUnreadMessages" 
            class="mark-all-read-btn"
            @click="handleMarkAllAsRead"
          >
            全部已读
          </text>
          <button class="settings-btn" @click="onSettings">
            <span class="material-symbols-outlined">settings</span>
          </button>
        </view>
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
          <view 
            v-if="getUnreadCount(tab) > 0" 
            class="tab-badge"
          >
            {{ getUnreadCount(tab) }}
          </view>
        </text>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view 
      class="message-list" 
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="handleRefresh"
      @scrolltolower="handleLoadMore"
    >
      <!-- 加载状态 -->
      <view v-if="isLoading && notifications.length === 0" class="loading-container">
        <uni-load-more status="loading"></uni-load-more>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!isLoading && filteredNotifications.length === 0" class="empty-container">
        <view class="empty-icon">📭</view>
        <text class="empty-text">暂无{{ currentTab === '所有' ? '' : currentTab }}</text>
      </view>

      <!-- 消息列表 -->
      <view v-else>
        <view
            v-for="notification in filteredNotifications"
            :key="notification.notificationId"
            class="message-item"
            :class="{ 'unread': !notification.isRead }"
            @click="handleNotificationClick(notification)"
            @longpress="handleNotificationLongPress(notification)"
        >
          <view class="message-inner">
            <view
                class="icon"
                :class="notification.type === 'system' ? 'icon-system' : 'icon-trade'"
            >
              <uni-icons
                  :type="notification.type === 'system' ? 'notifications' : 'inventory_2'"
                  size="24"
              />
            </view>
            <view class="message-content">
              <view class="message-header">
                <text class="message-title">{{ notification.title }}</text>
                <text class="message-time">{{ formatTime(notification.createdAt) }}</text>
              </view>
              <text class="message-text">{{ notification.content }}</text>
            </view>
            <view v-if="!notification.isRead" class="unread-badge" />
          </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="hasMore" class="load-more-container">
          <uni-load-more 
            :status="isLoadingMore ? 'loading' : 'more'" 
            @clickLoadMore="handleLoadMore"
          ></uni-load-more>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '@/api/notificationsApi';
import type { Notification } from '@/api/types/notificationTypes';
import {
  updateUnreadCount,
  decreaseUnreadCount,
  clearUnreadCount
} from '@/utils/notificationUtils';

// 响应式数据
const tabs = ['所有', '系统消息', '交易消息'];
const currentTab = ref('所有');
const notifications = ref<Notification[]>([]);
const isLoading = ref(false);
const isRefreshing = ref(false);
const isLoadingMore = ref(false);
const hasMore = ref(true);
const currentPage = ref(0);
const pageSize = 20;

// 计算属性
const filteredNotifications = computed(() => {
  if (currentTab.value === '所有') {
    return notifications.value;
  }
  
  const typeMap = {
    '系统消息': 'system',
    '交易消息': 'transaction'
  };
  
  const targetType = typeMap[currentTab.value as keyof typeof typeMap];
  return notifications.value.filter(n => n.type === targetType);
});

const hasUnreadMessages = computed(() => {
  return notifications.value.some(n => !n.isRead);
});

// 获取未读消息数量
const getUnreadCount = (tab: string) => {
  if (tab === '所有') {
    return notifications.value.filter(n => !n.isRead).length;
  }
  
  const typeMap = {
    '系统消息': 'system',
    '交易消息': 'transaction'
  };
  
  const targetType = typeMap[tab as keyof typeof typeMap];
  return notifications.value.filter(n => n.type === targetType && !n.isRead).length;
};

// 加载消息列表
const loadNotifications = async (isRefresh = false) => {
  try {
    if (isRefresh) {
      isRefreshing.value = true;
      currentPage.value = 0;
      hasMore.value = true;
    } else if (currentPage.value === 0) {
      isLoading.value = true;
    } else {
      isLoadingMore.value = true;
    }

    console.log('📥 [Notifications] 加载消息列表:', {
      page: currentPage.value,
      size: pageSize,
      isRefresh
    });

    const response = await getNotifications({
      page: currentPage.value,
      size: pageSize
    });

    console.log('📥 [Notifications] 消息列表响应:', response);

    if (isRefresh || currentPage.value === 0) {
      notifications.value = response.items;
    } else {
      notifications.value.push(...response.items);
    }

    hasMore.value = response.items.length === pageSize;
    currentPage.value++;

    // 更新未读消息数量
    const unreadCount = notifications.value.filter(n => !n.isRead).length;
    updateUnreadCount(unreadCount);

  } catch (error: any) {
    console.error('❌ [Notifications] 加载消息失败:', error);
    uni.showToast({
      title: error.message || '加载消息失败',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
    isRefreshing.value = false;
    isLoadingMore.value = false;
  }
};

// 切换标签
const selectTab = (tab: string) => {
  console.log('🏷️ [Notifications] 切换标签:', tab);
  currentTab.value = tab;
};

// 下拉刷新
const handleRefresh = () => {
  console.log('🔄 [Notifications] 下拉刷新');
  loadNotifications(true);
};

// 加载更多
const handleLoadMore = () => {
  if (!hasMore.value || isLoadingMore.value) return;
  console.log('📄 [Notifications] 加载更多');
  loadNotifications(false);
};

// 点击消息
const handleNotificationClick = async (notification: Notification) => {
  console.log('👆 [Notifications] 点击消息:', notification);
  
  // 如果未读，标记为已读
  if (!notification.isRead) {
    try {
      await markNotificationAsRead(notification.notificationId);
      notification.isRead = true;
      decreaseUnreadCount(1); // 减少未读消息数量
      console.log('✅ [Notifications] 消息已标记为已读');
    } catch (error: any) {
      console.error('❌ [Notifications] 标记已读失败:', error);
    }
  }
  
  // TODO: 根据消息类型跳转到相应页面
};

// 长按消息
const handleNotificationLongPress = (notification: Notification) => {
  console.log('👆 [Notifications] 长按消息:', notification);
  
  uni.showActionSheet({
    itemList: ['删除消息'],
    success: async (res) => {
      if (res.tapIndex === 0) {
        try {
          await deleteNotification(notification.notificationId);
          notifications.value = notifications.value.filter(
            n => n.notificationId !== notification.notificationId
          );
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });
        } catch (error: any) {
          console.error('❌ [Notifications] 删除消息失败:', error);
          uni.showToast({
            title: error.message || '删除失败',
            icon: 'none'
          });
        }
      }
    }
  });
};

// 全部标记为已读
const handleMarkAllAsRead = async () => {
  try {
    console.log('✅ [Notifications] 全部标记为已读');
    await markAllNotificationsAsRead();
    
    // 更新本地状态
    notifications.value.forEach(n => {
      n.isRead = true;
    });

    // 清空未读消息数量
    clearUnreadCount();

    uni.showToast({
      title: '全部已读',
      icon: 'success'
    });
  } catch (error: any) {
    console.error('❌ [Notifications] 全部标记已读失败:', error);
    uni.showToast({
      title: error.message || '操作失败',
      icon: 'none'
    });
  }
};

// 格式化时间
const formatTime = (timeStr: string) => {
  const date = new Date(timeStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`;
  }
  
  // 小于1天
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
  }
  
  // 大于1天，显示具体日期
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function onSettings() {
  // 跳转到"个人中心"
  uni.switchTab({ url: '/pages/profile' });
}

// 组件挂载时加载数据
onMounted(() => {
  console.log('🚀 [Notifications] 消息页面挂载');
  loadNotifications();
});
</script>

<style scoped>
.page-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
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
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  flex: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mark-all-read-btn {
  font-size: 14px;
  color: #0b80ee;
  padding: 4px 8px;
}

.settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  color: #6b7280;
}

.tabs {
  display: flex;
  justify-content: space-around;
  padding: 0 16px;
  border-bottom: 1px solid #e5e7eb;
}

.tab-item {
  position: relative;
  padding: 12px 4px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.tab-item.active {
  color: #0b80ee;
  border-bottom-color: #0b80ee;
}

.tab-badge {
  position: absolute;
  top: 4px;
  right: -8px;
  background-color: #ef4444;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.message-list {
  flex: 1;
  padding: 0;
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #9ca3af;
}

.message-item {
  background-color: white;
  border-bottom: 1px solid #f3f4f6;
  padding: 16px;
  cursor: pointer;
}

.message-item:hover {
  background-color: #f9fafb;
}

.message-item.unread {
  background-color: #fef3f2;
}

.message-inner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
}

.icon-system {
  background-color: #dbeafe;
  color: #3b82f6;
}

.icon-trade {
  background-color: #d1fae5;
  color: #10b981;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.message-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
}

.message-time {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
  margin-left: 8px;
}

.message-text {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  word-break: break-word;
}

.unread-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
}

.load-more-container {
  padding: 20px;
}
</style>
