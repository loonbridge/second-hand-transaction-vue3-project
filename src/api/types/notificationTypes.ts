/**
 * 消息通知对象 (根据swagger文档的NotificationVO)
 */
export interface Notification {
    notificationId: string;
    type: 'system' | 'transaction';
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    isRead: boolean;
}

/**
 * 消息列表分页响应 (根据swagger文档的NotificationListVO)
 */
export interface NotificationListResponse {
    items: Notification[];
    totalPages: number;
    totalElements: number;
}

/**
 * 获取消息列表的查询参数对象
 * @description 对应 GET /notifications 的 query parameters
 */
export interface GetNotificationsParams {
    /** 消息类型 (可选) */
    type?: 'system' | 'transaction';
    /** 页码 (可选，默认0) */
    page?: number;
    /** 每页大小 (可选，默认20) */
    size?: number;
}

/**
 * 批量删除消息的请求体
 * @description 对应 POST /notifications/delete-batch 的请求体
 */
export interface DeleteNotificationsRequest {
    notificationIds: string[];
}