import Mock from 'mockjs'
import type { Notification } from '../types/notificationTypes'

// Mock消息通知数据
const mockNotifications: Notification[] = Mock.mock({
  'list|20-40': [{
    'notificationId': '@guid',
    'type': '@pick(["system", "transaction"])',
    'title': function(this: any) {
      return this.type === 'system' ? 
        Mock.mock('@pick(["系统维护通知", "版本更新提醒", "安全提醒", "功能上线通知"])') :
        Mock.mock('@pick(["订单状态更新", "商品售出通知", "收到新评价", "买家咨询"])')
    },
    'content': function(this: any) {
      return this.type === 'system' ? 
        Mock.mock('@cparagraph(1, 3)') :
        Mock.mock('@csentence(10, 30)')
    },
    'createdAt': '@datetime("yyyy-MM-dd HH:mm:ss")',
    'isRead|1': true
  }]
}).list

// 拦截获取消息列表接口
Mock.mock(/\/notifications(\?.*)?$/, 'get', (options: any) => {
  const url = new URL('http://localhost' + options.url)
  const type = url.searchParams.get('type') as 'system' | 'transaction'
  
  let filteredNotifications = [...mockNotifications]
  
  // 根据消息类型过滤
  if (type) {
    filteredNotifications = filteredNotifications.filter(notification => 
      notification.type === type
    )
  }
  
  // 按创建时间降序排序
  filteredNotifications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  
  return filteredNotifications
})

export default {
  mockNotifications
}
