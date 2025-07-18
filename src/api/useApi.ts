
/**
 * @description 获取当前登录用户的个人资料
 * @summary 对应后端 API: GET /users/me
 * @returns {Promise<UserProfile>} 返回一个 Promise，其解析值为当前用户的详细资料
 */

import config from "@/config";
import type { AddFavoritePayload, UserProfile } from "./types/userTypes";

const getMyProfile = ():Promise<UserProfile> => {

    return new  Promise((resolve, reject) => {
        uni.request({
            url: `${config.baseURL}/users/me`,
            method: 'GET',
            success: (response) => {
                resolve(response.data as UserProfile);
            },
            fail: (error) => {
                reject(error);
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
        uni.request({
            url: `${config.baseURL}/users/me/favorites`,
            method: 'POST',
            data,
            success: () => {
                resolve();
            },
            fail: (error) => {
                reject(error);
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
        uni.request({
            url: `${config.baseURL}/users/me/favorites/${productId}`,
            method: 'DELETE',
            success: () => {
                resolve();
            },
            fail: (error) => {
                reject(error);
            }
        });
    });
}


export { addFavorite, getMyProfile, removeFavorite };

