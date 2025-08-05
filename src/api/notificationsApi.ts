import config from "@/config";
import { getToken } from "@/utils/auth";
import type { Notification, GetNotificationsParams } from "@/api/types/notificationTypes";

// 获取通知列表
export const getNotifications = (params?: GetNotificationsParams): Promise<Notification[]> => {
    return new Promise((resolve, reject) => {
        const token = getToken();

        if (!token) {
            reject(new Error('未登录，请先登录'));
            return;
        }

        uni.request({
            url: `${config.baseURL}/notifications`,
            method: 'GET',
            data: params,
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            success: (response) => {
                if (response.statusCode === 200) {
                    const resData = response.data as { items: Notification[] };
                    resolve(resData.items || []);
                } else if (response.statusCode === 401) {
                    reject(new Error('认证失败，请重新登录'));
                } else {
                    reject(new Error(`获取消息失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
};

// 标记通知为已读
export const markNotificationAsRead = (notificationId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const token = getToken();

        if (!token) {
            reject(new Error('未登录，请先登录'));
            return;
        }

        uni.request({
            url: `${config.baseURL}/notifications/${notificationId}/read`,
            method: 'POST',
            header: {
                'Authorization': `Bearer ${token}`
            },
            success: (response) => {
                if (response.statusCode === 204) {
                    resolve();
                } else if (response.statusCode === 401) {
                    reject(new Error('认证失败，请重新登录'));
                } else if (response.statusCode === 404) {
                    reject(new Error('消息不存在'));
                } else {
                    reject(new Error(`标记已读失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
};

// 创建通知
export const createNotification = (notification: {
    type: string;
    title: string;
    content: string;
    isRead: boolean;
    userId: string;
}): Promise<void> => {
    return new Promise((resolve, reject) => {
        const token = getToken();

        if (!token) {
            reject(new Error('未登录，请先登录'));
            return;
        }

        uni.request({
            url: `${config.baseURL}/in`,
            method: 'POST',
            header: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: notification,
            success: (response) => {
                if (response.statusCode === 200) {
                    resolve();
                } else if (response.statusCode === 400) {
                    reject(new Error('参数错误（标题/内容不能为空）'));
                } else if (response.statusCode === 401) {
                    reject(new Error('登录已过期，请重新登录'));
                } else if (response.statusCode === 404) {
                    reject(new Error('接口路径错误'));
                } else {
                    reject(new Error(`请求失败：${response.statusCode}`));
                }
            },
            fail: (error) => {
                reject(new Error(`网络错误: ${error.errMsg || '未知错误'}`));
            }
        });
    });
};

// 删除通知
export const deleteNotification = (notificationId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const token = getToken();

        if (!token) {
            reject(new Error('未登录，请先登录'));
            return;
        }

        uni.request({
            url: `${config.baseURL}/notifications/${notificationId}`,
            method: 'DELETE',
            header: {
                'Authorization': `Bearer ${token}`
            },
            success: (response) => {
                if (response.statusCode === 204) {
                    resolve();
                } else if (response.statusCode === 401) {
                    reject(new Error('认证失败，请重新登录'));
                } else if (response.statusCode === 404) {
                    reject(new Error('消息不存在'));
                } else {
                    reject(new Error(`删除失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
};