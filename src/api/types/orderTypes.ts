

export interface OrderItem {
    productId: string;
    title: string;
    mainImageUrl: string;
    price: number;
    quantity: number;
}

// 后端实际返回的订单数据结构
export interface OrderSummaryFromAPI {
    orderId: string;
    priceAtPurchase: number | null;
    productId: string;
    productMainImageUrl: string;
    productTitle: string;
    quantity: number;
    status: string;
    totalPrice: number;
}

// 前端使用的订单数据结构
export interface OrderSummary {
    orderId: string;
    status: OrderStatus;
    totalPrice: number;
    productCount: number;
    orderItems: OrderItem[];
}

// API响应的分页数据结构
export interface OrderListResponse {
    items: OrderSummaryFromAPI[];
    totalElements: number;
    totalPages: number;
}

/**
 * 创建订单的请求体 (Payload)
 */
export interface CreateOrderPayload {
  productId: string;
  quantity: number;
}



export type OrderStatus = 'ToPay' | 'ToShip' | 'ToReceive' | 'Completed' | 'Canceled' | 'TO_PAY' | 'TO_SHIP' | 'TO_RECEIVE' | 'COMPLETED' | 'CANCELLED';

/**
 * 获取我的订单列表的查询参数对象
 * @description 对应 GET /orders 的 query parameters
 */
export interface GetOrdersParams {
  /** 订单状态 (可选) */
  status?: OrderStatus;
}