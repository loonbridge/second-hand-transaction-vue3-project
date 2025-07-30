/**
 * @description 上传单个文件到服务器
 * @summary 对应后端 API: POST /files/upload
 * @param {string} tempFilePath 从小程序选择文件API获取的临时文件路径
 * @returns {Promise<UploadResponse>} 返回一个 Promise，其解析值为包含文件 URL 的对象
 */

import config from "@/config";
import { getToken } from "@/utils/auth";
import type { UploadResponse } from "./types/fileTypes";

const uploadImage = (tempFilePath: string): Promise<UploadResponse> => {
    return new Promise((resolve, reject) => {
        if (!tempFilePath) {
            reject(new Error('文件路径不能为空'));
            return;
        }

        console.log('开始上传图片:', tempFilePath);

        // 先检查文件是否存在
        checkFileExists(tempFilePath).then(exists => {
            if (!exists) {
                reject(new Error('文件不存在或已被清理'));
                return;
            }

            // 文件存在，开始上传
            performUpload();
        });

        const performUpload = () => {
            const token = getToken();

            if (!token) {
                reject(new Error('未登录，请先登录'));
                return;
            }

            uni.uploadFile({
                url: `${config.baseURL}/files/upload`,
                fileType: "image",
                filePath: tempFilePath,
                name: 'productImage',
                timeout: 30000, // 30秒超时
                header: {
                    'Authorization': `Bearer ${token}`
                },
                success: (response) => {
                    console.log('上传响应:', response);

                    if (response.statusCode === 200) {
                        try {
                            const result = JSON.parse(response.data) as UploadResponse;
                            resolve(result);
                        } catch (parseError) {
                            reject(new Error('服务器响应格式错误'));
                        }
                    } else if (response.statusCode === 401) {
                        reject(new Error('认证失败，请重新登录'));
                    } else {
                        reject(new Error(`上传失败，状态码: ${response.statusCode}`));
                    }
                },
                fail: (error) => {
                    console.error('上传失败:', error);
                    reject(new Error(`上传失败: ${error.errMsg || '未知错误'}`));
                }
            });
        };
    });
}

/**
 * 检查文件是否存在
 */
const checkFileExists = (filePath: string): Promise<boolean> => {
    return new Promise((resolve) => {
        uni.getFileInfo({
            filePath: filePath,
            success: () => {
                resolve(true);
            },
            fail: () => {
                resolve(false);
            }
        });
    });
};

const getChosenImagePaths = (maxCount: number) => {
    return new Promise<string[]>((resolve, reject) => {
        uni.chooseImage({
            count: maxCount,
            sizeType: ['compressed'], // 使用压缩图片，减少文件大小
            sourceType: ['album', 'camera'], // 允许从相册选择或拍照
            success: async (res) => {
                if (res.tempFilePaths && res.tempFilePaths.length > 0) {
                    // 验证所有文件是否存在
                    const validPaths: string[] = [];
                    for (const path of res.tempFilePaths) {
                        const exists = await checkFileExists(path);
                        if (exists) {
                            validPaths.push(path);
                        } else {
                            console.warn('文件不存在:', path);
                        }
                    }

                    if (validPaths.length > 0) {
                        resolve(validPaths);
                    } else {
                        reject(new Error('所选文件都不存在'));
                    }
                } else {
                    reject(new Error('未选择文件'));
                }
            },
            fail: (error) => {
                reject(error);
            }
        });
    });
}




// 确保 checkFileExists 被正确导出，防止 tree-shaking 优化
export { checkFileExists, getChosenImagePaths, uploadImage };

