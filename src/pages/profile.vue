<template>
  <view class="profile-page">
    <!-- 头部区域 -->
    <view class="header-section">
      <view class="user-info">
        <image class="avatar" src="https://via.placeholder.com/80" mode="aspectFill"></image>
        <view class="user-details">
          <text class="username">用户昵称</text>
          <text class="user-desc">这个人很懒，什么都没留下</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @click="navigateToOrders">
        <uni-icons type="list" size="24" color="#0b80ee"></uni-icons>
        <text class="menu-text">我的订单</text>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>

      <view class="menu-item" @click="navigateToFavorites">
        <uni-icons type="heart" size="24" color="#0b80ee"></uni-icons>
        <text class="menu-text">我的收藏</text>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>

      <view class="menu-item" @click="navigateToSettings">
        <uni-icons type="gear" size="24" color="#0b80ee"></uni-icons>
        <text class="menu-text">设置</text>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { clearLoginInfo, navigateToLogin } from '@/utils/auth';

// 导航到订单页面
const navigateToOrders = () => {
  uni.navigateTo({
    url: '/pages/order_manage'
  });
};

// 导航到收藏页面
const navigateToFavorites = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  });
};

// 导航到设置页面
const navigateToSettings = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  });
};

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        clearLoginInfo();
        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        });

        setTimeout(() => {
          navigateToLogin();
        }, 1500);
      }
    }
  });
};
</script>

<style scoped lang="scss">
:root {
  --primary-color: #0b80ee;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --background-color: #ffffff;
  --surface-color: #f9fafb;
  --border-color: #e5e7eb;
}

.profile-page {
  min-height: 100vh;
  background-color: var(--surface-color);
  padding-bottom: 20px; // 适配原生tabBar
}

.header-section {
  background-color: var(--background-color);
  padding: 2rem 1rem;
  margin-bottom: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.username {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.user-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.menu-section {
  background-color: var(--background-color);
  margin-bottom: 1rem;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  gap: 1rem;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: var(--surface-color);
  }
}

.menu-text {
  flex: 1;
  font-size: 1rem;
  color: var(--text-primary);
}

.logout-section {
  padding: 1rem;
}

.logout-btn {
  width: 100%;
  height: 48px;
  background-color: #ff4757;
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;

  &:active {
    opacity: 0.8;
  }
}
</style>