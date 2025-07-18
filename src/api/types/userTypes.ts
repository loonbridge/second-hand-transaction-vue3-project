export interface UserSummary {

    userId: string;
    nickname: string;
    avatarUrl: string;
}

export interface UserProfile extends UserSummary {

    joinDate: string;
}


/**
 * 添加商品到收藏夹的请求体 (Payload)
 */
export interface AddFavoritePayload {
    productId: string;
}
