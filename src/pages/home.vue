<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="navbar">
      <view class="navbar-content">
        <text class="navbar-title">二手优选</text>
        <view class="navbar-icon">
          <text class="icon-bell">🔔</text>
        </view>
      </view>
    </view>

    <!-- 搜索框 -->
    <view class="search-container">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索闲置好物</text>
      </view>
    </view>

    <!-- 分类 -->
    <view class="category-section">
      <text class="section-title">分类</text>
      <view class="category-grid">
        <view 
          class="category-item" 
          v-for="(item, index) in categories" 
          :key="index"
          @click="navigateToCategory(item.type)"
        >
          <view class="category-icon" :style="{ backgroundColor: item.color }">
            <text class="category-emoji">{{ item.icon }}</text>
          </view>
          <text class="category-name">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 推荐商品 -->
    <view class="recommend-section">
      <text class="section-title">为您推荐</text>
      <view class="product-grid">
        <view 
          class="product-item" 
          v-for="(product, index) in recommendProducts" 
          :key="index"
          @click="navigateToProduct(product.id)"
        >
          <image class="product-image" :src="product.image" mode="aspectFill" />
          <view class="product-info">
            <text class="product-price">¥{{ product.price }}</text>
            <text class="product-title">{{ product.title }}</text>
            <text class="product-desc">{{ product.description }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 分类数据
const categories = ref([
  { name: '时尚服饰', icon: '👔', color: '#E3F2FD', type: 'fashion' },
  { name: '数码产品', icon: '💻', color: '#E8F5E8', type: 'digital' },
  { name: '家居用品', icon: '🏠', color: '#FFF3E0', type: 'home' },
  { name: '图书文具', icon: '📚', color: '#F3E5F5', type: 'books' }
])

// 推荐商品数据
const recommendProducts = ref([
  {
    id: 1,
    title: '全新时尚连衣裙',
    description: '尺码M，仅试穿',
    price: 85,
    image: '/static/product1.jpg'
  },
  {
    id: 2,
    title: '九成新品牌相机',
    description: '配件齐全，使用很少',
    price: 1200,
    image: '/static/product2.jpg'
  },
  {
    id: 3,
    title: '北欧风简约台灯',
    description: '设计感十足，几乎全新',
    price: 150,
    image: '/static/product3.jpg'
  },
  {
    id: 4,
    title: '经典文学名著套装',
    description: '无笔记，保存完好',
    price: 30,
    image: '/static/product4.jpg'
  }
])

// 导航到分类页面
const navigateToCategory = (type: string) => {
  console.log('Navigate to category:', type)
  // uni.navigateTo({
  //   url: `/pages/category/category?type=${type}`
  // })
}

// 导航到商品详情
const navigateToProduct = (id: number) => {
  console.log('Navigate to product:', id)
  // uni.navigateTo({
  //   url: `/pages/product/product?id=${id}`
  // })
}
</script>

<style scoped>
.container {
  background-color: #F5F5F5;
  min-height: 100vh;
}

/* 自定义导航栏 */
.navbar {
  background-color: #FFFFFF;
  padding-top: 12px; /* 状态栏高度 */
  padding-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 44px;
}

.navbar-title {
  font-size: 18px;
  font-weight: bold;
  color: #333333;
}

.navbar-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-bell {
  font-size: 20px;
}

/* 搜索框 */
.search-container {
  padding: 15px 20px;
  background-color: #FFFFFF;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #F5F5F5;
  border-radius: 10px;
  padding: 8px 12px;
  height: 36px;
}

.search-icon {
  font-size: 16px;
  margin-right: 8px;
  color: #999999;
}

.search-placeholder {
  color: #999999;
  font-size: 14px;
}

/* 分类部分 */
.category-section {
  background-color: #FFFFFF;
  margin-top: 10px;
  padding: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 15px;
}

.category-grid {
  display: flex;
  justify-content: space-between;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
}

.category-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.category-emoji {
  font-size: 24px;
}

.category-name {
  font-size: 12px;
  color: #666666;
  text-align: center;
}

/* 推荐商品 */
.recommend-section {
  background-color: #FFFFFF;
  margin-top: 10px;
  padding: 20px;
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
}

.product-item {
  width: 48%;
  background-color: #FFFFFF;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 120px;
  background-color: #F0F0F0;
}

.product-info {
  padding: 10px;
}

.product-price {
  font-size: 16px;
  font-weight: bold;
  color: #FF6B35;
  margin-bottom: 4px;
}

.product-title {
  font-size: 14px;
  color: #333333;
  margin-bottom: 2px;
  display: block;
}

.product-desc {
  font-size: 12px;
  color: #999999;
  display: block;
}
</style>
