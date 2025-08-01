import config from "@/config";
import type { LoginResponse } from "./types/authTypes";

/**
 * @description 使用微信 code 进行登录或注册
 * @summary 对应后端 API: POST /auth/login
 * @param {LoginPayload} payload 包含微信 code 的请求体
 * @returns {Promise<LoginResponse>} 返回一个 Promise，其解析值为包含 token 和用户信息的对象
 */

const login = ():Promise<LoginResponse> => {
    return new Promise((resolve, reject) => {
        uni.login({
            provider: 'weixin',
            success: (res) => {
                console.log('微信登录成功，获取到code:', res.code);
                console.log('准备调用后端API:', `${config.baseURL}/auth/login`);

                uni.request({
                    url: `${config.baseURL}/auth/login`,
                    method: 'POST',
                    data: {
                        code: res.code
                    },
                    header: {
                        'Content-Type': 'application/json'
                    },
                    success: (response) => {
                        console.log('后端API响应:', response);

                        if (response.statusCode === 200) {
                            resolve(response.data as LoginResponse);
                        } else {
                            reject(new Error(`登录失败: HTTP ${response.statusCode}`));
                        }
                    },
                    fail: (error) => {
                        console.error('API请求失败:', error);
                        reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
                    }
                });
            },
            fail: (error) => {
                console.error('微信登录失败:', error);
                reject(new Error(`微信登录失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
}

/**
 * @description 获取微信登录code（用于调试）
 * @returns {Promise<string>} 返回微信登录code
 */
const getWechatCode = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        uni.login({
            provider: 'weixin',
            success: (res) => {
                console.log('获取微信Code成功:', res.code);
                resolve(res.code);
            },
            fail: (error) => {
                console.error('获取微信Code失败:', error);
                reject(new Error(`获取微信Code失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
}



export { getWechatCode, login };
    