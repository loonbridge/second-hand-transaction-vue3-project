import Mock from 'mockjs'
import type { CreateOrderPayload, OrderStatus, OrderSummary } from '../types/orderTypes'

// Mock订单数据
const mockOrders: OrderSummary[] = Mock.mock({
  'list|15-30': [{
    'orderId': '@guid',
    'status': '@pick(["ToPay", "ToShip", "ToReceive", "Completed", "Canceled"])',
    'totalPrice|50-2000.2': 1,
    'productCount|1-5': 1,
    orderItems: {
      'productId': '@guid',
      'title': '@ctitle(5, 15)',
      'mainImageUrl': '@image(200x200, @color, #FFF, @word)',
      'price|10-500.2': 1,
      'quantity|1-3': 1
    }
  }]
}).list

// 拦截获取我的订单列表接口
Mock.mock(/\/orders(\?.*)?$/, 'get', (options: any) => {
  const url = new URL('http://localhost' + options.url)
  const status = url.searchParams.get('status') as OrderStatus
  
  let filteredOrders = [...mockOrders]
  
  // 根据订单状态过滤
  if (status) {
    filteredOrders = filteredOrders.filter(order => order.status === status)
  }
  
  return filteredOrders
})

// 拦截创建订单接口
Mock.mock(/\/orders$/, 'post', (options: any) => {
  const payload: CreateOrderPayload = JSON.parse(options.body)
  
  const newOrder: OrderSummary = Mock.mock({
    'orderId': '@guid',
    'status': 'ToPay',
    'totalPrice|50-500.2': 1,
    productCount: payload.quantity,
    orderItems: {
      productId: payload.productId,
      'title': '@ctitle(5, 15)',
      'mainImageUrl': '@image(200x200, @color, #FFF, @word)',
      'price|50-500.2': 1,
      quantity: payload.quantity
    }
  })
  
  return newOrder
})

export default {
  mockOrders
}
