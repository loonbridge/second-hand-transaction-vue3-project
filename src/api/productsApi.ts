
import config from "@/config";
import type { Category, CreateProductPayload, GetProductResponse, GetProductsParams, ProductDetail } from "./types/productTypes";


/**
 * 接口1: 获取商品列表（GET /products）
 * @param params - 包含分页、搜索等条件的查询参数对象
 * @returns 返回一个 Promise，其解析值为商品列表的分页数据
 */


const getProducts = (params:GetProductsParams) => {
    return new Promise<GetProductResponse>((resolve, reject) => {
        uni.request({
            url: `${config.baseURL}/products`,
            method: 'GET',
            data: params,
            success: (response) => {
                resolve(response.data as GetProductResponse);
            },
            fail: (error) => {
                reject(error);
            }
        });
    });
}



/**
 * 接口2: 发布新商品（POST /products）
 * @param data - 创建新商品的请求体数据
 * @returns 返回一个 Promise，其解析值为创建成功后的商品详情
 */


const createProduct = (data: CreateProductPayload) => {
    return new Promise<ProductDetail>((resolve, reject) => {
        uni.request({
            url: `${config.baseURL}/products`,
            method: 'POST',
            data,
            header: {
                'Content-Type': 'application/json'
            },
            success: (response: any) => {
                if (response.statusCode === 201 || response.statusCode === 200) {
                    resolve(response.data as ProductDetail);
                } else {
                    reject(new Error(`HTTP ${response.statusCode}: ${response.data?.message || '发布失败'}`));
                }
            },
            fail: (error) => {
                reject(new Error('网络请求失败: ' + error.errMsg));
            }
        });
    });
}



/**
 * 接口3: 获取商品详情（GET /products/{id}）
 * @param id - 商品的 ID
 * @returns 返回一个 Promise，其解析值为单个商品的详细信息
 */


const getProductById = (id: string) => {
    return new Promise<ProductDetail>((resolve, reject) => {
        uni.request({
            url: `${config.baseURL}/products/${id}`,
            method: 'GET',
            success: (response) => {
                resolve(response.data as ProductDetail);
            },
            fail: (error) => {
                reject(error);
            }
        });
    });
}


/**
 * 接口4: 获取所有商品分类（GET /categories）
 * @returns 返回一个 Promise，其解析值为商品分类数组
 */


const getCategories = () => {
    return new Promise<Category[]>((resolve, reject) => {
        uni.request({
            url: `${config.baseURL}/categories`,
            method: 'GET',
            success: (response: any) => {
                if (response.statusCode === 200) {
                    resolve(response.data as Category[]);
                } else {
                    reject(new Error(`HTTP ${response.statusCode}: ${response.data?.message || '获取分类失败'}`));
                }
            },
            fail: (error) => {
                reject(new Error('网络请求失败: ' + error.errMsg));
            }
        });
    });
}


export {
    createProduct, getCategories, getProductById, getProducts
};

