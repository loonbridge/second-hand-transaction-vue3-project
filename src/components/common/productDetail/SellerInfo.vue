<template>
  <view class="seller-info">
    <view class="seller-header">
      <text class="section-title">卖家信息</text>
    </view>
    
    <view class="seller-content">
      <!-- 卖家头像和基本信息 -->
      <view class="seller-profile">
        <view class="avatar-container">
          <image 
            :src="seller.avatarUrl || '/static/images/default-avatar.png'" 
            mode="aspectFill" 
            class="seller-avatar"
            @error="handleAvatarError"
          />
        </view>
        
        <view class="seller-details">
          <text class="seller-name">{{ seller.nickname || '匿名用户' }}</text>
          <text class="join-date">{{ formatJoinDate(seller.joinDate) }}</text>
        </view>
        
        <view v-if="!isOwner" class="seller-actions">
          <button
            class="follow-btn"
            :class="{ 'following': isFollowing }"
            @click="handleFollowClick"
          >
            <text class="follow-text">{{ isFollowing ? '已关注' : '关注' }}</text>
          </button>
        </view>
      </view>
      
      <!-- 卖家操作按钮 -->
      <view class="seller-operations">
        <button class="operation-btn" @click="handleViewSellerProducts">
          <uni-icons type="shop" color="#6b7280" size="18"></uni-icons>
          <text class="operation-text">查看更多商品</text>
          <uni-icons type="right" color="#d1d5db" size="14"></uni-icons>
        </button>
        
        <button class="operation-btn" @click="handleContactSeller">
          <uni-icons type="chat" color="#6b7280" size="18"></uni-icons>
          <text class="operation-text">联系卖家</text>
          <uni-icons type="right" color="#d1d5db" size="14"></uni-icons>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { UserSummary } from '@/api/types/userTypes';

// Props
const props = defineProps<{
  seller: UserSummary;
  isFollowing: boolean;
  isOwner?: boolean; // 是否为商品所有者
}>();

// 事件定义
const emit = defineEmits<{
  followClick: [];
  viewSellerProducts: [];
  contactSeller: [];
}>();

// 格式化加入日期
const formatJoinDate = (joinDate: string): string => {
  try {
    const date = new Date(joinDate);
    return `${date.getFullYear()}年${date.getMonth() + 1}月加入`;
  } catch (error) {
    console.error('日期格式化失败:', error);
    return '加入时间未知';
  }
};

// 头像加载失败处理
const handleAvatarError = () => {
  console.log('卖家头像加载失败，使用默认头像');
};

// 关注按钮点击
const handleFollowClick = () => {
  emit('followClick');
};

// 查看卖家更多商品
const handleViewSellerProducts = () => {
  emit('viewSellerProducts');
};

// 联系卖家
const handleContactSeller = () => {
  emit('contactSeller');
};
</script>

<style lang="scss" scoped>
:root {
  --background-color: #ffffff;
  --surface-color: #f9fafb;
  --border-color: #e5e7eb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --primary-color: #0b80ee;
}

.seller-info {
  background-color: var(--background-color);
}

.seller-header {
  padding: 0 0 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.seller-content {
  padding-top: 16px;
}

.seller-profile {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-container {
  margin-right: 12px;
}

.seller-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
}

.seller-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.seller-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.join-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.seller-actions {
  margin-left: 12px;
}

.follow-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  height: 28px;
  border: 1px solid var(--primary-color);
  border-radius: 14px;
  background-color: transparent;
  transition: all 0.2s ease;

  &.following {
    background-color: var(--primary-color);
    
    .follow-text {
      color: #ffffff;
    }
  }

  &:hover {
    background-color: var(--primary-color);
    
    .follow-text {
      color: #ffffff;
    }
  }

  &:active {
    transform: scale(0.95);
  }
}

.follow-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--primary-color);
  transition: color 0.2s ease;
}

.seller-operations {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background-color: var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.operation-btn {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background-color: var(--background-color);
  border: none;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--surface-color);
  }

  &:active {
    background-color: var(--border-color);
  }
}

.operation-text {
  flex: 1;
  margin-left: 12px;
  font-size: 14px;
  color: var(--text-primary);
  text-align: left;
}

// 响应式设计
@media (max-width: 375px) {
  .seller-avatar {
    width: 44px;
    height: 44px;
  }

  .seller-name {
    font-size: 15px;
  }

  .operation-btn {
    padding: 12px 14px;
  }

  .operation-text {
    font-size: 13px;
  }
}
</style>
