<template>
  <view class="demo-page">
    <view class="header">
      <text class="title">订单取消处理演示</text>
      <text class="subtitle">模拟支付取消后的用户体验优化</text>
    </view>

    <view class="demo-section">
      <text class="section-title">问题场景</text>
      <view class="problem-card">
        <text class="problem-text">
          1. 用户创建订单，库存被锁定
          2. 用户取消支付
          3. 订单状态变为"待支付"，库存仍被锁定
          4. 用户再次购买时提示库存不足
        </text>
      </view>
    </view>

    <view class="demo-section">
      <text class="section-title">解决方案</text>
      <view class="solution-card">
        <text class="solution-text">
          ✅ 支付取消后自动跳转到订单管理页面
          ✅ 高亮显示刚创建的订单
          ✅ 提示用户库存释放时间（15分钟）
          ✅ 提供"重新购买"和"取消订单"选项
        </text>
      </view>
    </view>

    <view class="demo-section">
      <text class="section-title">体验演示</text>
      <view class="demo-buttons">
        <button class="demo-button primary" @click="simulatePaymentCancel">
          模拟支付取消
        </button>
        <button class="demo-button secondary" @click="goToOrderManage">
          查看订单管理
        </button>
      </view>
    </view>

    <view class="demo-section">
      <text class="section-title">用户体验改进</text>
      <view class="improvement-list">
        <view class="improvement-item">
          <text class="improvement-icon">🎯</text>
          <text class="improvement-text">明确的状态提示和下一步操作指引</text>
        </view>
        <view class="improvement-item">
          <text class="improvement-icon">⏰</text>
          <text class="improvement-text">告知用户库存释放时间，减少焦虑</text>
        </view>
        <view class="improvement-item">
          <text class="improvement-icon">🔄</text>
          <text class="improvement-text">提供便捷的重新购买入口</text>
        </view>
        <view class="improvement-item">
          <text class="improvement-icon">✨</text>
          <text class="improvement-text">高亮显示相关订单，提升用户体验</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 模拟支付取消
const simulatePaymentCancel = () => {
  uni.showModal({
    title: '支付已取消',
    content: '订单已创建但未支付，您可以在"我的订单"中继续支付或取消订单。库存将在15分钟后自动释放。',
    confirmText: '查看订单',
    cancelText: '继续购物',
    success: (res) => {
      if (res.confirm) {
        // 跳转到订单管理页面，模拟高亮订单
        const mockOrderId = 'demo-order-' + Date.now();
        uni.navigateTo({
          url: `/pages/order_manage?tab=TO_PAY&highlight=${mockOrderId}`
        });
      }
    }
  });
};

// 跳转到订单管理
const goToOrderManage = () => {
  uni.navigateTo({
    url: '/pages/order_manage'
  });
};
</script>

<style lang="scss" scoped>
.demo-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  
  .title {
    display: block;
    font-size: 24px;
    font-weight: bold;
    color: white;
    margin-bottom: 8px;
  }
  
  .subtitle {
    display: block;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }
}

.demo-section {
  margin-bottom: 24px;
  
  .section-title {
    display: block;
    font-size: 18px;
    font-weight: 600;
    color: white;
    margin-bottom: 12px;
  }
}

.problem-card, .solution-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .problem-text, .solution-text {
    font-size: 14px;
    line-height: 1.6;
    color: #374151;
  }
}

.solution-card {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.demo-buttons {
  display: flex;
  gap: 12px;
  
  .demo-button {
    flex: 1;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    border: none;
    
    &.primary {
      background: #3b82f6;
      color: white;
    }
    
    &.secondary {
      background: white;
      color: #3b82f6;
      border: 1px solid #3b82f6;
    }
  }
}

.improvement-list {
  .improvement-item {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    
    .improvement-icon {
      font-size: 20px;
      margin-right: 12px;
    }
    
    .improvement-text {
      font-size: 14px;
      color: white;
      flex: 1;
    }
  }
}
</style>
