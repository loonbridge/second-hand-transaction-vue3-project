<template>
  <view class="page-root">
    <!-- 顶部导航栏 & Tab 切换 -->
    <view class="header">
      <view class="header-inner">
        <view class="header-spacer" />
        <text class="title" @click="handleCreateNotification">消息</text>
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
          :key="msg.notificationId || idx"
          class="message-item"
      >
        <view class="message-inner">
          <view
              class="icon"
              :class="msg.type === 'system' ? 'icon-system' : 'icon-trade'"
          >
            <uni-icons
                :type="msg.type === 'system' ? 'notifications' : 'inventory_2'"
                size="24"
            />
          </view>
          <view class="message-content" >
            <view class="message-header"
                  @click="navigateToProduct(msg.notificationId,msg.title,msg.content);
                  markAsRead(msg.notificationId)"
                  @longpress="handleDelete(msg.notificationId)" >
              <text class="message-type" >{{ msg.type === 'system' ? '系统消息' : '交易消息' }}</text>
              <text class="message-time">{{ formatRelativeTime(msg.createdAt) }}</text>
            </view>
            <text class="message-text">{{ msg.content }}</text>
          </view>
          <view v-if="!msg.isRead" class="badge" />
        </view>
      </view>
    </scroll-view>

  </view>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {createNotification, deleteNotification, getNotifications, markNotificationAsRead} from '@/api/notificationsApi';
import {getUserIdFromToken} from "@/utils/jwt";
import {getToken} from "@/utils/auth";

// 定义通知对象的类型接口
interface Notification {
  notificationId: string;
  isRead: boolean;
  content: string;
  createdAt: string;
  title: string;
  type: string; // 后端返回 'system' 或 'transaction'
}

const tabs = ['所有', '系统消息', '交易消息']
const currentTab = ref('所有')
const currentBottom = ref('messages')

const messages = ref<Notification[]>([]);

onMounted(() => {
  fetchNotifications();
});

// 获取通知列表
const fetchNotifications = async () => {
  try {
    const data = await getNotifications();
    messages.value = data;
    console.log('获取的消息列表:', messages.value);
  } catch (error) {
    console.error('获取消息失败', error);
    uni.showToast({ title: '获取消息失败', icon: 'none' });
    messages.value = [];
  }
};

// 筛选消息
const filteredMessages = computed(() => {
  if (currentTab.value === '所有') {
    return messages.value;
  }

  const typeMap: Record<string, string> = {
    '系统消息': 'system',
    '交易消息': 'transaction'
  };
  const targetType = typeMap[currentTab.value];
  return messages.value.filter(msg => msg.type === targetType);
});

function selectTab(tab: string) {
  currentTab.value = tab
}

function onSettings() {
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

const navigateToProduct = (id: string, title: string, content: string) => {
  console.log('Navigate to product:', id)
  uni.navigateTo({
    url: `/pages/messagedetails?id=${id}&title=${title}&content=${content}`,
  })
}

// 标记为已读
const markAsRead = async (notificationId: string) => {
  try {
    await markNotificationAsRead(notificationId);
    const msgIndex = messages.value.findIndex(m => m.notificationId === notificationId);
    if (msgIndex !== -1) {
      messages.value[msgIndex].isRead = true;
      uni.showToast({ title: '已标记为已读', icon: 'success' });
    }
  } catch (error) {
    console.error('标记已读失败', error);
    const errorMsg = error instanceof Error ? error.message : '标记失败';
    uni.showToast({ title: errorMsg, icon: 'none' });
  }
};


// 创建通知
const handleCreateNotification = async () => {
  // 1. 获取 token 并检查有效性
  const token = getToken();
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return; // 未登录，终止流程
  }

  // 2. 从 token 解析 userId 并检查
  const userId = getUserIdFromToken(token);
  if (!userId) {
    uni.showToast({ title: '登录状态无效，请重新登录', icon: 'none' });
    return; // userId 解析失败，终止流程
  }

  try {
    // 3. 确保参数完整后调用 API
    await createNotification({
      type: "TRANSACTION",
      title: "商品上架成功",
      content: "您的商品已上架",
      isRead: false,
      userId: userId // 传递有效 userId
    });
    uni.showToast({ title: '通知创建成功', icon: 'success' });
    fetchNotifications(); // 刷新列表
  } catch (error) {
    console.error('创建通知失败', error);
    // 区分后端错误类型（可选）
    const errorMsg = error instanceof Error
        ? error.message
        : '创建通知失败，请稍后重试';
    uni.showToast({ title: errorMsg, icon: 'none' });
  }
};
// 处理删除
const handleDelete = (notificationId: string) => {
  uni.showModal({
    title: '删除消息',
    content: '确定要删除这条消息吗？',
    confirmText: '删除',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        await deleteMessage(notificationId);
      }
    }
  });
};

// 调用删除接口
const deleteMessage = async (notificationId: string) => {
  try {
    await deleteNotification(notificationId);
    // 从本地列表中移除
    messages.value = messages.value.filter(
        msg => msg.notificationId !== notificationId
    );
    uni.showToast({ title: '删除成功', icon: 'success' });
  } catch (error) {
    console.error('删除失败', error);
    const errorMsg = error instanceof Error ? error.message : '删除失败';
    uni.showToast({ title: errorMsg, icon: 'none' });
  }
};

// 格式化时间为相对时间
const formatRelativeTime = (timeStr: string) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (isNaN(date.getTime())) return '未知时间';

  if (diffMins < 1) return '刚刚';
  if (diffHours < 1) return `${diffMins}分钟前`;
  if (diffDays < 1) return `${diffHours}小时前`;
  if (diffDays === 1) return '昨天';
  if (diffDays < 30) return `${diffDays}天前`;

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};
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
  text-align: left;
  padding-left: 110px;
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