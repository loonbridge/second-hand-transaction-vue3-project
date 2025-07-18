export interface Notification{
    notificationId: string;
    type: 'system' | 'transaction';
    title: string;
    content: string;
    createdAt: string;
    isRead: boolean;
    

}


/**
 * 获取消息列表的查询参数对象
 * @description 对应 GET /notifications 的 query parameters
 */
export interface GetNotificationsParams {
  /** 消息类型 (可选) */
  type?: 'system' | 'transaction';
}