/**
 * 微信小程序隐私授权处理工具
 * 处理微信小程序的隐私政策和用户授权
 */

// 隐私授权状态
export interface PrivacyStatus {
  needAuthorization: boolean;
  privacyContractName: string;
}

/**
 * 检查隐私授权状态
 * @returns Promise<PrivacyStatus>
 */
export const checkPrivacyStatus = (): Promise<PrivacyStatus> => {
  return new Promise((resolve) => {
    // #ifdef MP-WEIXIN
    if (wx.getPrivacySetting) {
      wx.getPrivacySetting({
        success: (res) => {
          console.log('🔍 [Privacy] 隐私授权状态:', res);
          resolve({
            needAuthorization: res.needAuthorization,
            privacyContractName: res.privacyContractName || '隐私保护指引'
          });
        },
        fail: (error) => {
          console.error('❌ [Privacy] 获取隐私授权状态失败:', error);
          resolve({
            needAuthorization: false,
            privacyContractName: '隐私保护指引'
          });
        }
      });
    } else {
      // 不支持隐私接口，认为不需要授权
      resolve({
        needAuthorization: false,
        privacyContractName: '隐私保护指引'
      });
    }
    // #endif
    
    // #ifndef MP-WEIXIN
    // 非微信小程序环境，不需要隐私授权
    resolve({
      needAuthorization: false,
      privacyContractName: '隐私保护指引'
    });
    // #endif
  });
};

/**
 * 监听隐私授权需求
 * @param callback 授权回调函数
 */
export const onPrivacyAuthorizationRequired = (callback: (eventInfo: any) => void): void => {
  // #ifdef MP-WEIXIN
  if (wx.onNeedPrivacyAuthorization) {
    console.log('👂 [Privacy] 开始监听隐私授权需求');
    wx.onNeedPrivacyAuthorization(callback);
  }
  // #endif
};

/**
 * 移除隐私授权监听
 * @param callback 要移除的回调函数
 */
export const offPrivacyAuthorizationRequired = (callback?: (eventInfo: any) => void): void => {
  // #ifdef MP-WEIXIN
  if (wx.offNeedPrivacyAuthorization) {
    console.log('🔇 [Privacy] 移除隐私授权监听');
    wx.offNeedPrivacyAuthorization(callback);
  }
  // #endif
};

/**
 * 请求隐私授权
 * @param interfaceName 接口名称
 * @returns Promise<boolean>
 */
export const requirePrivacyAuthorization = (interfaceName: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // #ifdef MP-WEIXIN
    if (wx.requirePrivacyAuthorize) {
      console.log('🔐 [Privacy] 请求隐私授权:', interfaceName);
      wx.requirePrivacyAuthorize({
        interfaceName,
        success: () => {
          console.log('✅ [Privacy] 隐私授权成功:', interfaceName);
          resolve(true);
        },
        fail: (error) => {
          console.error('❌ [Privacy] 隐私授权失败:', interfaceName, error);
          resolve(false);
        }
      });
    } else {
      // 不支持隐私授权接口，认为授权成功
      resolve(true);
    }
    // #endif
    
    // #ifndef MP-WEIXIN
    // 非微信小程序环境，认为授权成功
    resolve(true);
    // #endif
  });
};

/**
 * 显示隐私授权弹窗
 * @param privacyContractName 隐私协议名称
 * @returns Promise<boolean>
 */
export const showPrivacyModal = (privacyContractName: string = '隐私保护指引'): Promise<boolean> => {
  return new Promise((resolve) => {
    uni.showModal({
      title: '隐私授权',
      content: `为了更好地为您提供服务，我们需要获取您的用户信息。请您阅读并同意《${privacyContractName}》后继续使用。`,
      confirmText: '同意',
      cancelText: '拒绝',
      success: (res) => {
        if (res.confirm) {
          console.log('✅ [Privacy] 用户同意隐私授权');
          resolve(true);
        } else {
          console.log('❌ [Privacy] 用户拒绝隐私授权');
          resolve(false);
        }
      },
      fail: () => {
        console.log('❌ [Privacy] 隐私授权弹窗显示失败');
        resolve(false);
      }
    });
  });
};

/**
 * 检查并处理隐私授权
 * @returns Promise<boolean>
 */
export const handlePrivacyAuthorization = async (): Promise<boolean> => {
  try {
    console.log('🔍 [Privacy] 开始处理隐私授权');
    
    const privacyStatus = await checkPrivacyStatus();
    
    if (privacyStatus.needAuthorization) {
      console.log('⚠️ [Privacy] 需要隐私授权');
      
      // 显示隐私授权弹窗
      const userAgreed = await showPrivacyModal(privacyStatus.privacyContractName);
      
      if (!userAgreed) {
        console.log('❌ [Privacy] 用户拒绝隐私授权');
        return false;
      }
      
      // 请求getUserProfile接口的隐私授权
      const authorized = await requirePrivacyAuthorization('getUserProfile');
      
      if (!authorized) {
        console.log('❌ [Privacy] getUserProfile隐私授权失败');
        return false;
      }
    }
    
    console.log('✅ [Privacy] 隐私授权处理完成');
    return true;
  } catch (error) {
    console.error('❌ [Privacy] 隐私授权处理失败:', error);
    return false;
  }
};

/**
 * 初始化隐私授权监听
 */
export const initPrivacyListener = (): void => {
  console.log('🚀 [Privacy] 初始化隐私授权监听');
  
  onPrivacyAuthorizationRequired((eventInfo) => {
    console.log('📢 [Privacy] 收到隐私授权需求:', eventInfo);
    
    // 可以在这里处理特定的隐私授权需求
    if (eventInfo && eventInfo.interfaceName) {
      console.log('🔐 [Privacy] 需要授权的接口:', eventInfo.interfaceName);
    }
  });
};

/**
 * 清理隐私授权监听
 */
export const cleanupPrivacyListener = (): void => {
  console.log('🧹 [Privacy] 清理隐私授权监听');
  offPrivacyAuthorizationRequired();
};
