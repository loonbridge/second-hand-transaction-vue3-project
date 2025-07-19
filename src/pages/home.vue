<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="navbar flex justify-between p-4x p-4t">
      <view class="navbar-content flex justify-between item-center">
        <text class="navbar-title item-center">二手优选</text>
      </view>
        
      <div class="flex item-center p-2">

        <button class="navbar-icon">
          <text class="icon-bell">🔔</text>
        </button>
      </div>
    </view>

    <!-- 搜索框 -->
    <view class="search-container">
      <view class="search-box">
        <div class="search-icon">🔍</div>
        <input class="search-placeholder" placeholder="搜索闲置好物" />
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

<style scoped src="../static/styles/local/home.css">

</style>
