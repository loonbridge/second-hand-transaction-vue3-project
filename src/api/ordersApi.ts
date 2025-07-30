
import config from "@/config";
import { getToken } from "@/utils/auth";
import type {
  CreateOrderPayload,
  GetOrdersParams,
  OrderSummary
} from "./types/orderTypes";

/**
 * @description 获取当前用户的订单列表，可根据状态筛选
 * @summary 对应后端 API: GET /orders
 * @param {GetOrdersParams} params 查询参数对象，可包含订单状态 `status`
 * @returns {Promise<OrderSummary[]>} 返回一个 Promise，其解析值为订单摘要信息的数组
 */

// 数据转换函数：将后端返回的订单数据转换为前端使用的格式
const transformOrderData = (apiOrder: any): OrderSummary => {
  return {
    orderId: apiOrder.orderId,
    status: apiOrder.status as any, // 状态映射
    totalPrice: apiOrder.totalPrice,
    productCount: apiOrder.quantity,
    orderItems: [{
      productId: apiOrder.productId,
      title: apiOrder.productTitle,
      mainImageUrl: apiOrder.productMainImageUrl,
      price: apiOrder.totalPrice,
      quantity: apiOrder.quantity
    }]
  };
};

const getMyOrder = (params: GetOrdersParams): Promise<OrderSummary[]> => {
  return new Promise((resolve, reject) => {
    const token = getToken();

    if (!token) {
      reject(new Error('未登录，请先登录'));
      return;
    }

    uni.request({
      url: `${config.baseURL}/orders`,
      method: 'GET',
      data: params,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      success: (response) => {
        console.log('获取订单列表API响应:', response);

        if (response.statusCode === 200) {
          // 处理后端返回的数据结构
          const responseData = response.data as any;

          // 检查是否有items数组
          if (responseData && responseData.items && Array.isArray(responseData.items)) {
            const transformedOrders = responseData.items.map(transformOrderData);
            resolve(transformedOrders);
          } else {
            // 如果没有items，可能是直接返回数组
            const orders = Array.isArray(responseData) ? responseData : [];
            const transformedOrders = orders.map(transformOrderData);
            resolve(transformedOrders);
          }
        } else if (response.statusCode === 401) {
          reject(new Error('认证失败，请重新登录'));
        } else {
          reject(new Error(`获取订单失败: HTTP ${response.statusCode}`));
        }
      },
      fail: (error) => {
        console.error('获取订单API请求失败:', error);
        reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
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
    const token = getToken();

    if (!token) {
      reject(new Error('未登录，请先登录'));
      return;
    }

    uni.request({
      url: `${config.baseURL}/orders`,
      method: 'POST',
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      success: (response) => {
        console.log('创建订单API响应:', response);

        if (response.statusCode === 201 || response.statusCode === 200) {
          resolve(response.data as OrderSummary);
        } else if (response.statusCode === 401) {
          reject(new Error('认证失败，请重新登录'));
        } else if (response.statusCode === 400) {
          reject(new Error(`请求参数错误: ${(response.data as any)?.message || '商品库存不足或参数无效'}`));
        } else {
          reject(new Error(`创建订单失败: HTTP ${response.statusCode}`));
        }
      },
      fail: (error) => {
        console.error('创建订单API请求失败:', error);
        reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
      }
    });
  });
};



/**
 * @description 取消订单
 * @summary 对应后端 API: PUT /orders/{orderId}/cancel
 * @param {string} orderId 订单ID
 * @returns {Promise<void>} 返回一个 Promise，成功时无返回值
 */
const cancelOrder = (orderId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const token = getToken();

    if (!token) {
      reject(new Error('未登录，请先登录'));
      return;
    }

    uni.request({
      url: `${config.baseURL}/orders/${orderId}/cancel`,
      method: 'PUT',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      success: (response) => {
        console.log('取消订单API响应:', response);

        if (response.statusCode === 200) {
          resolve();
        } else if (response.statusCode === 401) {
          reject(new Error('认证失败，请重新登录'));
        } else if (response.statusCode === 404) {
          reject(new Error('订单不存在'));
        } else if (response.statusCode === 400) {
          reject(new Error(`取消订单失败: ${(response.data as any)?.message || '订单状态不允许取消'}`));
        } else {
          reject(new Error(`取消订单失败: HTTP ${response.statusCode}`));
        }
      },
      fail: (error) => {
        console.error('取消订单API请求失败:', error);
        reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
      }
    });
  });
};

/**
 * @description 申请退款
 * @summary 对应后端 API: POST /orders/{orderId}/refund
 * @param {string} orderId 订单ID
 * @param {string} reason 退款原因
 * @returns {Promise<void>} 返回一个 Promise，成功时无返回值
 */
const requestRefund = (orderId: string, reason: string = '用户申请退款'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const token = getToken();

    if (!token) {
      reject(new Error('未登录，请先登录'));
      return;
    }

    uni.request({
      url: `${config.baseURL}/orders/${orderId}/refund`,
      method: 'POST',
      data: { reason },
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      success: (response) => {
        console.log('申请退款API响应:', response);

        if (response.statusCode === 200 || response.statusCode === 201) {
          resolve();
        } else if (response.statusCode === 401) {
          reject(new Error('认证失败，请重新登录'));
        } else if (response.statusCode === 404) {
          reject(new Error('订单不存在'));
        } else if (response.statusCode === 400) {
          reject(new Error(`申请退款失败: ${(response.data as any)?.message || '订单状态不允许退款'}`));
        } else {
          reject(new Error(`申请退款失败: HTTP ${response.statusCode}`));
        }
      },
      fail: (error) => {
        console.error('申请退款API请求失败:', error);
        reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
      }
    });
  });
};

/**
 * @description 提醒发货
 * @summary 对应后端 API: POST /orders/{orderId}/remind-ship
 * @param {string} orderId 订单ID
 * @returns {Promise<void>} 返回一个 Promise，成功时无返回值
 */
const remindShip = (orderId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const token = getToken();

    if (!token) {
      reject(new Error('未登录，请先登录'));
      return;
    }

    uni.request({
      url: `${config.baseURL}/orders/${orderId}/remind-ship`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      success: (response) => {
        console.log('提醒发货API响应:', response);

        if (response.statusCode === 200 || response.statusCode === 201) {
          resolve();
        } else if (response.statusCode === 401) {
          reject(new Error('认证失败，请重新登录'));
        } else if (response.statusCode === 404) {
          reject(new Error('订单不存在'));
        } else if (response.statusCode === 400) {
          reject(new Error(`提醒发货失败: ${(response.data as any)?.message || '订单状态不允许提醒发货'}`));
        } else {
          reject(new Error(`提醒发货失败: HTTP ${response.statusCode}`));
        }
      },
      fail: (error) => {
        console.error('提醒发货API请求失败:', error);
        reject(new Error(`网络请求失败: ${error.errMsg || '未知错误'}`));
      }
    });
  });
};

export { cancelOrder, createOrder, getMyOrder, remindShip, requestRefund };

