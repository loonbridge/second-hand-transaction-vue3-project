<template>
  <view class="message-detail-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="back-btn" @click="navigateBack">
        <uni-icons type="left" size="20" color="#333"></uni-icons>
      </view>
      <view class="nav-title">消息详情</view>
    </view>

    <!-- 消息内容区域 -->
    <view class="message-content">
      <view class="message-title">{{ message.title }}</view>
      <view class="message-body">{{ message.content }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad, onReady } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 定义消息数据结构
interface Message {
  id: number
  title: string
  content: string
  createTime?: number // 可选的时间戳
}

// 消息数据
const message = ref<Message>({
  id: 0,
  title: '',
  content: ''
})

// 页面加载时接收参数
onLoad((options: any) => {
  if (options) {
    // 解码URL参数
    message.value.id = Number(options.id)
    message.value.title = decodeURIComponent(options.title || '')
    message.value.content = decodeURIComponent(options.content || '')

    // 如果有传递时间参数则使用，否则用当前时间
    if (options.createTime) {
      message.value.createTime = Number(options.createTime)
    }
  }
})

onReady(() => {
  // 可以在这里进行页面就绪后的操作
  console.log('消息详情页加载完成', message.value)
})

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 返回上一页
const navigateBack = () => {
  uni.navigateBack({
    delta: 1
  })
}
</script>

<style scoped>
.message-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.navbar {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 16px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.back-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 500;
  color: #333;
}

.message-content {
  background-color: #fff;
  margin: 10px;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.message-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.4;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.message-body {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
}
</style>
