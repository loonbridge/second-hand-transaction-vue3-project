/**
 * 订单状态工具函数
 * 统一管理订单状态的映射和转换
 */

import { ORDER_STATUS, type OrderStatus } from '@/api/types/orderTypes';

/**
 * 订单状态显示文本映射
 */
export const ORDER_STATUS_TEXT_MAP: Record<OrderStatus, string> = {
  [ORDER_STATUS.TO_PAY]: '待付款',
  [ORDER_STATUS.TO_SHIP]: '待发货',
  [ORDER_STATUS.TO_RECEIVE]: '待收货',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELED]: '已取消'
};

/**
 * 订单状态CSS类名映射
 */
export const ORDER_STATUS_CLASS_MAP: Record<OrderStatus, string> = {
  [ORDER_STATUS.TO_PAY]: 'status-to-pay',
  [ORDER_STATUS.TO_SHIP]: 'status-to-ship',
  [ORDER_STATUS.TO_RECEIVE]: 'status-to-receive',
  [ORDER_STATUS.COMPLETED]: 'status-completed',
  [ORDER_STATUS.CANCELED]: 'status-canceled'
};

/**
 * 订单状态颜色映射
 */
export const ORDER_STATUS_COLOR_MAP: Record<OrderStatus, string> = {
  [ORDER_STATUS.TO_PAY]: '#f59e0b',      // 橙色 - 待付款
  [ORDER_STATUS.TO_SHIP]: '#10b981',     // 绿色 - 待发货
  [ORDER_STATUS.TO_RECEIVE]: '#3b82f6',  // 蓝色 - 待收货
  [ORDER_STATUS.COMPLETED]: '#6b7280',   // 灰色 - 已完成
  [ORDER_STATUS.CANCELED]: '#ef4444'     // 红色 - 已取消
};

/**
 * 获取订单状态显示文本
 * @param status 订单状态
 * @returns 显示文本
 */
export const getOrderStatusText = (status: OrderStatus | string): string => {
  console.log('🏷️ [OrderStatusUtils] 获取状态文本:', status);
  
  // 如果是新格式的状态，直接映射
  if (status in ORDER_STATUS_TEXT_MAP) {
    const displayText = ORDER_STATUS_TEXT_MAP[status as OrderStatus];
    console.log('🏷️ [OrderStatusUtils] 状态文本映射成功:', { status, displayText });
    return displayText;
  }
  
  // 如果是旧格式的状态，进行转换
  const legacyStatusMap: Record<string, OrderStatus> = {
    'ToPay': ORDER_STATUS.TO_PAY,
    'ToShip': ORDER_STATUS.TO_SHIP,
    'ToReceive': ORDER_STATUS.TO_RECEIVE,
    'Completed': ORDER_STATUS.COMPLETED,
    'Canceled': ORDER_STATUS.CANCELED,
    'CANCELLED': ORDER_STATUS.CANCELED
  };
  
  if (status in legacyStatusMap) {
    const newStatus = legacyStatusMap[status];
    const displayText = ORDER_STATUS_TEXT_MAP[newStatus];
    console.log('🏷️ [OrderStatusUtils] 旧状态转换:', { 
      oldStatus: status, 
      newStatus, 
      displayText 
    });
    return displayText;
  }
  
  console.warn('⚠️ [OrderStatusUtils] 未知状态:', status);
  return status as string;
};

/**
 * 获取订单状态CSS类名
 * @param status 订单状态
 * @returns CSS类名
 */
export const getOrderStatusClass = (status: OrderStatus | string): string => {
  console.log('🎨 [OrderStatusUtils] 获取状态样式:', status);
  
  // 如果是新格式的状态，直接映射
  if (status in ORDER_STATUS_CLASS_MAP) {
    const cssClass = ORDER_STATUS_CLASS_MAP[status as OrderStatus];
    console.log('🎨 [OrderStatusUtils] 状态样式映射成功:', { status, cssClass });
    return cssClass;
  }
  
  // 如果是旧格式的状态，进行转换
  const legacyStatusMap: Record<string, OrderStatus> = {
    'ToPay': ORDER_STATUS.TO_PAY,
    'ToShip': ORDER_STATUS.TO_SHIP,
    'ToReceive': ORDER_STATUS.TO_RECEIVE,
    'Completed': ORDER_STATUS.COMPLETED,
    'Canceled': ORDER_STATUS.CANCELED,
    'CANCELLED': ORDER_STATUS.CANCELED
  };
  
  if (status in legacyStatusMap) {
    const newStatus = legacyStatusMap[status];
    const cssClass = ORDER_STATUS_CLASS_MAP[newStatus];
    console.log('🎨 [OrderStatusUtils] 旧状态样式转换:', { 
      oldStatus: status, 
      newStatus, 
      cssClass 
    });
    return cssClass;
  }
  
  console.warn('⚠️ [OrderStatusUtils] 未知状态样式:', status);
  return '';
};

/**
 * 获取订单状态颜色
 * @param status 订单状态
 * @returns 颜色值
 */
export const getOrderStatusColor = (status: OrderStatus | string): string => {
  console.log('🌈 [OrderStatusUtils] 获取状态颜色:', status);
  
  // 如果是新格式的状态，直接映射
  if (status in ORDER_STATUS_COLOR_MAP) {
    const color = ORDER_STATUS_COLOR_MAP[status as OrderStatus];
    console.log('🌈 [OrderStatusUtils] 状态颜色映射成功:', { status, color });
    return color;
  }
  
  // 如果是旧格式的状态，进行转换
  const legacyStatusMap: Record<string, OrderStatus> = {
    'ToPay': ORDER_STATUS.TO_PAY,
    'ToShip': ORDER_STATUS.TO_SHIP,
    'ToReceive': ORDER_STATUS.TO_RECEIVE,
    'Completed': ORDER_STATUS.COMPLETED,
    'Canceled': ORDER_STATUS.CANCELED,
    'CANCELLED': ORDER_STATUS.CANCELED
  };
  
  if (status in legacyStatusMap) {
    const newStatus = legacyStatusMap[status];
    const color = ORDER_STATUS_COLOR_MAP[newStatus];
    console.log('🌈 [OrderStatusUtils] 旧状态颜色转换:', { 
      oldStatus: status, 
      newStatus, 
      color 
    });
    return color;
  }
  
  console.warn('⚠️ [OrderStatusUtils] 未知状态颜色:', status);
  return '#6b7280'; // 默认灰色
};

/**
 * 标准化订单状态（将旧格式转换为新格式）
 * @param status 订单状态
 * @returns 标准化后的状态
 */
export const normalizeOrderStatus = (status: string): OrderStatus => {
  console.log('🔄 [OrderStatusUtils] 标准化状态:', status);
  
  // 如果已经是新格式，直接返回
  if (Object.values(ORDER_STATUS).includes(status as OrderStatus)) {
    console.log('🔄 [OrderStatusUtils] 状态已是新格式:', status);
    return status as OrderStatus;
  }
  
  // 转换旧格式到新格式
  const legacyStatusMap: Record<string, OrderStatus> = {
    'ToPay': ORDER_STATUS.TO_PAY,
    'ToShip': ORDER_STATUS.TO_SHIP,
    'ToReceive': ORDER_STATUS.TO_RECEIVE,
    'Completed': ORDER_STATUS.COMPLETED,
    'Canceled': ORDER_STATUS.CANCELED,
    'CANCELLED': ORDER_STATUS.CANCELED
  };
  
  if (status in legacyStatusMap) {
    const newStatus = legacyStatusMap[status];
    console.log('🔄 [OrderStatusUtils] 状态转换成功:', { 
      oldStatus: status, 
      newStatus 
    });
    return newStatus;
  }
  
  console.warn('⚠️ [OrderStatusUtils] 无法标准化状态:', status);
  return status as OrderStatus;
};

/**
 * 验证订单状态是否有效
 * @param status 订单状态
 * @returns 是否有效
 */
export const isValidOrderStatus = (status: string): boolean => {
  const validStatuses = [
    ...Object.values(ORDER_STATUS),
    'ToPay', 'ToShip', 'ToReceive', 'Completed', 'Canceled', 'CANCELLED' // 兼容旧格式
  ];
  
  const isValid = validStatuses.includes(status as any);
  console.log('✅ [OrderStatusUtils] 状态验证:', { status, isValid });
  
  return isValid;
};
