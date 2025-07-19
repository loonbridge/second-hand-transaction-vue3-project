import Mock from 'mockjs'
import type { Category, CreateProductPayload, GetProductResponse, ProductDetail, ProductSummary } from '../types/productTypes'

// 配置Mock拦截
Mock.setup({
  timeout: '200-600'
})

// Mock商品列表数据
const mockProducts: ProductSummary[] = Mock.mock({
  'list|20-50': [{
    'productId': '@guid',
    'title': '@ctitle(5, 15)',
    'price|10-1000.2': 1,
    'mainImageUrl': '@image(300x300, @color, #FFF, @word)'
  }]
}).list

// Mock商品详情数据
const mockProductDetails = mockProducts.map(product => Mock.mock({
  productId: product.productId,
  title: product.title,
  'description': '@cparagraph(3, 8)',
  price: product.price,
  'imageUrls|3-6': ['@image(400x400, @color, #FFF, @word)'],
  'stock|1-100': 1,
  sellerInfo: {
    'userId': '@guid',
    'nickname': '@cname',
    'avatarUrl': '@image(100x100, @color, #FFF, @first)'
  },
  'isFavorite|1': true,
  'postedAt': '@datetime("yyyy-MM-dd HH:mm:ss")',
  'reviews|0-10': [{
    'reviewId': '@guid',
    author: {
      'userId': '@guid',
      'nickname': '@cname',
      'avatarUrl': '@image(50x50, @color, #FFF, @first)'
    },
    'content': '@csentence(10, 30)',
    'createdAt': '@datetime("yyyy-MM-dd HH:mm:ss")'
  }]
}))

// Mock商品分类数据
const mockCategories: Category[] = Mock.mock({
  'list|8-12': [{
    'categoryId': '@guid',
    'name': '@pick(["电子产品", "服装鞋包", "家具家电", "书籍文具", "运动户外", "美妆个护", "母婴玩具", "食品饮料", "汽车用品", "其他闲置"])',
    'iconUrl': '@image(60x60, @color, #FFF, @word)'
  }]
}).list

// 拦截获取商品列表接口
Mock.mock(/\/products(\?.*)?$/, 'get', (options: any) => {
  const url = new URL('http://localhost' + options.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const size = parseInt(url.searchParams.get('size') || '10')
  const query = url.searchParams.get('query')
  const categoryId = url.searchParams.get('categoryId')
  
  let filteredProducts = [...mockProducts]
  
  // 根据搜索关键词过滤
  if (query) {
    filteredProducts = filteredProducts.filter(product => 
      product.title.includes(query)
    )
  }
  
  // 根据分类过滤
  if (categoryId) {
    // 这里简化处理，实际应该根据categoryId过滤
    filteredProducts = filteredProducts.slice(0, Math.floor(filteredProducts.length / 2))
  }
  
  const startIndex = (page - 1) * size
  const endIndex = startIndex + size
  const items = filteredProducts.slice(startIndex, endIndex)
  
  const response: GetProductResponse = {
    items: items,
    totalPages: Math.ceil(filteredProducts.length / size),
    totalElements: filteredProducts.length
  }
  
  return Mock.mock(response)
})

// 拦截创建商品接口
Mock.mock(/\/products$/, 'post', (options: any) => {
  const payload: CreateProductPayload = JSON.parse(options.body)
  
  const newProduct: ProductDetail = Mock.mock({
    'productId': '@guid',
    title: payload.title,
    description: payload.description,
    price: payload.price,
    imageUrls: payload.imageUrls,
    stock: payload.stock,
    sellerInfo: {
      'userId': '@guid',
      'nickname': '@cname',
      'avatarUrl': '@image(100x100, @color, #FFF, @first)'
    },
    'isFavorite': false,
    'postedAt': '@now("yyyy-MM-dd HH:mm:ss")',
    'reviews': []
  })
  
  return newProduct
})

// 拦截获取商品详情接口
Mock.mock(/\/products\/[\w-]+$/, 'get', (options: any) => {
  const urlParts = options.url.split('/')
  const productId = urlParts[urlParts.length - 1]
  
  // 查找对应的商品详情
  let productDetail = mockProductDetails.find(p => p.productId === productId)
  
  if (!productDetail) {
    // 如果找不到，返回第一个作为默认
    productDetail = mockProductDetails[0]
  }
  
  return productDetail
})

// 拦截获取商品分类接口
Mock.mock(/\/categories$/, 'get', () => {
  return mockCategories
})

export default {
  mockProducts,
  mockProductDetails,
  mockCategories
}
