/**
 * 用户信息存储管理工具
 * 统一管理用户信息的本地存储和获取
 */

import type { AppUserInfo, WechatUserInfo } from '@/api/types/userTypes';
import { getToken } from './auth';

const APP_USER_INFO_KEY = 'app_user_info';

/**
 * 保存应用用户信息到本地存储
 * @param userInfo 应用用户信息
 */
export const saveAppUserInfo = (userInfo: AppUserInfo): void => {
  try {
    console.log('💾 [UserStorage] 保存应用用户信息:', userInfo);
    uni.setStorageSync(APP_USER_INFO_KEY, userInfo);
  } catch (error) {
    console.error('❌ [UserStorage] 保存用户信息失败:', error);
  }
};

/**
 * 从本地存储获取应用用户信息
 * @returns AppUserInfo | null
 */
export const getAppUserInfo = (): AppUserInfo | null => {
  try {
    const userInfo = uni.getStorageSync(APP_USER_INFO_KEY);
    if (userInfo) {
      console.log('📱 [UserStorage] 获取应用用户信息:', userInfo);
      return userInfo as AppUserInfo;
    }
    return null;
  } catch (error) {
    console.error('❌ [UserStorage] 获取用户信息失败:', error);
    return null;
  }
};

/**
 * 清除本地存储的应用用户信息
 */
export const clearAppUserInfo = (): void => {
  try {
    uni.removeStorageSync(APP_USER_INFO_KEY);
    console.log('🗑️ [UserStorage] 已清除应用用户信息');
  } catch (error) {
    console.error('❌ [UserStorage] 清除用户信息失败:', error);
  }
};

/**
 * 更新微信用户信息到应用用户信息
 * @param wechatUserInfo 微信用户信息
 */
export const updateWechatUserInfo = (wechatUserInfo: WechatUserInfo): void => {
  console.log('🔄 [UserStorage] 更新微信用户信息到应用用户信息');
  
  // 获取现有的应用用户信息
  let appUserInfo = getAppUserInfo();
  
  // 如果没有现有信息，创建新的
  if (!appUserInfo) {
    appUserInfo = {
      nickName: '',
      avatarUrl: '',
      gender: 0,
      country: '',
      province: '',
      city: '',
      language: '',
      isLoggedIn: false,
      updateTime: 0
    };
  }
  
  // 更新微信相关信息
  appUserInfo.nickName = wechatUserInfo.nickName;
  appUserInfo.avatarUrl = wechatUserInfo.avatarUrl;
  appUserInfo.gender = wechatUserInfo.gender;
  appUserInfo.country = wechatUserInfo.country;
  appUserInfo.province = wechatUserInfo.province;
  appUserInfo.city = wechatUserInfo.city;
  appUserInfo.language = wechatUserInfo.language;
  appUserInfo.updateTime = Date.now();
  
  // 检查是否已登录
  const token = getToken();
  if (token) {
    appUserInfo.isLoggedIn = true;
  }
  
  // 保存更新后的信息
  saveAppUserInfo(appUserInfo);
};

/**
 * 更新登录状态
 * @param isLoggedIn 是否已登录
 * @param userId 用户ID（可选）
 * @param joinDate 加入时间（可选）
 */
export const updateLoginStatus = (isLoggedIn: boolean, userId?: string, joinDate?: string): void => {
  console.log('🔄 [UserStorage] 更新登录状态:', { isLoggedIn, userId, joinDate });
  
  let appUserInfo = getAppUserInfo();
  
  if (!appUserInfo) {
    // 如果没有用户信息，创建基础信息
    appUserInfo = {
      nickName: '',
      avatarUrl: '',
      gender: 0,
      country: '',
      province: '',
      city: '',
      language: '',
      isLoggedIn: false,
      updateTime: Date.now()
    };
  }
  
  // 更新登录相关信息
  appUserInfo.isLoggedIn = isLoggedIn;
  if (userId) {
    appUserInfo.userId = userId;
  }
  if (joinDate) {
    appUserInfo.joinDate = joinDate;
  }
  appUserInfo.updateTime = Date.now();
  
  // 如果退出登录，清除登录相关信息
  if (!isLoggedIn) {
    delete appUserInfo.userId;
    delete appUserInfo.joinDate;
  }
  
  saveAppUserInfo(appUserInfo);
};

/**
 * 检查用户信息是否过期（7天）
 * @param userInfo 应用用户信息
 * @returns boolean
 */
export const isUserInfoExpired = (userInfo: AppUserInfo): boolean => {
  const EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000; // 7天
  const now = Date.now();
  return (now - userInfo.updateTime) > EXPIRE_TIME;
};

/**
 * 获取用户显示名称
 * @param userInfo 应用用户信息
 * @returns string
 */
export const getUserDisplayName = (userInfo: AppUserInfo | null): string => {
  if (!userInfo || !userInfo.nickName) {
    return '未设置昵称';
  }
  return userInfo.nickName;
};

/**
 * 获取用户头像URL
 * @param userInfo 应用用户信息
 * @returns string
 */
export const getUserAvatarUrl = (userInfo: AppUserInfo | null): string => {
  if (!userInfo || !userInfo.avatarUrl) {
    return 'https://via.placeholder.com/96x96/e5e7eb/9ca3af?text=头像';
  }
  return userInfo.avatarUrl;
};

/**
 * 格式化用户性别
 * @param gender 性别代码
 * @returns string
 */
export const formatUserGender = (gender: number): string => {
  switch (gender) {
    case 1:
      return '男';
    case 2:
      return '女';
    default:
      return '未知';
  }
};

/**
 * 格式化用户地区
 * @param userInfo 应用用户信息
 * @returns string
 */
export const formatUserLocation = (userInfo: AppUserInfo): string => {
  const parts = [];
  if (userInfo.country && userInfo.country !== '未知') {
    parts.push(userInfo.country);
  }
  if (userInfo.province && userInfo.province !== '未知') {
    parts.push(userInfo.province);
  }
  if (userInfo.city && userInfo.city !== '未知') {
    parts.push(userInfo.city);
  }
  return parts.length > 0 ? parts.join(' ') : '未知地区';
};

/**
 * 检查是否有完整的用户信息
 * @param userInfo 应用用户信息
 * @returns boolean
 */
export const hasCompleteUserInfo = (userInfo: AppUserInfo | null): boolean => {
  return !!(userInfo && userInfo.nickName && userInfo.avatarUrl);
};

/**
 * 获取用户ID显示
 * @param userInfo 应用用户信息
 * @returns string
 */
export const getUserIdDisplay = (userInfo: AppUserInfo | null): string => {
  if (!userInfo || !userInfo.userId) {
    return '未登录';
  }
  return `ID: ${userInfo.userId}`;
};
