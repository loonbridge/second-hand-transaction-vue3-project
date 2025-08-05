import type { UserSummary } from "./userTypes";

export interface ProductSummary{
    productId: string;
    title: string;
    price: number;
    mainImageUrl: string;
    // 分类信息
    categoryId: string;
    categoryName: string;
    // 可选字段，用于不同场景下的扩展信息
    imageUrls?: string[];
    stock?: number;
    sellerInfo?: UserSummary;
    postedAt?: string;
    createdAt?: string;
    // 收藏时间（仅在收藏列表中使用）
    favoriteTime?: string;
}

export interface Review{
    reviewId: string;
    author: UserSummary;
    content: string;
    rating: number;
    createdAt: string;
}

export interface ProductDetail {
    productId: string;
    title: string;
    description: string;
    price: number;
    imageUrls: string[];
    stock: number;
    // 分类信息
    categoryId: string;
    categoryName: string;
    sellerInfo: UserSummary;
    isFavorite: boolean;
    isFollowingSeller: boolean;
    postedAt: string;
    reviews: Review[];
}


export interface CreateProductPayload {
    title: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string | number; // 修改为联合类型，兼容字符串和数字
    imageUrls: string[];
}


export interface Category{
    categoryId: string; // 根据swagger文档，categoryId为string类型
    name: string;
    iconUrl: string;
}



/**
 * 获取商品列表的查询参数对象
 * @description 对应 GET /products 的 query parameters
 */

export interface GetProductsParams {
    query?: string; // 搜索关键词
    categoryId?: string; // 分类ID
    sellerId?: string; // 卖家ID，传入 'me' 可查询当前登录用户的商品
    /** 页码，从1开始 (可选, 后端默认为1) */
    page?: number;

    /** 每页数量 (可选, 后端默认为10) */
    size?: number;
}


export interface GetProductResponse{
    items: ProductSummary[],
    totalPages: number,
    totalElements: number,
}

// ==================== 评论相关类型定义 ====================

/**
 * 创建评论的请求体
 * @description 对应 POST /products/{productId}/reviews
 */
export interface CreateReviewRequest {
    content: string;
    rating: number; // 1-5之间的整数
}

/**
 * 更新评论的请求体
 * @description 对应 PATCH /products/{productId}/reviews/{reviewId}
 */
export interface UpdateReviewRequest {
    content?: string;
    rating?: number; // 1-5之间的整数
}

/**
 * 获取商品评论列表的查询参数
 * @description 对应 GET /products/{productId}/reviews
 */
export interface GetReviewsParams {
    page?: number; // 页码，从1开始
    size?: number; // 每页数量
}

/**
 * 评论列表响应
 * @description 对应 GET /products/{productId}/reviews 的响应
 */
export interface ReviewListResponse {
    items: Review[];
    totalPages: number;
    totalElements: number;
}

// ==================== 商品管理相关类型定义 ====================

/**
 * 更新商品的请求体
 * @description 对应 PUT /products/{id}
 */
export interface UpdateProductRequest {
    title: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    imageUrls: string[];
}