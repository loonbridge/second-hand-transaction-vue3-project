/**
 * 认证相关工具函数
 */

import type { LoginResponse } from '@/api/types/authTypes';
import type { WechatUserInfo } from '@/api/types/userTypes';
import { updateLoginStatus, updateWechatUserInfo } from './userStorage';

/**
 * 保存登录信息到本地存储
 * @param loginResponse 登录响应数据
 */
export const saveLoginInfo = (loginResponse: LoginResponse) => {
  try {
    console.log('💾 [Auth] 开始保存登录信息');

    // 保存token和基础用户信息
    uni.setStorageSync('token', loginResponse.token);
    uni.setStorageSync('userInfo', loginResponse.user);

    console.log('✅ [Auth] 基础登录信息已保存:', {
      hasToken: !!loginResponse.token,
      userId: loginResponse.user?.userId,
      nickname: loginResponse.user?.nickname
    });

    // 更新应用用户信息的登录状态
    updateLoginStatus(
      true,
      loginResponse.user?.userId,
      loginResponse.user?.joinDate
    );

    // 如果有微信用户信息，也保存到应用用户信息中
    const wechatUserInfo = (loginResponse as any).wechatUserInfo as WechatUserInfo;
    if (wechatUserInfo) {
      console.log('📱 [Auth] 保存微信用户信息:', {
        nickName: wechatUserInfo.nickName,
        hasAvatar: !!wechatUserInfo.avatarUrl,
        gender: wechatUserInfo.gender,
        location: `${wechatUserInfo.country} ${wechatUserInfo.province} ${wechatUserInfo.city}`
      });

      updateWechatUserInfo(wechatUserInfo);
    } else {
      console.log('⚠️ [Auth] 没有微信用户信息，仅保存基础登录信息');
    }

    console.log('🎉 [Auth] 所有登录信息保存完成');
  } catch (error) {
    console.error('❌ [Auth] 保存登录信息失败:', error);
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
