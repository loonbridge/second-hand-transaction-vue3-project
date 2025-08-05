/**
 * 消息提醒工具函数
 */

import { ref } from 'vue';
import { getNotifications } from '@/api/notificationsApi';
import type { NotificationListResponse } from '@/api/types/notificationTypes';

// 全局未读消息数量
export const unreadCount = ref(0);

/**
 * 获取未读消息数量
 * @returns Promise<number>
 */
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    console.log('🔔 [NotificationUtils] 获取未读消息数量');
    
    const response: NotificationListResponse = await getNotifications({
      page: 0,
      size: 50 // 获取足够多的消息来统计未读数量
    });
    
    const count = response.items.filter(item => !item.isRead).length;
    unreadCount.value = count;
    
    console.log('🔔 [NotificationUtils] 未读消息数量:', count);
    return count;
    
  } catch (error: any) {
    console.error('❌ [NotificationUtils] 获取未读消息数量失败:', error);
    return 0;
  }
};

/**
 * 更新未读消息数量（本地更新）
 * @param count 新的未读消息数量
 */
export const updateUnreadCount = (count: number) => {
  console.log('🔔 [NotificationUtils] 更新未读消息数量:', count);
  unreadCount.value = count;
};

/**
 * 减少未读消息数量（当消息被标记为已读时）
 * @param decreaseBy 减少的数量，默认为1
 */
export const decreaseUnreadCount = (decreaseBy: number = 1) => {
  const newCount = Math.max(0, unreadCount.value - decreaseBy);
  console.log('🔔 [NotificationUtils] 减少未读消息数量:', {
    原数量: unreadCount.value,
    减少: decreaseBy,
    新数量: newCount
  });
  unreadCount.value = newCount;
};

/**
 * 清空未读消息数量（全部标记为已读时）
 */
export const clearUnreadCount = () => {
  console.log('🔔 [NotificationUtils] 清空未读消息数量');
  unreadCount.value = 0;
};

/**
 * 初始化消息提醒（应用启动时调用）
 */
export const initNotificationReminder = async () => {
  console.log('🚀 [NotificationUtils] 初始化消息提醒');
  await getUnreadNotificationCount();
};
