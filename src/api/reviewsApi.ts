/**
 * 评论相关API接口
 * @description 对应后端评论相关的API接口
 */

import config from "@/config";
import { getToken } from "@/utils/auth";
import type {
    CreateReviewRequest,
    UpdateReviewRequest,
    GetReviewsParams,
    ReviewListResponse,
    Review
} from "./types/productTypes";

/**
 * 获取商品的评论列表
 * @description 对应后端 API: GET /products/{productId}/reviews
 * @param productId 商品ID
 * @param params 查询参数
 * @returns 返回评论列表的分页数据
 */
export const getProductReviews = (productId: string, params: GetReviewsParams = {}): Promise<ReviewListResponse> => {
    return new Promise((resolve, reject) => {
        const token = getToken();

        console.log('调用获取商品评论API:', `${config.baseURL}/products/${productId}/reviews`, params);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        // 如果有token，添加Authorization头
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        uni.request({
            url: `${config.baseURL}/products/${productId}/reviews`,
            method: 'GET',
            data: params,
            header: headers,
            success: (response) => {
                console.log('获取商品评论API响应:', response);

                if (response.statusCode === 200) {
                    resolve(response.data as ReviewListResponse);
                } else if (response.statusCode === 401) {
                    reject(new Error('认证失败，请重新登录'));
                } else if (response.statusCode === 404) {
                    reject(new Error('商品未找到'));
                } else {
                    reject(new Error(`获取评论失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                console.error('获取商品评论API请求失败:', error);
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
};

/**
 * 为商品创建一条新评论
 * @description 对应后端 API: POST /products/{productId}/reviews
 * @param productId 商品ID
 * @param data 评论数据
 * @returns 返回创建的评论信息
 */
export const createProductReview = (productId: string, data: CreateReviewRequest): Promise<Review> => {
    return new Promise((resolve, reject) => {
        const token = getToken();

        if (!token) {
            uni.showToast({
                title: '请先登录',
                icon: 'none',
                duration: 2000
            });
            reject(new Error('未登录，请先登录'));
            return;
        }

        console.log('调用创建评论API:', `${config.baseURL}/products/${productId}/reviews`, data);

        uni.request({
            url: `${config.baseURL}/products/${productId}/reviews`,
            method: 'POST',
            data: data,
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            success: (response) => {
                console.log('创建评论API响应:', response);

                if (response.statusCode === 201) {
                    resolve(response.data as Review);
                } else if (response.statusCode === 400) {
                    reject(new Error('请求参数错误（如评分超出范围）'));
                } else if (response.statusCode === 403) {
                    reject(new Error('无权限评论（例如，用户未购买此商品）'));
                } else if (response.statusCode === 404) {
                    reject(new Error('商品未找到'));
                } else {
                    reject(new Error(`创建评论失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                console.error('创建评论API请求失败:', error);
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
};

/**
 * 获取单条评论详情
 * @description 对应后端 API: GET /products/{productId}/reviews/{reviewId}
 * @param productId 商品ID
 * @param reviewId 评论ID
 * @returns 返回评论详情
 */
export const getReviewById = (productId: string, reviewId: string): Promise<Review> => {
    return new Promise((resolve, reject) => {
        console.log('调用获取评论详情API:', `${config.baseURL}/products/${productId}/reviews/${reviewId}`);

        uni.request({
            url: `${config.baseURL}/products/${productId}/reviews/${reviewId}`,
            method: 'GET',
            header: {
                'Content-Type': 'application/json'
            },
            success: (response) => {
                console.log('获取评论详情API响应:', response);

                if (response.statusCode === 200) {
                    resolve(response.data as Review);
                } else if (response.statusCode === 404) {
                    reject(new Error('商品或评论未找到'));
                } else {
                    reject(new Error(`获取评论详情失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                console.error('获取评论详情API请求失败:', error);
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
};

/**
 * 更新一条评论
 * @description 对应后端 API: PATCH /products/{productId}/reviews/{reviewId}
 * @param productId 商品ID
 * @param reviewId 评论ID
 * @param data 更新的评论数据
 * @returns 返回更新后的评论信息
 */
export const updateProductReview = (productId: string, reviewId: string, data: UpdateReviewRequest): Promise<Review> => {
    return new Promise((resolve, reject) => {
        const token = getToken();

        if (!token) {
            uni.showToast({
                title: '请先登录',
                icon: 'none',
                duration: 2000
            });
            reject(new Error('未登录，请先登录'));
            return;
        }

        console.log('调用更新评论API:', `${config.baseURL}/products/${productId}/reviews/${reviewId}`, data);

        uni.request({
            url: `${config.baseURL}/products/${productId}/reviews/${reviewId}`,
            method: 'PATCH',
            data: data,
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            success: (response) => {
                console.log('更新评论API响应:', response);

                if (response.statusCode === 200) {
                    resolve(response.data as Review);
                } else if (response.statusCode === 403) {
                    reject(new Error('无权限操作（非评论作者）'));
                } else if (response.statusCode === 404) {
                    reject(new Error('商品或评论未找到'));
                } else {
                    reject(new Error(`更新评论失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                console.error('更新评论API请求失败:', error);
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
};

/**
 * 删除一条评论
 * @description 对应后端 API: DELETE /products/{productId}/reviews/{reviewId}
 * @param productId 商品ID
 * @param reviewId 评论ID
 * @returns 返回Promise，成功时无返回值
 */
export const deleteProductReview = (productId: string, reviewId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const token = getToken();

        if (!token) {
            uni.showToast({
                title: '请先登录',
                icon: 'none',
                duration: 2000
            });
            reject(new Error('未登录，请先登录'));
            return;
        }

        console.log('调用删除评论API:', `${config.baseURL}/products/${productId}/reviews/${reviewId}`);

        uni.request({
            url: `${config.baseURL}/products/${productId}/reviews/${reviewId}`,
            method: 'DELETE',
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            success: (response) => {
                console.log('删除评论API响应:', response);

                if (response.statusCode === 204) {
                    resolve();
                } else if (response.statusCode === 403) {
                    reject(new Error('无权限操作（非评论作者或管理员）'));
                } else if (response.statusCode === 404) {
                    reject(new Error('商品或评论未找到'));
                } else {
                    reject(new Error(`删除评论失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                console.error('删除评论API请求失败:', error);
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
};
