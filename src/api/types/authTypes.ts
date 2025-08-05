import type { UserProfile, WechatUserInfo } from "./userTypes";

export interface LoginRequest {
    code: string;
    userInfo?: WechatUserInfo | null;
}

export interface LoginResponse {
    token: string;
    user: UserProfile;
    // 可选的微信用户信息（用于前端处理）
    wechatUserInfo?: WechatUserInfo;
}