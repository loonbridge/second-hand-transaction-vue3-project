import config from "@/config";
import type { LoginResponse, LoginRequest } from "./types/authTypes";
import { handlePrivacyAuthorization } from "@/utils/privacy";
import { isWechatMiniProgram } from "@/utils/wechatUser";
import type { WechatUserInfo } from "@/utils/wechatUser";

/**
 * @description 使用微信 code 和用户信息进行登录或注册
 * @summary 对应后端 API: POST /auth/login
 * @returns {Promise<LoginResponse>} 返回一个 Promise，其解析值为包含 token 和用户信息的对象
 */
const login = (): Promise<LoginResponse> => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('🚀 [Auth] 开始微信登录流程');

            // 第一步：获取微信登录code
            const loginResult = await getWechatLoginCode();
            console.log('✅ [Auth] 获取微信code成功:', loginResult.code);

            // 第二步：获取用户信息（仅在微信小程序环境）
            let userInfo: WechatUserInfo | null = null;
            if (isWechatMiniProgram()) {
                try {
                    console.log('📱 [Auth] 微信小程序环境，开始获取用户信息');

                    // 处理隐私授权
                    const privacyAuthorized = await handlePrivacyAuthorization();
                    if (!privacyAuthorized) {
                        console.log('⚠️ [Auth] 隐私授权失败，继续使用code登录');
                    } else {
                        // 获取用户信息
                        userInfo = await getWechatUserProfile();
                        console.log('✅ [Auth] 获取用户信息成功:', userInfo);
                    }
                } catch (userInfoError) {
                    console.warn('⚠️ [Auth] 获取用户信息失败，继续使用code登录:', userInfoError);
                    // 不阻断登录流程，继续使用code登录
                }
            }

            // 第三步：构建登录请求数据
            const loginData: LoginRequest = {
                code: loginResult.code,
                userInfo: userInfo
            };

            console.log('📤 [Auth] 准备调用后端API:', `${config.baseURL}/auth/login`);
            console.log('📤 [Auth] 登录数据:', {
                code: loginData.code,
                hasUserInfo: !!loginData.userInfo,
                userInfo: loginData.userInfo ? {
                    nickName: loginData.userInfo.nickName,
                    hasAvatar: !!loginData.userInfo.avatarUrl
                } : null
            });

            // 第四步：调用后端登录API
            uni.request({
                url: `${config.baseURL}/auth/login`,
                method: 'POST',
                data: loginData,
                header: {
                    'Content-Type': 'application/json'
                },
                success: (response) => {
                    console.log('📥 [Auth] 后端API响应:', response);

                    if (response.statusCode === 200) {
                        const loginResponse = response.data as LoginResponse;

                        // 如果有微信用户信息，附加到响应中
                        if (userInfo) {
                            (loginResponse as any).wechatUserInfo = userInfo;
                        }

                        resolve(loginResponse);
                    } else {
                        reject(new Error(`登录失败: HTTP ${response.statusCode}`));
                    }
                },
                fail: (error) => {
                    console.error('❌ [Auth] API请求失败:', error);
                    reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
                }
            });

        } catch (error) {
            console.error('❌ [Auth] 登录流程失败:', error);
            reject(error);
        }
    });
};

/**
 * 获取微信登录code
 */
const getWechatLoginCode = (): Promise<{ code: string }> => {
    return new Promise((resolve, reject) => {
        uni.login({
            provider: 'weixin',
            success: (res) => {
                resolve({ code: res.code });
            },
            fail: (error) => {
                console.error('❌ [Auth] 微信登录失败:', error);
                reject(new Error(`微信登录失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
};

/**
 * 获取微信用户信息
 */
const getWechatUserProfile = (): Promise<WechatUserInfo> => {
    return new Promise((resolve, reject) => {
        if (!uni.getUserProfile) {
            reject(new Error('当前环境不支持获取用户信息'));
            return;
        }

        uni.getUserProfile({
            desc: '登录获取用户信息',
            success: (res) => {
                resolve(res.userInfo as WechatUserInfo);
            },
            fail: (error) => {
                console.error('❌ [Auth] 获取用户信息失败:', error);
                reject(new Error(error.errMsg || '获取用户信息失败'));
            }
        });
    });
};

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
    