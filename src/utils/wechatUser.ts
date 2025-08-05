/**
 * 微信小程序用户信息管理工具
 * 封装微信小程序获取用户信息的API调用
 */

// 微信用户信息接口
export interface WechatUserInfo {
  nickName: string;
  avatarUrl: string;
  gender: number; // 0: 未知, 1: 男, 2: 女
  country: string;
  province: string;
  city: string;
  language: string;
}

// 获取用户信息的响应接口
export interface GetUserProfileResponse {
  userInfo: WechatUserInfo;
  rawData: string;
  signature: string;
  encryptedData: string;
  iv: string;
  cloudID?: string;
  errMsg: string;
}

// 存储的用户信息接口
export interface StoredUserInfo {
  nickName: string;
  avatarUrl: string;
  gender: number;
  country: string;
  province: string;
  city: string;
  language: string;
  updateTime: number; // 更新时间戳
}

const STORAGE_KEY = 'wechat_user_info';

/**
 * 获取微信用户信息
 * @param desc 获取用户信息的目的描述
 * @returns Promise<WechatUserInfo>
 */
export const getWechatUserProfile = async (desc: string = '获取用户信息'): Promise<WechatUserInfo> => {
  console.log('🔍 [WechatUser] 开始获取微信用户信息');

  // 检查是否支持 getUserProfile
  if (!uni.getUserProfile) {
    console.error('❌ [WechatUser] 当前环境不支持 getUserProfile');
    throw new Error('当前环境不支持获取用户信息');
  }

  // 处理隐私授权（仅在微信小程序环境）
  if (isWechatMiniProgram()) {
    try {
      const { handlePrivacyAuthorization } = await import('./privacy');
      const privacyAuthorized = await handlePrivacyAuthorization();

      if (!privacyAuthorized) {
        throw new Error('隐私授权失败，无法获取用户信息');
      }
    } catch (error) {
      console.error('❌ [WechatUser] 隐私授权处理失败:', error);
      // 继续尝试获取用户信息，可能不需要隐私授权
    }
  }

  return new Promise((resolve, reject) => {
    uni.getUserProfile({
      desc: desc,
      success: (res: GetUserProfileResponse) => {
        console.log('✅ [WechatUser] 获取用户信息成功:', res);

        const userInfo = res.userInfo;
        console.log('👤 [WechatUser] 用户信息详情:', {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          gender: userInfo.gender,
          country: userInfo.country,
          province: userInfo.province,
          city: userInfo.city
        });

        // 保存用户信息到本地存储
        saveUserInfoToStorage(userInfo);

        resolve(userInfo);
      },
      fail: (error: any) => {
        console.error('❌ [WechatUser] 获取用户信息失败:', error);

        if (error.errMsg && error.errMsg.includes('getUserProfile:fail can only be invoked by user TAP gesture')) {
          reject(new Error('请点击按钮获取用户信息'));
        } else if (error.errMsg && error.errMsg.includes('getUserProfile:fail auth deny')) {
          reject(new Error('用户拒绝授权'));
        } else {
          reject(new Error(error.errMsg || '获取用户信息失败'));
        }
      }
    });
  });
};

/**
 * 保存用户信息到本地存储
 * @param userInfo 用户信息
 */
export const saveUserInfoToStorage = (userInfo: WechatUserInfo): void => {
  try {
    const storedInfo: StoredUserInfo = {
      ...userInfo,
      updateTime: Date.now()
    };
    
    uni.setStorageSync(STORAGE_KEY, storedInfo);
    console.log('💾 [WechatUser] 用户信息已保存到本地存储');
  } catch (error) {
    console.error('❌ [WechatUser] 保存用户信息失败:', error);
  }
};

/**
 * 从本地存储获取用户信息
 * @returns StoredUserInfo | null
 */
export const getUserInfoFromStorage = (): StoredUserInfo | null => {
  try {
    const userInfo = uni.getStorageSync(STORAGE_KEY);
    if (userInfo) {
      console.log('📱 [WechatUser] 从本地存储获取用户信息:', userInfo);
      return userInfo as StoredUserInfo;
    }
    return null;
  } catch (error) {
    console.error('❌ [WechatUser] 获取本地用户信息失败:', error);
    return null;
  }
};

/**
 * 清除本地存储的用户信息
 */
export const clearUserInfoFromStorage = (): void => {
  try {
    uni.removeStorageSync(STORAGE_KEY);
    console.log('🗑️ [WechatUser] 已清除本地用户信息');
  } catch (error) {
    console.error('❌ [WechatUser] 清除用户信息失败:', error);
  }
};

/**
 * 检查用户信息是否过期（7天）
 * @param userInfo 存储的用户信息
 * @returns boolean
 */
export const isUserInfoExpired = (userInfo: StoredUserInfo): boolean => {
  const EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000; // 7天
  const now = Date.now();
  return (now - userInfo.updateTime) > EXPIRE_TIME;
};

/**
 * 获取用户信息（优先从本地获取，过期则重新获取）
 * @param desc 获取用户信息的目的描述
 * @param forceRefresh 是否强制刷新
 * @returns Promise<WechatUserInfo>
 */
export const getUserInfo = async (desc: string = '获取用户信息', forceRefresh: boolean = false): Promise<WechatUserInfo> => {
  console.log('🔍 [WechatUser] 获取用户信息，强制刷新:', forceRefresh);
  
  // 如果不强制刷新，先尝试从本地获取
  if (!forceRefresh) {
    const storedInfo = getUserInfoFromStorage();
    if (storedInfo && !isUserInfoExpired(storedInfo)) {
      console.log('✅ [WechatUser] 使用本地缓存的用户信息');
      return {
        nickName: storedInfo.nickName,
        avatarUrl: storedInfo.avatarUrl,
        gender: storedInfo.gender,
        country: storedInfo.country,
        province: storedInfo.province,
        city: storedInfo.city,
        language: storedInfo.language
      };
    }
  }
  
  // 从微信API获取最新信息
  console.log('🔄 [WechatUser] 从微信API获取最新用户信息');
  return await getWechatUserProfile(desc);
};

/**
 * 检查是否在微信小程序环境
 * @returns boolean
 */
export const isWechatMiniProgram = (): boolean => {
  // #ifdef MP-WEIXIN
  return true;
  // #endif
  
  // #ifndef MP-WEIXIN
  return false;
  // #endif
};

/**
 * 格式化性别显示
 * @param gender 性别代码
 * @returns string
 */
export const formatGender = (gender: number): string => {
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
 * 获取用户地区信息
 * @param userInfo 用户信息
 * @returns string
 */
export const formatLocation = (userInfo: WechatUserInfo): string => {
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
