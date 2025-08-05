<template>
  <LoginPageLayout>
    <!-- Header Slot: 登录标题 -->
    <template #header>
      <view class="login-header">
        <text class="login-title">欢迎来到二手优选</text>
        <!-- <text class="login-subtitle">请使用微信账号登录</text> -->
      </view>
    </template>

    <!-- Content Slot: 登录内容 -->
    <template #content>
      <view class="login-content">
        <!-- Logo区域 -->
        <view class="logo-section">
          <view class="logo-container">
            <uni-icons type="shop" size="80" color="#0b80ee"></uni-icons>
          </view>
          <text class="app-name">二手优选</text>
          <text class="app-slogan">让闲置物品重新焕发价值</text>
        </view>

        <!-- 登录按钮区域 -->
        <view class="login-section">
          <button
            class="wechat-login-btn"
            @click="handleWechatLogin"
            :loading="isLoading"
            :disabled="isLoading"
          >
            <uni-icons type="weixin" size="24" color="#ffffff" style="margin-right: 8px;"></uni-icons>
            {{ isLoading ? '登录中...' : '微信一键登录' }}
          </button>


        </view>

        <!-- 服务条款 -->
        <view class="terms-section">
          <text class="terms-text">
            登录即表示您同意我们的
            <text class="terms-link" @click="showTerms">《用户协议》</text>
            和
            <text class="terms-link" @click="showPrivacy">《隐私政策》</text>
          </text>
        </view>
      </view>
    </template>
  </LoginPageLayout>
</template>

<script setup lang="ts">
import { login } from '@/api/authApi';
import type { LoginResponse } from '@/api/types/authTypes';
import LoginPageLayout from '@/components/layout/LoginPageLayout.vue';

import { navigateToHome, saveLoginInfo } from '@/utils/auth';
import { ref } from 'vue';

// 响应式数据
const isLoading = ref(false);

// 微信登录处理
const handleWechatLogin = async () => {
  if (isLoading.value) return;

  console.log('👆 [Login] 用户点击微信登录');
  isLoading.value = true;

  try {
    // 调用登录API（内部会自动获取微信code和用户信息）
    console.log('🔄 [Login] 开始登录流程');
    const response: LoginResponse = await login();

    console.log('✅ [Login] 登录API调用成功:', {
      hasToken: !!response.token,
      hasUser: !!response.user,
      hasWechatUserInfo: !!(response as any).wechatUserInfo,
      userId: response.user?.userId,
      nickname: response.user?.nickname
    });

    // 登录成功，保存token和用户信息
    saveLoginInfo(response);

    // 显示成功提示
    uni.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 2000
    });

    console.log('🎉 [Login] 登录成功，准备跳转到首页');

    // 延迟跳转到首页
    setTimeout(() => {
      navigateToHome();
    }, 1500);

  } catch (error: any) {
    console.error('❌ [Login] 登录失败:', error);

    // 根据错误类型显示不同的提示
    let errorMessage = '登录失败，请重试';

    if (error.message) {
      if (error.message.includes('用户拒绝授权')) {
        errorMessage = '需要授权才能登录，请重试';
      } else if (error.message.includes('网络')) {
        errorMessage = '网络连接失败，请检查网络';
      } else if (error.message.includes('隐私')) {
        errorMessage = '请同意隐私政策后重试';
      } else {
        errorMessage = error.message;
      }
    }

    // 显示错误信息
    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000
    });
  } finally {
    isLoading.value = false;
  }
};



// 显示用户协议
const showTerms = () => {
  uni.showModal({
    title: '用户协议',
    content: '这里是用户协议内容...',
    showCancel: false
  });
};

// 显示隐私政策
const showPrivacy = () => {
  uni.showModal({
    title: '隐私政策',
    content: '这里是隐私政策内容...',
    showCancel: false
  });
};
</script>

<style scoped lang="scss">
// 使用项目主题色彩变量
:root {
  --primary-color: #0b80ee;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --background-color: #ffffff;
  --surface-color: #f9fafb;
  --border-color: #e5e7eb;
}

.login-header {
  text-align: center;
  padding: 2rem 0 1rem 0;
}

.login-title {
  display: block;
  font-size: 1.75rem; // 28px
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}
/*
.login-subtitle {
  display: block;
  font-size: 1rem; // 16px
  color: var(--text-secondary);
}

*/

.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 2rem;
  min-height: 60vh;
  justify-content: space-between;
}

.logo-section {
  text-align: center;
  margin-top: 3rem;
}

.logo-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--surface-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  border: 2px solid var(--border-color);
}

.app-name {
  display: block;
  font-size: 1.5rem; // 24px
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.app-slogan {
  display: block;
  font-size: 0.875rem; // 14px
  color: var(--text-secondary);
}

.login-section {
  width: 100%;
  margin: 2rem 0;
}

.wechat-login-btn {
  width: 100%;
  height: 48px;
  background-color: var(--primary-color);
  color: #ffffff;
  border: none;
  border-radius: 0.75rem; // 12px
  font-size: 1rem; // 16px
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;

  &:disabled {
    opacity: 0.6;
  }

  &:active {
    background-color: #0969da;
  }
}



.terms-section {
  text-align: center;
  margin-bottom: 2rem;
}

.terms-text {
  font-size: 0.75rem; // 12px
  color: var(--text-secondary);
  line-height: 1.5;
}

.terms-link {
  color: var(--primary-color);
  text-decoration: underline;
}
</style>
