<template>
  <view class="product-image-carousel">
    <swiper 
      class="image-swiper" 
      :indicator-dots="true" 
      :autoplay="false" 
      :interval="3000" 
      :duration="500"
      :current="currentIndex"
      @change="handleSwiperChange"
    >
      <swiper-item v-for="(imageUrl, index) in imageUrls" :key="index">
        <view class="image-container">
          <image 
            :src="imageUrl" 
            mode="aspectFill" 
            class="product-image"
            @click="handleImageClick(index)"
            @error="handleImageError(index)"
            @load="handleImageLoad(index)"
          />
          <!-- 加载状态 -->
          <view v-if="loadingStates[index]" class="image-loading">
            <uni-load-more status="loading" :content-text="{ contentdown: '加载中...', contentrefresh: '加载中...', contentnomore: '加载失败' }"></uni-load-more>
          </view>
        </view>
      </swiper-item>
    </swiper>
    
    <!-- 图片指示器 -->
    <view class="image-indicator">
      <text class="indicator-text">{{ currentIndex + 1 }} / {{ imageUrls.length }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Props
const props = defineProps<{
  imageUrls: string[];
}>();

// 响应式数据
const currentIndex = ref(0);
const loadingStates = ref<boolean[]>([]);

// 事件定义
const emit = defineEmits<{
  imageClick: [index: number, imageUrl: string];
}>();

// 初始化加载状态
onMounted(() => {
  loadingStates.value = new Array(props.imageUrls.length).fill(true);
});

// 轮播图切换事件
const handleSwiperChange = (event: any) => {
  currentIndex.value = event.detail.current;
};

// 图片点击事件
const handleImageClick = (index: number) => {
  emit('imageClick', index, props.imageUrls[index]);
};

// 图片加载完成
const handleImageLoad = (index: number) => {
  loadingStates.value[index] = false;
};

// 图片加载失败
const handleImageError = (index: number) => {
  loadingStates.value[index] = false;
  console.error(`图片加载失败: ${props.imageUrls[index]}`);
};
</script>

<style lang="scss" scoped>
:root {
  --background-color: #ffffff;
  --surface-color: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
}

.product-image-carousel {
  position: relative;
  width: 100%;
  height: 375px; // 正方形比例
  background-color: var(--surface-color);
}

.image-swiper {
  width: 100%;
  height: 100%;
}

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.image-indicator {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  padding: 4px 8px;
  z-index: 20;
}

.indicator-text {
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
}

// 自定义轮播指示点样式
:deep(.uni-swiper-dot) {
  background-color: rgba(255, 255, 255, 0.4) !important;
  border: none !important;
}

:deep(.uni-swiper-dot-active) {
  background-color: #ffffff !important;
}

// 响应式设计
@media (max-width: 375px) {
  .product-image-carousel {
    height: 320px;
  }
  
  .image-indicator {
    bottom: 12px;
    right: 12px;
  }
}
</style>
