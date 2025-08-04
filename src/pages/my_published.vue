<template>
  <PageLayout title="我的发布" @back-click="handleBackClick">
    <!-- 主要内容 -->
    <view class="my-published-page">
      <!-- 加载状态 -->
      <view v-if="isLoading" class="loading-container">
        <uni-icons type="spinner-cycle" size="32" color="#0b80ee"></uni-icons>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 商品列表 -->
      <view v-else-if="products.length > 0" class="products-container">
        <ProductCard
          v-for="product in products"
          :key="product.productId"
          :product="product"
          :show-status="true"
          :show-actions="true"
          :show-stock="true"
          :show-time="true"
          :actions="publishedActions"
          card-type="published"
          @click="handleProductClick"
          @action="handleProductAction"
        />
        
        <!-- 加载更多 -->
        <view v-if="hasMore" class="load-more-container">
          <button 
            class="load-more-btn" 
            @click="handleLoadMore" 
            :disabled="loadingMore"
          >
            <text class="load-more-text">
              {{ loadingMore ? '加载中...' : '加载更多' }}
            </text>
          </button>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-container">
        <uni-icons type="shop" size="64" color="#d1d5db"></uni-icons>
        <text class="empty-title">暂无发布的商品</text>
        <text class="empty-desc">快去发布您的第一个商品吧</text>
        <button class="publish-btn" @click="handleGoToPublish">
          <text class="publish-text">立即发布</text>
        </button>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getProducts, deleteProduct } from '@/api/productsApi';
import { getUserInfo } from '@/utils/auth';
import type { ProductSummary } from '@/api/types/productTypes';

// 导入组件
import PageLayout from '@/components/layout/PageLayout.vue';
import ProductCard, { type ActionType, type CardAction } from '@/components/common/ProductCard.vue';

// 响应式数据
const products = ref<ProductSummary[]>([]);
const isLoading = ref(false);
const loadingMore = ref(false);
const hasMore = ref(false);
const currentPage = ref(1);
const pageSize = 10;

// 发布商品的操作按钮
const publishedActions: CardAction[] = [
  {
    type: 'edit',
    icon: 'compose',
    color: '#ff6b35',
    class: 'edit-btn'
  },
  {
    type: 'delete',
    icon: 'trash',
    color: '#ff6b35',
    class: 'delete-btn'
  }
];

// 页面加载
onMounted(() => {
  loadMyProducts();
});

// 加载我的发布商品
const loadMyProducts = async (page: number = 1) => {
  try {
    if (page === 1) {
      isLoading.value = true;
    } else {
      loadingMore.value = true;
    }

    const userInfo = getUserInfo();
    if (!userInfo) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    // 获取当前用户发布的商品
    const response = await getProducts({
      page,
      size: pageSize,
      sellerId: 'me' // 根据API文档，使用'me'获取当前用户的商品
    });

    if (page === 1) {
      products.value = response.items;
    } else {
      products.value.push(...response.items);
    }

    hasMore.value = page < response.totalPages;
    currentPage.value = page;

    console.log('我的发布商品加载成功:', response);
  } catch (error: any) {
    console.error('加载我的发布商品失败:', error);
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
    loadingMore.value = false;
  }
};

// 返回按钮点击
const handleBackClick = () => {
  uni.navigateBack();
};

// 商品卡片点击
const handleProductClick = (product: ProductSummary) => {
  uni.navigateTo({
    url: `/pages/product?id=${product.productId}`
  });
};

// 商品操作处理
const handleProductAction = (actionType: ActionType, product: ProductSummary) => {
  switch (actionType) {
    case 'edit':
      handleEditProduct(product);
      break;
    case 'delete':
      handleDeleteProduct(product);
      break;
    default:
      console.warn('未知的操作类型:', actionType);
  }
};

// 加载更多
const handleLoadMore = () => {
  if (hasMore.value && !loadingMore.value) {
    loadMyProducts(currentPage.value + 1);
  }
};

// 去发布商品
const handleGoToPublish = () => {
  uni.switchTab({
    url: '/pages/publish'
  });
};

// 编辑商品
const handleEditProduct = (product: ProductSummary) => {
  uni.navigateTo({
    url: `/pages/edit_product?id=${product.productId}`
  });
};

// 删除商品
const handleDeleteProduct = (product: ProductSummary) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除商品"${product.title}"吗？此操作不可撤销。`,
    confirmText: '删除',
    confirmColor: '#ff4757',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 调用删除商品API
          await deleteProduct(product.productId);

          // 从列表中移除
          const index = products.value.findIndex(p => p.productId === product.productId);
          if (index > -1) {
            products.value.splice(index, 1);
          }

          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });

          // 如果当前页面没有商品了，重新加载
          if (products.value.length === 0 && currentPage.value > 1) {
            currentPage.value = 1;
            loadMyProducts(1);
          }
        } catch (error: any) {
          console.error('删除商品失败:', error);
          uni.showToast({
            title: error.message || '删除失败',
            icon: 'none'
          });
        }
      }
    }
  });
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
}

.my-published-page {
  min-height: 100vh;
  background-color: var(--surface-color);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.products-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.load-more-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.load-more-btn {
  padding: 10px 24px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background-color: var(--background-color);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--surface-color);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.load-more-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.empty-container {
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
  margin: 16px 0 8px 0;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.publish-btn {
  padding: 12px 24px;
  background-color: var(--primary-color);
  border: none;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #0969da;
  }

  &:active {
    transform: scale(0.98);
  }
}

.publish-text {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

// 响应式设计
@media (max-width: 375px) {
  .products-container {
    padding: 12px;
  }

  .empty-container {
    padding: 60px 16px;
  }
}
</style>
