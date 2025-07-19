import Mock from 'mockjs'
import type { UploadResponse } from '../types/fileTypes'

// 拦截文件上传接口
Mock.mock(/\/files\/upload$/, 'post', (options: any) => {
  // 模拟文件上传成功
  const response: UploadResponse = Mock.mock({
    'url': '@image(800x600, @color, #FFF, @word)'
  })
  
  // 模拟上传延迟
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(response)
    }, 1000 + Math.random() * 2000) // 1-3秒的延迟
  })
})

// 模拟批量上传
const mockBatchUpload = (fileCount: number): Promise<UploadResponse[]> => {
  const responses: UploadResponse[] = []
  
  for (let i = 0; i < fileCount; i++) {
    responses.push(Mock.mock({
      'url': '@image(800x600, @color, #FFF, @word)'
    }))
  }
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(responses)
    }, 1500 + Math.random() * 3000) // 1.5-4.5秒的延迟
  })
}

export default {
  mockBatchUpload
}
