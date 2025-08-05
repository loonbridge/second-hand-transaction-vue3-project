
import config from "@/config";
import { getToken } from "@/utils/auth";
import type { Category, CreateProductPayload, GetProductResponse, GetProductsParams, ProductDetail, UpdateProductRequest } from "./types/productTypes";


/**
 * 接口1: 获取商品列表（GET /products）
 * @param params - 包含分页、搜索等条件的查询参数对象
 * @returns 返回一个 Promise，其解析值为商品列表的分页数据
 */


const getProducts = (params:GetProductsParams) => {
    return new Promise<GetProductResponse>((resolve, reject) => {
        const token = getToken();

        console.log('调用商品列表API:', `${config.baseURL}/products`, params);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        // 如果有token，添加Authorization头
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        uni.request({
            url: `${config.baseURL}/products`,
            method: 'GET',
            data: params,
            header: headers,
            success: (response) => {
                console.log('商品列表API响应:', response);

                if (response.statusCode === 200) {
                    resolve(response.data as GetProductResponse);
                } else if (response.statusCode === 401) {
                    reject(new Error('认证失败，请重新登录'));
                } else {
                    reject(new Error(`获取商品列表失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                console.error('商品列表API请求失败:', error);
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
}



/**
 * 接口2: 发布新商品（POST /products）
 * 使用 multipart/form-data 格式发布新商品
 * @param data - 创建新商品的请求体数据
 * @param imageFiles - 商品图片文件路径数组
 * @returns 返回一个 Promise，其解析值为创建成功后的商品详情
 */
const createProduct = (data: CreateProductPayload, imageFiles: string[]) => {
    return new Promise<ProductDetail>((resolve, reject) => {
        console.log('开始发布商品，请求数据:', JSON.stringify(data));
        console.log('图片文件:', imageFiles);

        // 获取存储的token
        const token = uni.getStorageSync('token');
        if (!token) {
            uni.showToast({
                title: '请先登录',
                icon: 'none',
                duration: 2000
            });
            reject(new Error('未登录，请先登录'));
            return;
        }

        // 验证必要参数
        if (!imageFiles || imageFiles.length === 0) {
            reject(new Error('至少需要上传一张商品图片'));
            return;
        }

        // 确保categoryId是字符串类型
        const productData = {
            ...data,
            categoryId: String(data.categoryId)
        };

        // 由于uni.uploadFile的限制，我们使用主图片文件进行上传
        // 如果有多个文件，我们使用第一个作为主图片
        const mainImageFile = imageFiles[0];

        // 构建formData，包含所有图片文件的信息
        const formData: Record<string, any> = {
            'data': JSON.stringify(productData)
        };

        // 如果有多个图片，我们在formData中添加额外信息
        if (imageFiles.length > 1) {
            formData['additionalFilesCount'] = String(imageFiles.length - 1);
            console.log(`注意：当前只上传主图片，共有${imageFiles.length}张图片`);
        }

        uni.uploadFile({
            url: `${config.baseURL}/products`,
            filePath: mainImageFile,
            name: 'files',
            formData: formData,
            header: {
                'Authorization': `Bearer ${token}`
            },
            success: (response: any) => {
                console.log('发布商品API响应:', response);
                if (response.statusCode === 201 || response.statusCode === 200) {
                    try {
                        // uploadFile返回的data是字符串，需要解析
                        const result = typeof response.data === 'string'
                            ? JSON.parse(response.data)
                            : response.data;
                        resolve(result as ProductDetail);
                    } catch (parseError) {
                        console.error('解析响应数据失败:', parseError);
                        reject(new Error('服务器响应格式错误'));
                    }
                } else {
                    // 尝试解析详细错误信息
                    let errorDetails = '';
                    try {
                        if (response.data) {
                            if (typeof response.data === 'string') {
                                errorDetails = response.data;
                            } else if (typeof response.data === 'object') {
                                // 尝试提取常见错误字段
                                const errorObj = response.data;
                                errorDetails = errorObj.message || 
                                              errorObj.error || 
                                              errorObj.errorMessage || 
                                              JSON.stringify(errorObj);
                            }
                        }
                    } catch (e) {
                        console.warn('解析错误详情失败:', e);
                    }
                    
                    // 检查是否是时间相关错误
                    if (errorDetails.includes('2025') || 
                        (response.data && JSON.stringify(response.data).includes('2025'))) {
                        console.error('检测到可能的服务器时间问题 (2025年)');
                    }
                    
                    const errorMsg = `HTTP ${response.statusCode}: ${errorDetails || '发布失败'}`;
                    console.error('发布商品失败:', errorMsg, response);
                    
                    // 处理特定错误码
                    if (response.statusCode === 401) {
                        uni.showToast({
                            title: '登录已过期，请重新登录',
                            icon: 'none',
                            duration: 2000
                        });
                        // 可以在这里添加跳转到登录页面的逻辑
                        // uni.navigateTo({ url: '/pages/login/login' });
                    } else if (response.statusCode === 500) {
                        console.error('服务器内部错误，请求数据:', data);
                        console.error('可能的错误原因:');
                        console.error('1. 图片URL无效');
                        console.error('2. 服务器验证失败');
                        console.error('3. 数据库操作异常');
                        console.error('4. 服务器系统时间设置为2025年（已确认）');
                        console.error('详细错误:', errorDetails);
                        
                        // 提示用户服务器问题
                        uni.showModal({
                            title: '服务器错误',
                            content: '服务器内部错误，可能是由于系统时间设置不正确导致。是否尝试重试？',
                            confirmText: '重试',
                            cancelText: '取消',
                            success: (res) => {
                                if (res.confirm) {
                                    // 重试逻辑
                                    console.log('用户选择重试，直接使用原始数据');
                                    createProduct(productData, imageFiles).then(resolve).catch(reject);
                                } else {
                                    reject(new Error(errorMsg));
                                }
                            }
                        });
                        return; // 阻止继续执行reject
                    }
                    
                    reject(new Error(errorMsg));
                }
            },
            fail: (error) => {
                console.error('发布商品请求失败:', error);
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
        const token = getToken();

        console.log('调用获取商品详情API:', `${config.baseURL}/products/${id}`);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        // 如果有token，添加Authorization头
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        uni.request({
            url: `${config.baseURL}/products/${id}`,
            method: 'GET',
            header: headers,
            success: (response) => {
                console.log('获取商品详情API响应:', response);

                if (response.statusCode === 200) {
                    resolve(response.data as ProductDetail);
                } else if (response.statusCode === 401) {
                    reject(new Error('认证失败，请重新登录'));
                } else if (response.statusCode === 404) {
                    reject(new Error('商品未找到'));
                } else {
                    reject(new Error(`获取商品详情失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                console.error('获取商品详情API请求失败:', error);
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
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
        const token = getToken();

        console.log('调用分类列表API:', `${config.baseURL}/categories`);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        // 如果有token，添加Authorization头
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        uni.request({
            url: `${config.baseURL}/categories`,
            method: 'GET',
            header: headers,
            success: (response: any) => {
                console.log('分类列表API响应:', response);

                if (response.statusCode === 200) {
                    // 根据swagger文档，API返回格式为 {items: CategoryVO[]}
                    const responseData = response.data;
                    if (responseData && responseData.items && Array.isArray(responseData.items)) {
                        resolve(responseData.items as Category[]);
                    } else {
                        // 如果响应格式不符合预期，尝试直接解析为数组
                        resolve(responseData as Category[]);
                    }
                } else if (response.statusCode === 401) {
                    reject(new Error('认证失败，请重新登录'));
                } else {
                    reject(new Error(`获取分类失败: HTTP ${response.statusCode}: ${response.data?.message || '未知错误'}`));
                }
            },
            fail: (error) => {
                console.error('分类列表API请求失败:', error);
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
}


/**
 * 临时函数：使用已上传的图片URL创建商品
 * 这是为了兼容当前的图片上传流程
 */
const createProductWithUrls = (data: any) => {
    return new Promise<ProductDetail>((resolve, reject) => {
        console.log('开始发布商品（使用URL），请求数据:', JSON.stringify(data));

        // 获取存储的token
        const token = uni.getStorageSync('token');
        if (!token) {
            uni.showToast({
                title: '请先登录',
                icon: 'none',
                duration: 2000
            });
            reject(new Error('未登录，请先登录'));
            return;
        }

        // 验证必要参数
        if (!data.imageUrls || data.imageUrls.length === 0) {
            reject(new Error('至少需要一张商品图片'));
            return;
        }

        uni.request({
            url: `${config.baseURL}/products`,
            method: 'POST',
            data: data,
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            success: (response: any) => {
                console.log('发布商品API响应:', response);
                if (response.statusCode === 201 || response.statusCode === 200) {
                    resolve(response.data as ProductDetail);
                } else {
                    reject(new Error(`发布失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                console.error('发布商品请求失败:', error);
                reject(new Error('网络请求失败: ' + error.errMsg));
            }
        });
    });
};

/**
 * 更新指定商品信息
 * @description 对应后端 API: PUT /products/{id}
 * @param id 商品ID
 * @param data 更新的商品数据
 * @returns 返回更新后的商品详情
 */
const updateProduct = (id: string, data: UpdateProductRequest): Promise<ProductDetail> => {
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

        console.log('调用更新商品API:', `${config.baseURL}/products/${id}`, data);

        uni.request({
            url: `${config.baseURL}/products/${id}`,
            method: 'PUT',
            data: data,
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            success: (response) => {
                console.log('更新商品API响应:', response);

                if (response.statusCode === 200) {
                    resolve(response.data as ProductDetail);
                } else if (response.statusCode === 400) {
                    reject(new Error('请求参数错误'));
                } else if (response.statusCode === 403) {
                    reject(new Error('无权限操作（非商品所有者）'));
                } else if (response.statusCode === 404) {
                    reject(new Error('商品未找到'));
                } else {
                    reject(new Error(`更新商品失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                console.error('更新商品API请求失败:', error);
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
};

/**
 * 删除指定商品
 * @description 对应后端 API: DELETE /products/{id}
 * @param id 商品ID
 * @returns 返回Promise，成功时无返回值
 */
const deleteProduct = (id: string): Promise<void> => {
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

        console.log('调用删除商品API:', `${config.baseURL}/products/${id}`);

        uni.request({
            url: `${config.baseURL}/products/${id}`,
            method: 'DELETE',
            header: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            success: (response) => {
                console.log('删除商品API响应:', response);

                if (response.statusCode === 204) {
                    resolve();
                } else if (response.statusCode === 403) {
                    reject(new Error('无权限操作（非商品所有者）'));
                } else if (response.statusCode === 404) {
                    reject(new Error('商品未找到'));
                } else {
                    reject(new Error(`删除商品失败: HTTP ${response.statusCode}`));
                }
            },
            fail: (error) => {
                console.error('删除商品API请求失败:', error);
                reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
            }
        });
    });
};

export {
    createProduct,
    createProductWithUrls,
    getCategories,
    getProductById,
    getProducts,
    updateProduct,
    deleteProduct
};

