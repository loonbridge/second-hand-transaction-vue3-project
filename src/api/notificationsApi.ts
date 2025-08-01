

/**
 * @description 获取当前用户的消息列表，可根据类型筛选
 * @summary 对应后端 API: GET /notifications
 * @param {GetNotificationsParams} params 查询参数对象，可包含消息类型 `type`
 * @returns {Promise<Notification[]>} 返回一个 Promise，其解析值为消息通知对象的数组
 */

import config from "@/config";
import { getToken } from "@/utils/auth";
import type { GetNotificationsParams, Notification } from "./types/notificationTypes";

const getNotifications = (param:GetNotificationsParams):Promise<Notification[]> => {
    return new Promise((resolve, reject) => {
        const token = getToken();

        if (!token) {
            reject(new Error('未登录，请先登录'));
            return;
        }

        uni.request({
            url: `${config.baseURL}/notifications`,
            method: 'GET',
            data: param,
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            success: (response) => {
                if (response.statusCode === 200) {
                    resolve(response.data as Notification[]);
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
}


export { getNotifications };

