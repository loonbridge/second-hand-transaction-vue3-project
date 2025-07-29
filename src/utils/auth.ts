/**
 * 认证相关工具函数
 */

import type { LoginResponse } from '@/api/types/authTypes';

/**
 * 保存登录信息到本地存储
 * @param loginResponse 登录响应数据
 */
export const saveLoginInfo = (loginResponse: LoginResponse) => {
  try {
    uni.setStorageSync('token', loginResponse.token);
    uni.setStorageSync('userInfo', loginResponse.user);
    console.log('登录信息已保存到本地存储');
  } catch (error) {
    console.error('保存登录信息失败:', error);
  }
};

/**
 * 获取存储的token
 * @returns token字符串或null
 */
export const getToken = (): string | null => {
  try {
    return uni.getStorageSync('token') || null;
  } catch (error) {
    console.error('获取token失败:', error);
    return null;
  }
};

/**
 * 获取存储的用户信息
 * @returns 用户信息对象或null
 */
export const getUserInfo = () => {
  try {
    return uni.getStorageSync('userInfo') || null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
};

/**
 * 清除登录信息
 */
export const clearLoginInfo = () => {
  try {
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
    console.log('登录信息已清除');
  } catch (error) {
    console.error('清除登录信息失败:', error);
  }
};

/**
 * 检查是否已登录
 * @returns 是否已登录
 */
export const isLoggedIn = (): boolean => {
  const token = getToken();
  return !!token;
};

/**
 * 跳转到首页
 */
export const navigateToHome = () => {
  uni.switchTab({
    url: '/pages/home',
    fail: (error) => {
      console.error('跳转首页失败:', error);
      // 如果switchTab失败，尝试使用navigateTo
      uni.navigateTo({
        url: '/pages/home'
      });
    }
  });
};

/**
 * 跳转到登录页
 */
export const navigateToLogin = () => {
  uni.navigateTo({
    url: '/pages/login',
    fail: (error) => {
      console.error('跳转登录页失败:', error);
    }
  });
};
