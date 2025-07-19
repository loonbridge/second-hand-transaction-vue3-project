
import config from "@/config";
import type { CreateOrderPayload, GetOrdersParams, OrderSummary } from "./types/orderTypes";

/**
 * @description 获取当前用户的订单列表，可根据状态筛选
 * @summary 对应后端 API: GET /orders
 * @param {GetOrdersParams} params 查询参数对象，可包含订单状态 `status`
 * @returns {Promise<OrderSummary[]>} 返回一个 Promise，其解析值为订单摘要信息的数组
 */

const getMyOrder = (params:GetOrdersParams):Promise<OrderSummary[]> => {

  return new Promise((resolve, reject) => { 

    uni.request({
      url: `${config.baseURL}/orders`,
      method: 'GET',
      data: params,
      success: (response) => {
        resolve(response.data as OrderSummary[]);
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
}


/**
 * @description 创建一个新订单（通常用于“立即购买”场景）
 * @summary 对应后端 API: POST /orders
 * @param {CreateOrderPayload} data 包含商品ID和购买数量的请求体
 * @returns {Promise<OrderSummary>} 返回一个 Promise，其解析值为新创建订单的摘要信息
 */
 const createOrder = (data: CreateOrderPayload): Promise<OrderSummary> => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${config.baseURL}/orders`,
      method: 'POST',
      data,
      success: (response) => {
        resolve(response.data as OrderSummary);
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
};



export { createOrder, getMyOrder };

