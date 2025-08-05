

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
    createdAt: string;
}

// 前端使用的订单数据结构
export interface OrderSummary {
    orderId: string;
    status: OrderStatus;
    totalPrice: number;
    productCount: number;
    orderItems: OrderItem[];
}

// 订单详情数据结构（用于订单详情页面）
export interface OrderDetailVO {
    orderId: string;
    orderNumber: string;
    status: string;
    priceAtPurchase: number;
    quantity: number;
    totalPrice: number;
    // 地址快照信息
    receiverNameSnapshot: string;
    phoneNumberSnapshot: string;
    shippingAddressSnapshot: string;
    // 商品信息
    productId: string;
    productTitle: string;
    productMainImageUrl: string;
    // 用户信息
    userId: string;
    sellerId: string;
    // 时间戳
    createdAt: string;
    paidAt?: string;
    shippedAt?: string;
    completedAt?: string;
    canceledAt?: string;
    updatedAt: string;
}

// 订单详情数据结构（用于订单详情页面）
export interface OrderDetailVO {
    orderId: string;
    orderNumber: string;
    status: string;
    totalPrice: number;
    // 商品快照信息
    productSnapshot: {
        productId: string;
        title: string;
        description: string;
        price: number;
        imageUrls: string[];
        categoryId: string;
        categoryName: string;
    };
    // 卖家和买家信息
    sellerInfo: {
        userId: string;
        nickname: string;
        avatarUrl: string;
    };
    buyerInfo: {
        userId: string;
        nickname: string;
        avatarUrl: string;
    };
    // 地址快照信息
    shippingInfo: {
        receiverName: string;
        phoneNumber: string;
        address: string;
        trackingNumber?: string;
        carrier?: string;
    };
    // 时间戳
    createdAt: string;
    updatedAt: string;
    paidAt?: string;
    shippedAt?: string;
    completedAt?: string;
    canceledAt?: string;
}

// API响应的分页数据结构
export interface OrderListResponse {
    items: OrderSummaryFromAPI[];
    totalElements: number;
    totalPages: number;
}

/**
 * 创建订单的请求体 (Payload)
 * 前端传递addressId，后端负责将地址信息复制到订单表的快照字段中
 */
export interface CreateOrderPayload {
  productId: string;
  quantity: number;
  addressId: string;
  phoneNumber?: string; // 可选，为本次订单指定的联系电话
}

/**
 * 微信支付参数
 */
export interface WeChatPayParams {
  appId: string;
  timeStamp: string;
  nonceStr: string;
  packageVal: string;
  signType: string;
  paySign: string;
  orderId: string;
}



/**
 * 订单状态枚举
 * 根据最新swagger文档：状态(TO_PAY, TO_SHIP, TO_RECEIVE, COMPLETED, CANCELED)
 */
export type OrderStatus = 'TO_PAY' | 'TO_SHIP' | 'TO_RECEIVE' | 'COMPLETED' | 'CANCELED';

/**
 * 订单状态常量
 */
export const ORDER_STATUS = {
  TO_PAY: 'TO_PAY' as const,
  TO_SHIP: 'TO_SHIP' as const,
  TO_RECEIVE: 'TO_RECEIVE' as const,
  COMPLETED: 'COMPLETED' as const,
  CANCELED: 'CANCELED' as const
} as const;

/**
 * 获取我的订单列表的查询参数对象
 * @description 对应 GET /orders 的 query parameters
 */
export interface GetOrdersParams {
  /** 订单状态 (可选) */
  status?: OrderStatus;
}