<template>
  <HomePageLayout>
    <!-- Header Slot: Title and Notification Icon -->
    <template #header>
      <view class="custom-navbar">
        <text class="navbar-title">二手优选</text>
        <view class="notification-bell" @click="handleBellIconClick()">
           <uni-icons type="notification-filled" size="24" color="#6b7280"></uni-icons>
           <!-- 未读消息数量提醒 -->
           <view v-if="unreadCount > 0" class="notification-badge">
             {{ unreadCount > 99 ? '99+' : unreadCount }}
           </view>
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
      <!-- 商品列表容器 -->
      <scroll-view
        class="product-scroll-container"
        scroll-y
        refresher-enabled
        :refresher-triggered="isRefreshing"
        @refresherrefresh="handleRefresh"
        @scrolltolower="handleLoadMore"
      >
        <!-- 加载状态 -->
        <view v-if="isLoading && recommendProducts.length === 0" class="loading-container">
          <uni-load-more status="loading"></uni-load-more>
        </view>

        <!-- 商品列表 -->
        <ProductGrid
          v-else-if="recommendProducts.length > 0"
          :products="recommendProducts"
          :hasMore="hasMore"
          :isLoadingMore="isLoadingMore"
          @loadMore="handleLoadMore"
        />

        <!-- 空状态 -->
        <view v-else-if="!isLoading" class="empty-container">
          <view class="empty-icon">📦</view>
          <text class="empty-text">暂无商品数据</text>
          <button class="retry-btn" @click="loadProducts({}, true)">重新加载</button>
        </view>
      </scroll-view>
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
import { unreadCount, initNotificationReminder } from '@/utils/notificationUtils';

// 响应式数据
const searchValue = ref('');
const categories = ref<Category[]>([]);
const recommendProducts = ref<ProductSummary[]>([]);
const isLoading = ref(false);
const isRefreshing = ref(false);
const isLoadingMore = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const pageSize = 10;
const currentSearchParams = ref<{ query?: string; categoryId?: string }>({});

// 事件处理
const handleBellIconClick = () => {
  console.log('🔔 [Home] 消息铃铛点击，未读消息数量:', unreadCount.value);
  uni.navigateTo({
    url: '/pages/notifications'
  });
};

// 搜索处理
const handleSearch = () => {
  if (searchValue.value.trim()) {
    console.log('🔍 [Home] 搜索关键词:', searchValue.value);
    loadProducts({ query: searchValue.value.trim() }, true);
  }
};

// 分类点击处理
const handleCategoryClick = (category: Category) => {
  console.log('🏷️ [Home] 分类点击:', category);
  console.log('  - 分类ID:', category.categoryId);
  console.log('  - 分类名称:', category.name);
  loadProducts({ categoryId: category.categoryId }, true);
};



// 加载分类数据
const loadCategories = async () => {
  try {
    console.log('开始加载分类数据...');
    const categoriesData = await getCategories();
    categories.value = categoriesData;
    console.log('分类数据加载成功:', categoriesData);
  } catch (error: any) {
    console.error('加载分类失败:', error);

    // 处理认证错误
    if (error.message && error.message.includes('认证失败')) {
      console.log('分类需要登录才能查看，使用默认分类');
    } else {
      uni.showToast({
        title: error.message || '加载分类失败',
        icon: 'none'
      });
    }

    // 使用默认分类数据作为备用（根据swagger文档，categoryId为string类型）
    categories.value = [
      { name: '时尚服饰', iconUrl: 'cart-filled', categoryId: 'cat_fashion' },
      { name: '数码产品', iconUrl: 'pyq', categoryId: 'cat_digital' },
      { name: '家居用品', iconUrl: 'home', categoryId: 'cat_home' },
      { name: '图书文具', iconUrl: 'compose', categoryId: 'cat_books' }
    ];
  }
};

// 加载商品数据（支持分页）
const loadProducts = async (
  params: { query?: string; categoryId?: string } = {},
  isRefresh: boolean = false
) => {
  try {
    // 如果是刷新或新搜索，重置分页状态
    if (isRefresh) {
      isRefreshing.value = true;
      currentPage.value = 1;
      hasMore.value = true;
      currentSearchParams.value = params;
    } else if (currentPage.value === 1) {
      isLoading.value = true;
    } else {
      isLoadingMore.value = true;
    }

    console.log('🔍 [Home] 开始加载商品数据:', {
      params,
      page: currentPage.value,
      size: pageSize,
      isRefresh,
      isLoadingMore: isLoadingMore.value
    });

    const response = await getProducts({
      page: currentPage.value,
      size: pageSize,
      ...params
    });

    console.log('✅ [Home] 商品API响应成功:', {
      totalElements: response.totalElements,
      totalPages: response.totalPages,
      currentPage: currentPage.value,
      itemsCount: response.items?.length || 0
    });

    if (response.items && Array.isArray(response.items)) {
      response.items.forEach((item, index) => {
        console.log(`  - 商品${index + 1}:`, {
          id: item.productId,
          title: item.title,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          mainImageUrl: item.mainImageUrl,
          mainImageUrlType: typeof item.mainImageUrl
        });
      });
    }

    // 更新商品列表
    if (isRefresh || currentPage.value === 1) {
      recommendProducts.value = response.items || [];
    } else {
      recommendProducts.value.push(...(response.items || []));
    }

    // 更新分页状态
    hasMore.value = currentPage.value < (response.totalPages || 1);

    console.log('📊 [Home] 商品状态更新:', {
      总商品数: recommendProducts.value.length,
      当前页: currentPage.value,
      总页数: response.totalPages,
      是否有更多: hasMore.value
    });

  } catch (error: any) {
    console.error('❌ [Home] 加载商品失败:', error);

    // 处理认证错误
    if (error.message && error.message.includes('认证失败')) {
      uni.showModal({
        title: '需要登录',
        content: '请先登录后查看商品列表',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: '/pages/login'
            });
          }
        }
      });
    } else {
      uni.showToast({
        title: error.message || '加载商品失败',
        icon: 'none'
      });
    }
  } finally {
    isLoading.value = false;
    isRefreshing.value = false;
    isLoadingMore.value = false;
  }
};

// 下拉刷新
const handleRefresh = () => {
  console.log('🔄 [Home] 下拉刷新');
  loadProducts(currentSearchParams.value, true);
};

// 加载更多
const handleLoadMore = () => {
  if (!hasMore.value || isLoadingMore.value) {
    console.log('⚠️ [Home] 无法加载更多:', { hasMore: hasMore.value, isLoadingMore: isLoadingMore.value });
    return;
  }

  console.log('📄 [Home] 加载更多商品');
  currentPage.value++;
  loadProducts(currentSearchParams.value, false);
};



// 页面初始化
onMounted(() => {
  console.log('🚀 [Home] 首页挂载');

  // 加载分类和推荐商品
  loadCategories();
  loadProducts();

  // 初始化消息提醒
  initNotificationReminder();
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

.notification-badge {
    position: absolute;
    top: 0;
    right: 0;
    background-color: #ef4444;
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

.product-scroll-container {
  height: 100%;
  flex: 1;
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

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
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