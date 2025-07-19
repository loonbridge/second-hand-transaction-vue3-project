/**
 * @description 上传单个文件到服务器
 * @summary 对应后端 API: POST /files/upload
 * @param {string} tempFilePath 从小程序选择文件API获取的临时文件路径
 * @returns {Promise<UploadResponse>} 返回一个 Promise，其解析值为包含文件 URL 的对象
 */

import config from "@/config";
import type { UploadResponse } from "./types/fileTypes";

const uploadImage = (tempFilePath: string): Promise<UploadResponse> => {
    return new Promise((resolve, reject) => {
        if (!tempFilePath) {
            reject(new Error('文件路径不能为空'));
            return;
        }


        uni.uploadFile({
            url: `${config.baseURL}/files/upload`,
            fileType:"image",
            filePath: tempFilePath,
            name: 'productImage',
            success: (response) => {
                resolve(JSON.parse(response.data) as UploadResponse);
            },
            fail: (error) => {
                reject(error);
            }
        });
    });



}

const getChosenImagePaths = (maxCount:number) => {
    return new Promise<string[]>((resolve, reject) => {
        uni.chooseImage({
        count: maxCount,
            success: (res) => {
                if (res.tempFilePaths && res.tempFilePaths.length > 0) {
                    resolve(res.tempFilePaths as string[] );
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




export { getChosenImagePaths, uploadImage };

