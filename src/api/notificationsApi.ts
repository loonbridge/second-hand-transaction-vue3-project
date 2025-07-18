

/**
 * @description 获取当前用户的消息列表，可根据类型筛选
 * @summary 对应后端 API: GET /notifications
 * @param {GetNotificationsParams} params 查询参数对象，可包含消息类型 `type`
 * @returns {Promise<Notification[]>} 返回一个 Promise，其解析值为消息通知对象的数组
 */

import config from "@/config";
import type { GetNotificationsParams, Notification } from "./types/notificationTypes";

const getNotifications = (param:GetNotificationsParams):Promise<Notification[]> => {
    return new Promise((resolve, reject) => {
        uni.request({
            url: `${config.baseURL}/notifications`,
            method: 'GET',
            data: param,
            success: (response) => {
                resolve(response.data as Notification[]);
            },
            fail: (error) => {
                reject(error);
            }
        });
    });
}


export { getNotifications };

