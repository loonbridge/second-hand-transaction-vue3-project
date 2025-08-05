<template>
  <ProductDetailLayout @back-click="handleBackClick">
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <button v-if="!isOwner" class="header-action-btn" @click="handleShareClick">
        <uni-icons type="redo" color="#6b7280" size="20"></uni-icons>
      </button>
    </template>

    <!-- 商品图片轮播 -->
    <template #product-images>
      <ProductImageCarousel
        v-if="product"
        :image-urls="product.imageUrls"
        @image-click="handleImageClick"
      />
    </template>

    <!-- 商品基本信息 -->
    <template #product-info>
      <ProductInfo
        v-if="product"
        :product="product"
        @favorite-click="handleFavoriteClick"
        @share-click="handleShareClick"
      />
    </template>

    <!-- 卖家信息 -->
    <template #seller-info>
      <SellerInfo
        v-if="product"
        :seller="product.sellerInfo"
        :is-following="product.isFollowingSeller"
        :is-owner="isOwner"
        @follow-click="handleFollowClick"
        @view-seller-products="handleViewSellerProducts"
        @contact-seller="handleContactSeller"
      />
    </template>

    <!-- 商品描述 -->
    <template #product-description>
      <ProductDescription
        v-if="product"
        :description="product.description"
      />
    </template>

    <!-- 评论区域 -->
    <template #reviews>
      <ReviewList
        v-if="product"
        :reviews="reviews"
        :total-count="reviewsTotal"
        :loading="reviewsLoading"
        :loading-more="reviewsLoadingMore"
        :has-more="reviewsHasMore"
        :can-add-review="canAddReview"
        @add-review="handleAddReview"
        @load-more="handleLoadMoreReviews"
      />
    </template>

    <!-- 底部操作栏 -->
    <template #bottom-actions>
      <BottomActions
        v-if="product"
        :is-owner="isOwner"
        :product-id="product.productId"
        :stock="product.stock"
        @contact-seller="handleContactSeller"
        @want-it="handleWantIt"
        @edit-product="handleEditProduct"
        @delete-product="handleDeleteProduct"
      />
    </template>
  </ProductDetailLayout>

  <!-- 购买弹窗 -->
  <PurchaseModal
    v-if="product"
    :visible="showPurchaseModal"
    :product="product"
    @close="closePurchaseModal"
    @success="handlePurchaseSuccess"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getProductById, deleteProduct } from '@/api/productsApi';
import { getProductReviews, createProductReview } from '@/api/reviewsApi';
import { addFavorite, removeFavorite, followUser, unfollowUser } from '@/api/useApi';
import { getUserInfo } from '@/utils/auth';
import type { ProductDetail, Review, CreateReviewRequest } from '@/api/types/productTypes';

// 导入组件
import ProductDetailLayout from '@/components/layout/ProductDetailLayout.vue';
import ProductImageCarousel from '@/components/common/productDetail/ProductImageCarousel.vue';
import ProductInfo from '@/components/common/productDetail/ProductInfo.vue';
import SellerInfo from '@/components/common/productDetail/SellerInfo.vue';
import ProductDescription from '@/components/common/productDetail/ProductDescription.vue';
import ReviewList from '@/components/common/productDetail/ReviewList.vue';
import BottomActions from '@/components/common/productDetail/BottomActions.vue';
import PurchaseModal from '@/components/common/PurchaseModal.vue';

// 响应式数据
const product = ref<ProductDetail | null>(null);
const reviews = ref<Review[]>([]);
const reviewsTotal = ref(0);
const reviewsLoading = ref(false);
const reviewsLoadingMore = ref(false);
const reviewsHasMore = ref(false);
const currentPage = ref(1);
const pageSize = 10;

// 页面参数
const productId = ref<string>('');
const currentUserId = ref<string>('');

// 购买弹窗相关
const showPurchaseModal = ref(false);

// 计算属性
const isOwner = computed(() => {
  return product.value && currentUserId.value &&
         product.value.sellerInfo.userId === currentUserId.value;
});

const canAddReview = computed(() => {
  // 只有非商品所有者且已登录的用户可以添加评论
  return currentUserId.value && !isOwner.value;
});

// 页面加载
onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  const options = currentPage.options || {};

  productId.value = options.id || '';

  if (!productId.value) {
    uni.showToast({
      title: '商品ID不能为空',
      icon: 'none'
    });
    return;
  }

  // 获取当前用户信息
  const userInfo = getUserInfo();
  if (userInfo) {
    currentUserId.value = userInfo.userId;
  }

  // 加载数据
  loadProductDetail();
  loadReviews();
});

// 加载商品详情
const loadProductDetail = async () => {
  try {
    console.log('🔍 [ProductDetail] 开始加载商品详情:', productId.value);
    const productData = await getProductById(productId.value);
    product.value = productData;

    console.log('✅ [ProductDetail] 商品详情加载成功:');
    console.log('  - 商品ID:', productData.productId);
    console.log('  - 商品标题:', productData.title);
    console.log('  - 分类ID:', productData.categoryId);
    console.log('  - 分类名称:', productData.categoryName);
    console.log('  - 图片URLs:', productData.imageUrls);
    console.log('  - 图片URLs类型:', typeof productData.imageUrls);
    console.log('  - 图片数量:', productData.imageUrls?.length);

    if (productData.imageUrls && Array.isArray(productData.imageUrls)) {
      productData.imageUrls.forEach((url, index) => {
        console.log(`  - 图片${index + 1}:`, url);
      });
    }

    console.log('  - 完整商品数据:', productData);
  } catch (error: any) {
    console.error('❌ [ProductDetail] 加载商品详情失败:', error);

    // 处理认证错误
    if (error.message && error.message.includes('认证失败')) {
      uni.showModal({
        title: '需要登录',
        content: '请先登录后查看商品详情',
        confirmText: '去登录',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: '/pages/login'
            });
          } else {
            uni.navigateBack();
          }
        }
      });
    } else {
      uni.showToast({
        title: error.message || '加载商品详情失败',
        icon: 'none'
      });
    }
  }
};

// 加载评论列表
const loadReviews = async (page: number = 1) => {
  try {
    if (page === 1) {
      reviewsLoading.value = true;
    } else {
      reviewsLoadingMore.value = true;
    }

    const response = await getProductReviews(productId.value, {
      page,
      size: pageSize
    });

    if (page === 1) {
      reviews.value = response.items;
    } else {
      reviews.value.push(...response.items);
    }

    reviewsTotal.value = response.totalElements;
    reviewsHasMore.value = page < response.totalPages;
    currentPage.value = page;

    console.log('评论加载成功:', response);
  } catch (error: any) {
    console.error('加载评论失败:', error);

    // 处理认证错误
    if (error.message && error.message.includes('认证失败')) {
      // 评论加载失败时不强制跳转登录，只是静默处理
      console.log('评论需要登录才能查看');
    } else if (page === 1) {
      uni.showToast({
        title: error.message || '加载评论失败',
        icon: 'none'
      });
    }
  } finally {
    reviewsLoading.value = false;
    reviewsLoadingMore.value = false;
  }
};

// 返回按钮点击
const handleBackClick = () => {
  uni.navigateBack();
};

// 图片点击（预览）
const handleImageClick = (index: number) => {
  if (product.value) {
    uni.previewImage({
      urls: product.value.imageUrls,
      current: index
    });
  }
};

// 收藏按钮点击
const handleFavoriteClick = async () => {
  if (!currentUserId.value) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    return;
  }

  if (!product.value) return;

  try {
    if (!product.value.isFavorite) {
      await addFavorite({ productId: product.value.productId });
      product.value.isFavorite = true;
      uni.showToast({
        title: '收藏成功',
        icon: 'success'
      });
    } else {
      await removeFavorite(product.value.productId);
      product.value.isFavorite = false;
      uni.showToast({
        title: '取消收藏成功',
        icon: 'success'
      });
    }
  } catch (error: any) {
    console.error('收藏操作失败:', error);
    uni.showToast({
      title: error.message || '操作失败',
      icon: 'none'
    });
  }
};

// 分享按钮点击
const handleShareClick = () => {
  // 使用更兼容的分享方式
  const shareData = {
    title: product.value?.title || '商品分享',
    path: `pages/product?id=${productId.value}`,
    imageUrl: product.value?.imageUrls[0] || ''
  };

  // 检查是否支持分享API
  if (typeof uni.share === 'function') {
    uni.share({
      provider: 'weixin',
      scene: 'WXSceneSession',
      type: 0,
      href: shareData.path,
      title: shareData.title,
      summary: product.value?.description || '',
      imageUrl: shareData.imageUrl,
      success: () => {
        uni.showToast({
          title: '分享成功',
          icon: 'success'
        });
      },
      fail: (error) => {
        console.error('分享失败:', error);
        handleFallbackShare(shareData);
      }
    });
  } else {
    handleFallbackShare(shareData);
  }
};

// 备用分享方案
const handleFallbackShare = (shareData: any) => {
  // 复制链接到剪贴板
  uni.setClipboardData({
    data: `${shareData.title} - 查看详情：${shareData.path}`,
    success: () => {
      uni.showToast({
        title: '链接已复制到剪贴板',
        icon: 'success'
      });
    },
    fail: () => {
      uni.showToast({
        title: '分享功能暂不可用',
        icon: 'none'
      });
    }
  });
};

// 关注卖家
const handleFollowClick = async () => {
  if (!currentUserId.value) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    return;
  }

  if (!product.value) return;

  // 防止用户关注自己
  if (isOwner.value) {
    uni.showToast({
      title: '不能关注自己',
      icon: 'none'
    });
    return;
  }

  try {
    if (!product.value.isFollowingSeller) {
      await followUser(product.value.sellerInfo.userId);
      product.value.isFollowingSeller = true;
      uni.showToast({
        title: '关注成功',
        icon: 'success'
      });
    } else {
      await unfollowUser(product.value.sellerInfo.userId);
      product.value.isFollowingSeller = false;
      uni.showToast({
        title: '取消关注成功',
        icon: 'success'
      });
    }
  } catch (error: any) {
    console.error('关注操作失败:', error);
    uni.showToast({
      title: error.message || '操作失败',
      icon: 'none'
    });
  }
};

// 查看卖家更多商品
const handleViewSellerProducts = () => {
  if (product.value) {
    uni.navigateTo({
      url: `/pages/home?sellerId=${product.value.sellerInfo.userId}`
    });
  }
};

// 联系卖家
const handleContactSeller = () => {
  // TODO: 实现联系卖家功能
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  });
};

// 我想要（咸鱼风格）
const handleWantIt = () => {
  if (!currentUserId.value) {
    uni.showModal({
      title: '请先登录',
      content: '登录后才能购买商品',
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
    return;
  }

  if (!product.value) return;

  // 检查库存
  if (product.value.stock <= 0) {
    uni.showModal({
      title: '商品已售罄',
      content: '该商品暂时缺货，您可以关注其他类似商品。',
      showCancel: false,
      confirmText: '我知道了'
    });
    return;
  }

  // 显示购买弹窗
  showPurchaseModal.value = true;
};

// 关闭购买弹窗
const closePurchaseModal = () => {
  showPurchaseModal.value = false;
};

// 购买成功处理
const handlePurchaseSuccess = (orderId: string) => {
  uni.showToast({
    title: '购买成功',
    icon: 'success'
  });

  // 跳转到订单详情页面
  setTimeout(() => {
    uni.navigateTo({
      url: `/pages/order_detail?orderId=${orderId}`
    });
  }, 1500);
};

// 编辑商品
const handleEditProduct = () => {
  if (product.value) {
    uni.navigateTo({
      url: `/pages/publish?mode=edit&id=${product.value.productId}`
    });
  }
};

// 删除商品
const handleDeleteProduct = async () => {
  if (!product.value) return;

  try {
    await deleteProduct(product.value.productId);
    uni.showToast({
      title: '删除成功',
      icon: 'success'
    });

    // 延迟返回上一页
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    console.error('删除商品失败:', error);
    uni.showToast({
      title: '删除失败',
      icon: 'none'
    });
  }
};

// 添加评论
const handleAddReview = async (data: CreateReviewRequest) => {
  try {
    const newReview = await createProductReview(productId.value, data);
    reviews.value.unshift(newReview);
    reviewsTotal.value += 1;

    uni.showToast({
      title: '评论发布成功',
      icon: 'success'
    });
  } catch (error) {
    console.error('发布评论失败:', error);
    uni.showToast({
      title: '发布评论失败',
      icon: 'none'
    });
  }
};



// 加载更多评论
const handleLoadMoreReviews = () => {
  if (reviewsHasMore.value && !reviewsLoadingMore.value) {
    loadReviews(currentPage.value + 1);
  }
};
</script>

<style lang="scss" scoped>
.header-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 2px solid rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &:hover {
    background-color: rgba(255, 255, 255, 1);
    border-color: rgba(0, 0, 0, 0.5);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}
</style>