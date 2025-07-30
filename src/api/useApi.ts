
/**
 * @description 获取当前登录用户的个人资料
 * @summary 对应后端 API: GET /users/me
 * @returns {Promise<UserProfile>} 返回一个 Promise，其解析值为当前用户的详细资料
 */

import config from "@/config";
import { getToken } from "@/utils/auth";
import type { AddFavoritePayload, UserProfile } from "./types/userTypes";

const getMyProfile = ():Promise<UserProfile> => {

    return new  Promise((resolve, reject) => {
        const token = getToken();

        if (!token) {
            reject(new Error('未登录，请先登录'));
            return;
        }

        uni.request({
            url: `${config.baseURL}/users/me`,
            method: 'GET',
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            success: (response) => {
                if (response.statusCode === 200) {
                    resolve(response.data as UserProfile);
                } else if (response.statusCode === 401) {
                    reject(new Error('认证失败，请重新登录'));
                } else {
                    reject(new Error(`获取用户信息失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });

}

/**
 * @description 添加商品到当前用户的收藏夹
 * @summary 对应后端 API: POST /users/me/favorites
 * @param {AddFavoritePayload} data 包含要收藏的商品ID的请求体
 * @returns {Promise<void>} 操作成功时，返回一个无内容的 Promise
 */

const addFavorite = (data:AddFavoritePayload) => {
    return  new Promise<void>((resolve, reject) => {
        const token = getToken();

        if (!token) {
            reject(new Error('未登录，请先登录'));
            return;
        }

        uni.request({
            url: `${config.baseURL}/users/me/favorites`,
            method: 'POST',
            data,
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            success: (response) => {
                if (response.statusCode === 200 || response.statusCode === 201) {
                    resolve();
                } else if (response.statusCode === 401) {
                    reject(new Error('认证失败，请重新登录'));
                } else {
                    reject(new Error(`添加收藏失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });


}



/**
 * @description 从当前用户的收藏夹中移除一个商品
 * @summary 对应后端 API: DELETE /users/me/favorites/{productId}
 * @param {string} productId 要取消收藏的商品ID
 * @returns {Promise<void>} 操作成功时，返回一个无内容的 Promise
 */

const removeFavorite = (productId: string) => {
    return new Promise<void>((resolve, reject) => {
        const token = getToken();

        if (!token) {
            reject(new Error('未登录，请先登录'));
            return;
        }

        uni.request({
            url: `${config.baseURL}/users/me/favorites/${productId}`,
            method: 'DELETE',
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            success: (response) => {
                if (response.statusCode === 200 || response.statusCode === 204) {
                    resolve();
                } else if (response.statusCode === 401) {
                    reject(new Error('认证失败，请重新登录'));
                } else {
                    reject(new Error(`取消收藏失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
}


export { addFavorite, getMyProfile, removeFavorite };

