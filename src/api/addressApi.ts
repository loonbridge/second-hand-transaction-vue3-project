/**
 * 地址管理相关API接口
 */

import config from "@/config";
import { getToken } from "@/utils/auth";
import type { Address, CreateAddressRequest, UpdateAddressRequest } from "./types/addressTypes";

/**
 * 获取我的收货地址列表
 * @description 对应后端 API: GET /users/me/addresses
 * @returns 返回地址列表
 */
export const getMyAddresses = (): Promise<Address[]> => {
  return new Promise((resolve, reject) => {
    const token = getToken();

    if (!token) {
      reject(new Error('未登录，请先登录'));
      return;
    }

    console.log('调用获取地址列表API:', `${config.baseURL}/users/me/addresses`);

    uni.request({
      url: `${config.baseURL}/users/me/addresses`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      success: (response) => {
        console.log('获取地址列表API响应:', response);

        if (response.statusCode === 200) {
          resolve(response.data as Address[]);
        } else if (response.statusCode === 401) {
          reject(new Error('认证失败，请重新登录'));
        } else {
          reject(new Error(`获取地址列表失败: HTTP ${response.statusCode}`));
        }
      },
      fail: (error) => {
        console.error('获取地址列表API请求失败:', error);
        reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
      }
    });
  });
};

/**
 * 新增收货地址
 * @description 对应后端 API: POST /users/me/addresses
 * @param data 地址信息
 * @returns 返回创建的地址
 */
export const createAddress = (data: CreateAddressRequest): Promise<Address> => {
  return new Promise((resolve, reject) => {
    const token = getToken();

    if (!token) {
      reject(new Error('未登录，请先登录'));
      return;
    }

    console.log('调用创建地址API:', `${config.baseURL}/users/me/addresses`, data);

    uni.request({
      url: `${config.baseURL}/users/me/addresses`,
      method: 'POST',
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      success: (response) => {
        console.log('创建地址API响应:', response);

        if (response.statusCode === 201) {
          resolve(response.data as Address);
        } else if (response.statusCode === 401) {
          reject(new Error('认证失败，请重新登录'));
        } else {
          reject(new Error(`创建地址失败: HTTP ${response.statusCode}`));
        }
      },
      fail: (error) => {
        console.error('创建地址API请求失败:', error);
        reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
      }
    });
  });
};

/**
 * 更新收货地址
 * @description 对应后端 API: PUT /users/me/addresses/{addressId}
 * @param addressId 地址ID
 * @param data 地址信息
 * @returns 返回更新后的地址
 */
export const updateAddress = (addressId: string, data: UpdateAddressRequest): Promise<Address> => {
  return new Promise((resolve, reject) => {
    const token = getToken();

    if (!token) {
      reject(new Error('未登录，请先登录'));
      return;
    }

    console.log('调用更新地址API:', `${config.baseURL}/users/me/addresses/${addressId}`, data);

    uni.request({
      url: `${config.baseURL}/users/me/addresses/${addressId}`,
      method: 'PUT',
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      success: (response) => {
        console.log('更新地址API响应:', response);

        if (response.statusCode === 200) {
          resolve(response.data as Address);
        } else if (response.statusCode === 401) {
          reject(new Error('认证失败，请重新登录'));
        } else if (response.statusCode === 404) {
          reject(new Error('地址不存在'));
        } else {
          reject(new Error(`更新地址失败: HTTP ${response.statusCode}`));
        }
      },
      fail: (error) => {
        console.error('更新地址API请求失败:', error);
        reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
      }
    });
  });
};

/**
 * 删除收货地址
 * @description 对应后端 API: DELETE /users/me/addresses/{addressId}
 * @param addressId 地址ID
 * @returns 返回删除结果
 */
export const deleteAddress = (addressId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const token = getToken();

    if (!token) {
      reject(new Error('未登录，请先登录'));
      return;
    }

    console.log('调用删除地址API:', `${config.baseURL}/users/me/addresses/${addressId}`);

    uni.request({
      url: `${config.baseURL}/users/me/addresses/${addressId}`,
      method: 'DELETE',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      success: (response) => {
        console.log('删除地址API响应:', response);

        if (response.statusCode === 200 || response.statusCode === 204) {
          resolve();
        } else if (response.statusCode === 401) {
          reject(new Error('认证失败，请重新登录'));
        } else if (response.statusCode === 404) {
          reject(new Error('地址不存在'));
        } else {
          reject(new Error(`删除地址失败: HTTP ${response.statusCode}`));
        }
      },
      fail: (error) => {
        console.error('删除地址API请求失败:', error);
        reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
      }
    });
  });
};
