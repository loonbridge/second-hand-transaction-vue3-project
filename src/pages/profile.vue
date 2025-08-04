<template>
  <view class="profile-page">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-content">
        <text class="header-title">我的</text>
        <view class="settings-btn" @click="navigateToSettings">
          <text class="settings-icon">⚙</text>
        </view>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <image
          class="user-avatar"
          :src="userInfo.avatar || defaultAvatar"
          mode="aspectFill"
        ></image>
        <view class="user-info">
          <text class="user-name">{{ userInfo.name || 'Emily Chen' }}</text>
          <text class="user-id">ID: {{ userInfo.id || '12345678' }}</text>
        </view>
      </view>

      <!-- 功能菜单第一组 -->
      <view class="menu-section">
        <view class="menu-item" @click="navigateToPurchases">
          <view class="menu-icon purchase-icon">
            <text class="icon-text">📦</text>
          </view>
          <text class="menu-text">我的购买</text>
          <text class="arrow-icon">›</text>
        </view>

        <view class="menu-item" @click="navigateToPublished">
          <view class="menu-icon publish-icon">
            <text class="icon-text">➕</text>
          </view>
          <text class="menu-text">我的发布</text>
          <text class="arrow-icon">›</text>
        </view>

        <view class="menu-item" @click="navigateToFavorites">
          <view class="menu-icon favorite-icon">
            <text class="icon-text">🔖</text>
          </view>
          <text class="menu-text">我的收藏</text>
          <text class="arrow-icon">›</text>
        </view>

        <view class="menu-item" @click="navigateToHistory">
          <view class="menu-icon history-icon">
            <text class="icon-text">🕐</text>
          </view>
          <text class="menu-text">浏览历史</text>
          <text class="arrow-icon">›</text>
        </view>
      </view>

      <!-- 功能菜单第二组 -->
      <view class="menu-section">
        <view class="menu-item" @click="navigateToFAQ">
          <view class="menu-icon faq-icon">
            <text class="icon-text">❓</text>
          </view>
          <text class="menu-text">常见问题</text>
          <text class="arrow-icon">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { clearLoginInfo, navigateToLogin } from '@/utils/auth';
import { reactive } from 'vue';

// 用户信息数据
const userInfo = reactive({
  name: 'Emily Chen',
  id: '12345678',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACAcS620OuQ7teNZGC55c1Idr2sk7cB2kjdnfro4zfHBxOtiUJZBwAT0HA8RzySaPXtILMlFcw09RwPl_6nfWWjKlUzj54uzhlGTo4GErbPTVezOnZz9ajeJadcr15M5aiSAHiJgWPpKjH8Bp1cbZyep51uhi0x1jHN9JUbYo6D6tJLJbBDDdkBotihhVgXepIMC4u19aOam493p1LL7vt8G5umfYm_yjWzF8UTkSOy6jbW-PYpW7m_RniQZulINT0MCjYCCNa4d0'
});

// 默认头像
const defaultAvatar = 'https://via.placeholder.com/96';

// 导航到我的购买
const navigateToPurchases = () => {
  uni.navigateTo({
    url: '/pages/order_manage'
  });
};

// 导航到我的发布
const navigateToPublished = () => {
  uni.navigateTo({
    url: '/pages/my_published'
  });
};

// 导航到我的收藏
const navigateToFavorites = () => {
  uni.navigateTo({
    url: '/pages/my_favorites'
  });
};

// 导航到浏览历史
const navigateToHistory = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  });
};

// 导航到常见问题
const navigateToFAQ = () => {
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
.profile-page {
  min-height: 100vh;
  background-color: #f9fafb;
  font-family: 'Inter', 'Noto Sans', sans-serif;
}

/* 顶部导航栏 */
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  padding: 16px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:active {
    background-color: #f3f4f6;
  }
}

.settings-icon {
  font-size: 24px;
  color: #6b7280;
}

/* 主要内容区域 */
.main-content {
  padding: 16px;
}

/* 用户信息卡片 */
.user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.user-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 4px solid #dce8f3;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.user-info {
  text-align: center;
}

.user-name {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.user-id {
  display: block;
  font-size: 14px;
  color: #6b7280;
}

/* 功能菜单 */
.menu-section {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 24px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: #f9fafb;
  }
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #dce8f3;
  margin-right: 16px;
  flex-shrink: 0;
}

.icon-text {
  font-size: 24px;
  color: #6b7280;
}

.menu-text {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

.arrow-icon {
  font-size: 20px;
  color: #9ca3af;
}
</style>