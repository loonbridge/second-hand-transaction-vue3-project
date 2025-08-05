<template>
  <PageLayout title="我的收藏" @back-click="handleBackClick">
    <view class="favorites-page">
      <!-- 空状态 -->
      <view v-if="!isLoading && favorites.length === 0" class="empty-state">
        <uni-icons type="heart" color="#d1d5db" size="64"></uni-icons>
        <text class="empty-title">暂无收藏商品</text>
        <text class="empty-subtitle">去首页看看有什么好东西吧</text>
        <button class="go-home-btn" @click="goToHome">
          <text class="go-home-text">去首页逛逛</text>
        </button>
      </view>

      <!-- 收藏列表 -->
      <view v-else class="favorites-list">
        <ProductCard
          v-for="product in favorites"
          :key="product.productId"
          :product="product"
          :show-actions="true"
          :show-seller="true"
          :show-time="true"
          :actions="favoriteActions"
          card-type="favorite"
          @click="handleProductClick"
          @action="handleProductAction"
        />
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore && !isLoading" class="load-more" @click="loadMore">
        <text class="load-more-text">加载更多</text>
      </view>

      <!-- 加载中 -->
      <view v-if="isLoading" class="loading">
        <uni-icons type="spinner-cycle" color="#0b80ee" size="24"></uni-icons>
        <text class="loading-text">加载中...</text>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMyFavorites, removeFavorite } from '@/api/useApi';
import type { ProductSummary } from '@/api/types/productTypes';
import PageLayout from '@/components/layout/PageLayout.vue';
import ProductCard, { type ActionType, type CardAction } from '@/components/common/ProductCard.vue';

// 响应式数据
const favorites = ref<ProductSummary[]>([]);
const isLoading = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const pageSize = 10;

// 收藏商品的操作按钮
const favoriteActions: CardAction[] = [
  {
    type: 'unfavorite',
    icon: 'heart-filled',
    color: '#ef4444',
    class: 'unfavorite-btn'
  }
];

// 页面初始化
onMounted(() => {
  loadFavorites();
});

// 加载收藏列表
const loadFavorites = async (page = 1) => {
  if (isLoading.value) return;

  console.log('🔍 [MyFavorites] 开始加载收藏列表:', { page, pageSize });
  isLoading.value = true;

  try {
    const response = await getMyFavorites({
      page,
      size: pageSize
    });

    console.log('✅ [MyFavorites] API响应成功:');
    console.log('  - 总页数:', response.totalPages);
    console.log('  - 总收藏数:', response.totalElements);
    console.log('  - 当前页收藏数:', response.items?.length);
    console.log('  - 收藏列表:', response.items);

    if (response.items && Array.isArray(response.items)) {
      response.items.forEach((item, index) => {
        console.log(`  - 收藏${index + 1}:`, {
          id: item.productId,
          title: item.title,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          imageUrls: item.imageUrls,
          mainImageUrl: item.mainImageUrl,
          imageUrlsType: typeof item.imageUrls,
          mainImageUrlType: typeof item.mainImageUrl
        });
      });
    }

    if (page === 1) {
      favorites.value = response.items || [];
    } else {
      favorites.value.push(...(response.items || []));
    }

    hasMore.value = page < (response.totalPages || 1);
    currentPage.value = page;

    console.log('📊 [MyFavorites] 状态更新:');
    console.log('  - 收藏总数:', favorites.value.length);
    console.log('  - 是否有更多:', hasMore.value);
    console.log('  - 当前页码:', currentPage.value);
  } catch (error: any) {
    console.error('❌ [MyFavorites] 加载收藏列表失败:', error);
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
  }
};

// 加载更多
const loadMore = () => {
  if (hasMore.value && !isLoading.value) {
    loadFavorites(currentPage.value + 1);
  }
};

// 返回按钮点击
const handleBackClick = () => {
  uni.navigateBack();
};

// 商品点击
const handleProductClick = (product: ProductSummary) => {
  uni.navigateTo({
    url: `/pages/product?id=${product.productId}`
  });
};

// 商品操作处理
const handleProductAction = (actionType: ActionType, product: ProductSummary) => {
  switch (actionType) {
    case 'unfavorite':
      handleUnfavorite(product);
      break;
    default:
      console.warn('未知的操作类型:', actionType);
  }
};

// 取消收藏
const handleUnfavorite = async (product: ProductSummary) => {
  try {
    await removeFavorite(product.productId);
    
    // 从列表中移除
    const index = favorites.value.findIndex(item => item.productId === product.productId);
    if (index > -1) {
      favorites.value.splice(index, 1);
    }

    uni.showToast({
      title: '已取消收藏',
      icon: 'success'
    });
  } catch (error: any) {
    console.error('取消收藏失败:', error);
    uni.showToast({
      title: error.message || '操作失败',
      icon: 'none'
    });
  }
};

// 去首页
const goToHome = () => {
  uni.switchTab({
    url: '/pages/home'
  });
};

// 图片加载失败处理
const handleImageError = () => {
  console.log('商品图片加载失败，使用默认图片');
};
</script>

<style lang="scss" scoped>
:root {
  --background-color: #ffffff;
  --surface-color: #f9fafb;
  --border-color: #e5e7eb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --primary-color: #0b80ee;
  --error-color: #ef4444;
}

.favorites-page {
  padding: 16px;
  background-color: var(--background-color);
  min-height: 100vh;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 16px 0 8px;
}

.empty-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.go-home-btn {
  background-color: var(--primary-color);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
}

.go-home-text {
  font-size: 16px;
  color: #ffffff;
  font-weight: 500;
}

// 收藏列表
.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// 加载更多
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin-top: 16px;
  background-color: var(--surface-color);
  border-radius: 8px;
}

.load-more-text {
  font-size: 14px;
  color: var(--primary-color);
}

// 加载中
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  margin-top: 16px;
}

.loading-text {
  font-size: 14px;
  color: var(--text-secondary);
}
</style>
