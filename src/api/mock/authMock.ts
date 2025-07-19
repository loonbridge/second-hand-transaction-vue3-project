import Mock from 'mockjs'
import type { LoginResponse } from '../types/authTypes'

// Mock用户数据
const mockUsers = Mock.mock({
  'list|10-20': [{
    'userId': '@guid',
    'nickname': '@cname',
    'avatarUrl': '@image(100x100, @color, #FFF, @first)',
    'joinDate': '@datetime("yyyy-MM-dd")'
  }]
}).list

// 拦截登录接口
Mock.mock(/\/auth\/login$/, 'post', (options: any) => {
  const requestData = JSON.parse(options.body)
  
  // 模拟微信登录验证
  if (requestData.code) {
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)]
    
    const response: LoginResponse = Mock.mock({
      'token': '@string("lower", 32)',
      user: {
        userId: randomUser.userId,
        nickname: randomUser.nickname,
        avatarUrl: randomUser.avatarUrl,
        joinDate: randomUser.joinDate
      }
    })
    
    return response
  } else {
    // 模拟登录失败
    return Mock.mock({
      code: 400,
      message: '登录失败，请重试'
    })
  }
})

export default {
  mockUsers
}
