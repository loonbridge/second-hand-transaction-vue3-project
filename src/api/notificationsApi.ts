

/**
 * @description 获取当前用户的消息列表，可根据类型筛选
 * @summary 对应后端 API: GET /notifications
 * @param {GetNotificationsParams} params 查询参数对象，可包含消息类型 `type`
 * @returns {Promise<Notification[]>} 返回一个 Promise，其解析值为消息通知对象的数组
 */

import config from "@/config";
import { getToken } from "@/utils/auth";
import type {
    GetNotificationsParams,
    NotificationListResponse,
    DeleteNotificationsRequest
} from "./types/notificationTypes";

/**
 * 获取消息列表
 * @description 对应后端 API: GET /notifications
 * @param params 查询参数
 * @returns Promise<NotificationListResponse>
 */
const getNotifications = (params: GetNotificationsParams): Promise<NotificationListResponse> => {
    return new Promise((resolve, reject) => {
        const token = getToken();

        if (!token) {
            reject(new Error('未登录，请先登录'));
            return;
        }

        console.log('📥 [Notifications] 获取消息列表:', params);

        uni.request({
            url: `${config.baseURL}/notifications`,
            method: 'GET',
            data: params,
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            success: (response) => {
                console.log('📥 [Notifications] API响应:', response);

                if (response.statusCode === 200) {
                    resolve(response.data as NotificationListResponse);
                } else if (response.statusCode === 401) {
                    reject(new Error('认证失败，请重新登录'));
                } else {
                    reject(new Error(`获取消息失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                console.error('❌ [Notifications] 获取消息失败:', error);
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
};


/**
 * 标记单条消息为已读
 * @description 对应后端 API: POST /notifications/{id}/read
 * @param notificationId 消息ID
 * @returns Promise<void>
 */
const markNotificationAsRead = (notificationId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const token = getToken();

        if (!token) {
            reject(new Error('未登录，请先登录'));
            return;
        }

        console.log('✅ [Notifications] 标记消息已读:', notificationId);

        uni.request({
            url: `${config.baseURL}/notifications/${notificationId}/read`,
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            success: (response) => {
                console.log('✅ [Notifications] 标记已读响应:', response);

                if (response.statusCode === 204) {
                    resolve();
                } else if (response.statusCode === 401) {
                    reject(new Error('认证失败，请重新登录'));
                } else if (response.statusCode === 404) {
                    reject(new Error('消息未找到'));
                } else {
                    reject(new Error(`标记已读失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                console.error('❌ [Notifications] 标记已读失败:', error);
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
};

/**
 * 全部标记为已读
 * @description 对应后端 API: POST /notifications/read-all
 * @returns Promise<void>
 */
const markAllNotificationsAsRead = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        const token = getToken();

        if (!token) {
            reject(new Error('未登录，请先登录'));
            return;
        }

        console.log('✅ [Notifications] 全部标记已读');

        uni.request({
            url: `${config.baseURL}/notifications/read-all`,
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            success: (response) => {
                console.log('✅ [Notifications] 全部标记已读响应:', response);

                if (response.statusCode === 204) {
                    resolve();
                } else if (response.statusCode === 401) {
                    reject(new Error('认证失败，请重新登录'));
                } else {
                    reject(new Error(`全部标记已读失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                console.error('❌ [Notifications] 全部标记已读失败:', error);
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
};

/**
 * 删除单条消息
 * @description 对应后端 API: DELETE /notifications/{id}
 * @param notificationId 消息ID
 * @returns Promise<void>
 */
const deleteNotification = (notificationId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const token = getToken();

        if (!token) {
            reject(new Error('未登录，请先登录'));
            return;
        }

        console.log('🗑️ [Notifications] 删除消息:', notificationId);

        uni.request({
            url: `${config.baseURL}/notifications/${notificationId}`,
            method: 'DELETE',
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            success: (response) => {
                console.log('🗑️ [Notifications] 删除消息响应:', response);

                if (response.statusCode === 204) {
                    resolve();
                } else if (response.statusCode === 401) {
                    reject(new Error('认证失败，请重新登录'));
                } else if (response.statusCode === 404) {
                    reject(new Error('消息未找到'));
                } else {
                    reject(new Error(`删除消息失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                console.error('❌ [Notifications] 删除消息失败:', error);
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
};

/**
 * 批量删除消息
 * @description 对应后端 API: POST /notifications/delete-batch
 * @param request 批量删除请求
 * @returns Promise<void>
 */
const deleteNotificationsBatch = (request: DeleteNotificationsRequest): Promise<void> => {
    return new Promise((resolve, reject) => {
        const token = getToken();

        if (!token) {
            reject(new Error('未登录，请先登录'));
            return;
        }

        console.log('🗑️ [Notifications] 批量删除消息:', request);

        uni.request({
            url: `${config.baseURL}/notifications/delete-batch`,
            method: 'POST',
            data: request,
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            success: (response) => {
                console.log('🗑️ [Notifications] 批量删除响应:', response);

                if (response.statusCode === 204) {
                    resolve();
                } else if (response.statusCode === 401) {
                    reject(new Error('认证失败，请重新登录'));
                } else {
                    reject(new Error(`批量删除失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                console.error('❌ [Notifications] 批量删除失败:', error);
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
};

export {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteNotificationsBatch
};

