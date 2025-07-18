import Mock from 'mockjs'

// 导入所有mock模块以激活拦截
import './authMock'
import './fileMock'
import './notificationMock'
import './orderMock'
import './productMock'

// 全局Mock配置
Mock.setup({
  timeout: '200-800' // 响应时间
})

// 开发环境下启用Mock
const isDevelopment = import.meta.env.MODE === 'development'

if (isDevelopment) {
  console.log('🚀 Mock服务已启动')
}

// 导出Mock实例供其他地方使用
export default Mock
