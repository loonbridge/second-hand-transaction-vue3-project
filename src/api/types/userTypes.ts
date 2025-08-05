export interface UserSummary {

    userId: string;
    nickname: string;
    avatarUrl: string;
}

export interface UserProfile extends UserSummary {

    joinDate: string;
}

// 微信用户信息接口（从微信API获取的原始数据）
export interface WechatUserInfo {
    nickName: string;
    avatarUrl: string;
    gender: number; // 0: 未知, 1: 男, 2: 女
    country: string;
    province: string;
    city: string;
    language: string;
}

// 应用内用户信息接口（结合微信信息和应用信息）
export interface AppUserInfo {
    // 微信信息
    nickName: string;
    avatarUrl: string;
    gender: number;
    country: string;
    province: string;
    city: string;
    language: string;

    // 应用信息
    userId?: string; // 应用内用户ID（登录后获得）
    joinDate?: string; // 加入时间
    isLoggedIn: boolean; // 是否已登录
    updateTime: number; // 信息更新时间
}


/**
 * 添加商品到收藏夹的请求体 (Payload)
 */
export interface AddFavoritePayload {
    productId: string;
}
