import type { UserSummary } from "./userTypes";

export interface ProductSummary{

    productId: string;
    title: string;
    price: number;
    mainImageUrl: string;
}

export interface Review{
    reviewId: string;
    author: UserSummary;
    content:string;
    createdAt: string
}

export interface ProductDetail 
{
    productId: string;
    title: string;
    description: string;
    price: number;
    imageUrls: string[];
    stock: number;
    sellerInfo: UserSummary;
    isFavorite: boolean;

    postedAt: string;
    reviews: Review[];

}


export interface CreateProductPayload {
    title: string;
    description: string;
    price: number;
    stock: number;
    categoryId: number; // 修改为number类型，对应数据库的Long类型
    imageUrls: string[];
}


export interface Category{
    categoryId: number; // 修改为number类型，对应数据库的Long类型
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