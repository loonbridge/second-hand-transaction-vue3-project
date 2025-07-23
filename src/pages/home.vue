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
        @confirm=""
        
      >
      </uni-easyinput>
    </template>

    <!-- Default Slot: Page Content -->
    <template #category>
      <CategoryGrid :categories="categories" />
    </template>
    

    <template #product>
    <ProductGrid :products="recommendProducts" />

    </template>

  </HomePageLayout>
</template>

<script setup lang="ts">
import type { Category, ProductSummary } from '@/api/types/productTypes';
import CategoryGrid from '@/components/common/homePage/CategoryGrid.vue';
import ProductGrid from '@/components/common/homePage/ProductGrid.vue';
import HomePageLayout from '@/components/layout/HomePageLayout.vue';
import { ref } from 'vue';

const searchValue = ref('');

const handleBellIconClick = () => {
  console.log('Notification bell clicked');
  // TODO: 实现通知铃铛点击逻辑，比如跳转到通知页面
};

// Using more descriptive icons from uni-icons library
const categories = ref<Category[]>([
  { name: '时尚服饰', iconUrl: 'cart-filled', categoryId: "1" },
  { name: '数码产品', iconUrl: 'pyq', categoryId: "2" }, // 'pyq' is a decent monitor proxy
  { name: '家居用品', iconUrl: 'home', categoryId: "3" },
  { name: '图书文具', iconUrl: 'compose', categoryId: "4" }
]);

const recommendProducts = ref<ProductSummary[]>([
    { productId: "1", title: '全新时尚连衣裙',/* description: '尺码 M, 仅试穿',*/ price: 85, mainImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQpv3HLD3MUyfrvl5yL_XddV734YRTYQ_Ag_poVNVfkN4fyWuLMQXlLovScxHHPLW7fdGnzNGHbBDXYLghGTRglbI4mPw8fWkW71K6Cj1_uxI3OWIwaxWv4Nj37P2tctB9Lv0HqRKO7GQp1nMtxLqcd6JoPeGmmtVJGqbEoJN5TQaguw0e7Fq-aQ2B78e_tVVyIosWM1zGEi36hyzio_DsDVsMTC1CqrpDCGmJXlb8y65A6f8mqFXMqSBVIqg3sfI8cEW_7qK3wAo' },
    { productId: "2", title: '九成新品牌相机', /*description: '配件齐全, 使用很少', */price: 1200, mainImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwfBqdLcD8V6u4zpa7fbMtDRUhOtOdLgrSs1eOFSwqM1r6Ka0VTO4jBTVkKKsmxrtBkxoHaTTakYmXLADXh9IR3HpNXT8PpQZBHrlz9t5WYdn_pfi2D6p1dpNdiaYfzu-jlnwD78p-N66z9Hh-vz_5h6JLREvb4ssxwGpEZ2tRzUpQo_BQbV0rw6MesVJv7aARDywrigXFBJ0zR-f7q3WaeRXVN3aMDPvc-NEoMT4s5MQK7WwDeFEaiR3XCTbBZRUcIIe_1z3SM5c' },
    { productId: "3", title: '北欧风简约台灯',/* description: '设计感十足, 几乎全新',*/ price: 150, mainImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKRAY1YY0qSVte17TzHiKziFkevogNbIlEZvJSEwe56YDhhfCcHsfz13AFovYcoQT9_t9lm4WVuHDv4rI5VUxom97Naya3EyjEgp5eTtTX0mIrryKd-HLCDLgtdWMqmdAizt8UCxmr_zqHDwqSDeCOcfZYKDsr52Op-zYT24y0VVx4Mjl4THi6QWbbXvKOsQm820AxxRTiCOSuji7Q3Vwm3C6R6HCn31TKnpcR3Oz_EfcfqczZJBBHXYzBPgE8Dki8Me7VI5TTYlA' },
    { productId: "4", title: '经典文学名著套装', /*description: '无笔记, 保存完好',*/ price: 30, mainImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhzWLO6PPOFX2tVmmCL1tbpKWk9lZZDWV-Ur_NmaCjexy_dlryap2Gl4Ph2y_Lg9FDojKgiproO7ArrmPm9HtIRBDjyn76dC4X_Y1bxiseFrmFNAQk5JaBGx_dvXqFF1n1KtxeGvqwFB0cGJ0qczYgYAviet87l9uPLhAjtnqCzQjQgT01_H-MBLNtn2E3roB0SFTQqW8KRD8OAmnVCHOMYEmgoOeSdQ_xE-pi45sJ9oMbP6aIcJt2ijouPQQubreWi2TH9DAzhtU' },
    { productId: "5", title: '灯泡', /*description: '无笔记, 保存完好',*/ price: 30, mainImageUrl: 'https://www.shutterstock.com/shutterstock/photos/2641193077/display_1500/stock-photo-neon-outline-light-bulb-icon-on-black-background-idea-symbol-electric-lamp-light-innovation-2641193077.jpg' }
]);
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
</style>