

export interface OrderItem {
    productId: string;
    title: string;
    mainImageUrl: string;
    price: number;
    quantity: number;
}
export interface OrderSummary {
    orderId: string;
    status: string;
    totalPrice: number;
    productCount: number;
    orderItems: OrderItem;
}

/**
 * 创建订单的请求体 (Payload)
 */
export interface CreateOrderPayload {
  productId: string;
  quantity: number;
}



export type OrderStatus = 'ToPay' | 'ToShip' | 'ToReceive' | 'Completed' | 'Canceled';

/**
 * 获取我的订单列表的查询参数对象
 * @description 对应 GET /orders 的 query parameters
 */
export interface GetOrdersParams {
  /** 订单状态 (可选) */
  status?: OrderStatus;
}