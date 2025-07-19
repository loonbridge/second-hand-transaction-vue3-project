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
        uni.login(
            {
                provider: 'weixin',
                success: (res) => {
                    uni.request({
                        url: `${config.baseURL}/auth/login`,
                        method: 'POST',
                        data: {
                            code: res.code
                        },
                        success: (response) => {
                            resolve(response.data as LoginResponse);
                        },
                        fail: (error) => {
                            reject(error);
                        }
                    })
                },
                fail: (error) => {
                    reject(error);
                }
            }
        )
    });
}



export { login };
    