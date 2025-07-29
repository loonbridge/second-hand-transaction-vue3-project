<template>
  <HomePageLayout>
    <!-- Header Slot: Title and Notification Icon -->
    <template #header>
      <view class="custom-navbar">
        <text class="navbar-title">二手优选</text>
        <view class="notification-bell" >
           <uni-icons type="notification-filled" size="24" color="#6b7280" @click="handleBellIconClick()" ></uni-icons>
           <!-- Notification dot from the prototype -->
           <view class="notification-dot"></view>
        </view>
      </view>
    </template>

    <!-- Search Slot: Styled Search Input -->
    <template #search>
      <!-- uni-easyinput is styled to match the prototype's search bar -->
      <uni-easyinput
        prefixIcon="search"
        v-model="searchValue"
        placeholder="搜索闲置好物"
        :styles="{
          backgroundColor: '#f9fafb',
          borderColor: 'transparent'
        }"
        :input-style="{
          borderRadius: '0.5rem' // 8px
        }"
        @confirm="handleSearch"
        @clear="loadProducts()"
      >
      </uni-easyinput>
    </template>

    <!-- Default Slot: Page Content -->
    <template #category>
      <CategoryGrid :categories="categories" @category-click="handleCategoryClick" />
    </template>
    

    <template #product>
      <!-- 加载状态 -->
      <view v-if="isLoading" class="loading-container">
        <uni-load-more status="loading"></uni-load-more>
      </view>

      <!-- 商品列表 -->
      <ProductGrid v-else :products="recommendProducts" />

      <!-- 空状态 -->
      <view v-if="!isLoading && recommendProducts.length === 0" class="empty-container">
        <text class="empty-text">暂无商品数据</text>
        <button class="retry-btn" @click="loadProducts()">重新加载</button>
      </view>
    </template>

  </HomePageLayout>
</template>

<script setup lang="ts">
import { getCategories, getProducts } from '@/api/productsApi';
import type { Category, ProductSummary } from '@/api/types/productTypes';
import CategoryGrid from '@/components/common/homePage/CategoryGrid.vue';
import ProductGrid from '@/components/common/homePage/ProductGrid.vue';
import HomePageLayout from '@/components/layout/HomePageLayout.vue';
import { onMounted, ref } from 'vue';

// 响应式数据
const searchValue = ref('');
const categories = ref<Category[]>([]);
const recommendProducts = ref<ProductSummary[]>([]);
const isLoading = ref(false);

// 事件处理
const handleBellIconClick = () => {
  console.log('Notification bell clicked');
  uni.navigateTo({
    url: '/pages/notifications'
  });
};

// 搜索处理
const handleSearch = () => {
  if (searchValue.value.trim()) {
    console.log('搜索关键词:', searchValue.value);
    loadProducts({ query: searchValue.value.trim() });
  }
};

// 分类点击处理
const handleCategoryClick = (category: Category) => {
  console.log('分类点击:', category);
  loadProducts({ categoryId: category.categoryId.toString() });
};

// 加载分类数据
const loadCategories = async () => {
  try {
    console.log('开始加载分类数据...');
    const categoriesData = await getCategories();
    categories.value = categoriesData;
    console.log('分类数据加载成功:', categoriesData);
  } catch (error) {
    console.error('加载分类失败:', error);
    uni.showToast({
      title: '加载分类失败',
      icon: 'none'
    });

    // 使用默认分类数据作为备用
    categories.value = [
      { name: '时尚服饰', iconUrl: 'cart-filled', categoryId: 1 },
      { name: '数码产品', iconUrl: 'pyq', categoryId: 2 },
      { name: '家居用品', iconUrl: 'home', categoryId: 3 },
      { name: '图书文具', iconUrl: 'compose', categoryId: 4 }
    ];
  }
};

// 加载商品数据
const loadProducts = async (params: { query?: string; categoryId?: string } = {}) => {
  try {
    isLoading.value = true;
    console.log('开始加载商品数据...', params);

    const response = await getProducts({
      page: 1,
      size: 10,
      ...params
    });

    recommendProducts.value = response.items;
    console.log('商品数据加载成功:', response);
  } catch (error) {
    console.error('加载商品失败:', error);
    uni.showToast({
      title: '加载商品失败',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
  }
};

// 页面初始化
onMounted(() => {
  console.log('首页初始化...');
  loadCategories();
  loadProducts();
});
</script>

<style scoped lang="scss">
:root {
  --text-primary: #111827;
  --primary-color: #0b80ee;
}

.custom-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem; // Add some space above title
  padding-bottom: 0.25rem;
}

.navbar-title {
  font-size: 1.5rem;   // 24px
  font-weight: 700;    // bold
  color: var(--text-primary);
}

.notification-bell {
    position: relative;
    padding: 0.5rem; // Increase clickable area
}

.notification-dot {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 0.5rem; // 8px
    height: 0.5rem; // 8px
    border-radius: 50%;
    background-color: var(--primary-color);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-text {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.retry-btn {
  background-color: var(--primary-color);
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;

  &:active {
    opacity: 0.8;
  }
}
</style>