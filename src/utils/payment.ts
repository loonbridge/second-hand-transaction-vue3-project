/**
 * 支付相关工具函数
 */

import type { WeChatPayParams } from '@/api/types/orderTypes';

/**
 * 调用微信小程序支付
 * @param payParams 微信支付参数
 * @returns Promise<void>
 */
export const requestWeChatPayment = (payParams: WeChatPayParams): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('调用微信支付:', payParams);

    // 验证支付参数
    if (!validatePayParams(payParams)) {
      const error = new Error('支付参数不完整');
      uni.showToast({
        title: '支付参数错误',
        icon: 'none'
      });
      reject(error);
      return;
    }

    // 根据平台选择不同的支付方式
    // #ifdef MP-WEIXIN
    // 微信小程序支付
    uni.requestPayment({
      timeStamp: payParams.timeStamp,
      nonceStr: payParams.nonceStr,
      package: payParams.packageVal,
      signType: payParams.signType,
      paySign: payParams.paySign,
      success: (res) => {
        console.log('微信小程序支付成功:', res);
        uni.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 2000
        });
        resolve();
      },
      fail: (error) => {
        console.error('微信小程序支付失败:', error);
        handlePaymentError(error);
        reject(error);
      }
    });
    // #endif

    // #ifdef APP-PLUS
    // App端微信支付
    uni.requestPayment({
      provider: 'wxpay',
      orderInfo: {
        appid: payParams.appId,
        noncestr: payParams.nonceStr,
        package: payParams.packageVal,
        partnerid: '', // 需要从后端获取
        prepayid: payParams.packageVal.replace('prepay_id=', ''),
        timestamp: payParams.timeStamp,
        sign: payParams.paySign
      },
      success: (res) => {
        console.log('App微信支付成功:', res);
        uni.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 2000
        });
        resolve();
      },
      fail: (error) => {
        console.error('App微信支付失败:', error);
        handlePaymentError(error);
        reject(error);
      }
    });
    // #endif

    // #ifdef H5
    // H5端暂不支持微信支付，显示提示
    uni.showModal({
      title: '提示',
      content: 'H5端暂不支持微信支付，请在微信小程序中使用',
      showCancel: false
    });
    reject(new Error('H5端不支持微信支付'));
    // #endif
  });
};

/**
 * 处理支付错误
 * @param error 错误信息
 */
const handlePaymentError = (error: any) => {
  console.error('支付错误详情:', error);

  // 处理不同的支付失败情况
  if (error.errMsg) {
    if (error.errMsg.includes('cancel') || error.errMsg.includes('用户取消')) {
      uni.showToast({
        title: '支付已取消',
        icon: 'none',
        duration: 2000
      });
    } else if (error.errMsg.includes('fail')) {
      uni.showToast({
        title: '支付失败，请重试',
        icon: 'none',
        duration: 2000
      });
    } else if (error.errMsg.includes('timeout')) {
      uni.showToast({
        title: '支付超时，请重试',
        icon: 'none',
        duration: 2000
      });
    } else {
      uni.showToast({
        title: '支付异常，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  } else {
    uni.showToast({
      title: '支付失败',
      icon: 'none',
      duration: 2000
    });
  }
};

/**
 * 验证支付参数
 * @param payParams 微信支付参数
 * @returns boolean
 */
export const validatePayParams = (payParams: WeChatPayParams): boolean => {
  const requiredFields = ['appId', 'timeStamp', 'nonceStr', 'packageVal', 'signType', 'paySign'];
  
  for (const field of requiredFields) {
    if (!payParams[field as keyof WeChatPayParams]) {
      console.error(`支付参数缺失: ${field}`);
      return false;
    }
  }
  
  return true;
};

/**
 * 格式化支付金额
 * @param amount 金额（元）
 * @returns 格式化后的金额字符串
 */
export const formatPaymentAmount = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

/**
 * 处理支付结果
 * @param success 是否成功
 * @param orderId 订单ID
 * @param callback 回调函数
 */
export const handlePaymentResult = (
  success: boolean, 
  orderId: string, 
  callback?: (orderId: string) => void
) => {
  if (success) {
    uni.showToast({
      title: '支付成功',
      icon: 'success'
    });
    
    // 延迟执行回调，让用户看到成功提示
    setTimeout(() => {
      callback?.(orderId);
    }, 1500);
  } else {
    uni.showToast({
      title: '支付失败',
      icon: 'none'
    });
  }
};
