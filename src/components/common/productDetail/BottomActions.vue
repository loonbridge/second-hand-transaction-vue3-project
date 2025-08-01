<template>
  <view class="bottom-actions">
    <!-- 普通用户操作 -->
    <view v-if="!isOwner" class="user-actions">
      <button class="action-btn contact-btn" @click="handleContactSeller">
        <uni-icons type="chat" color="#6b7280" size="20"></uni-icons>
        <text class="btn-text">联系卖家</text>
      </button>

      <button class="action-btn primary-btn" @click="handleWantIt">
        <text class="btn-text primary-text">我想要</text>
      </button>
    </view>

    <!-- 商品所有者操作 -->
    <view v-else class="owner-actions">
      <button class="action-btn edit-btn" @click="handleEditProduct">
        <uni-icons type="compose" color="#0b80ee" size="18"></uni-icons>
        <text class="btn-text edit-text">编辑商品</text>
      </button>
      
      <button class="action-btn delete-btn" @click="handleDeleteProduct">
        <uni-icons type="trash" color="#ef4444" size="18"></uni-icons>
        <text class="btn-text delete-text">删除商品</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
// Props
const props = defineProps<{
  isOwner: boolean; // 是否为商品所有者
  productId: string;
  stock: number;
}>();

// 事件定义
const emit = defineEmits<{
  contactSeller: [];
  wantIt: [];
  editProduct: [];
  deleteProduct: [];
}>();

// 联系卖家
const handleContactSeller = () => {
  emit('contactSeller');
};

// 我想要
const handleWantIt = () => {
  if (props.stock <= 0) {
    uni.showToast({
      title: '商品已售罄',
      icon: 'none'
    });
    return;
  }
  emit('wantIt');
};

// 编辑商品
const handleEditProduct = () => {
  emit('editProduct');
};

// 删除商品
const handleDeleteProduct = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个商品吗？删除后无法恢复。',
    confirmText: '删除',
    confirmColor: '#ef4444',
    success: (res) => {
      if (res.confirm) {
        emit('deleteProduct');
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
  --danger-color: #ef4444;
  --success-color: #10b981;
}

.bottom-actions {
  display: flex;
  gap: 12px;
  width: 100%;
}

.user-actions,
.owner-actions {
  display: flex;
  gap: 12px;
  width: 100%;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 48px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;

  &:active {
    transform: scale(0.98);
  }
}

// 用户操作按钮样式
.contact-btn {
  flex: 1;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);

  &:hover {
    background-color: var(--border-color);
  }
}

.primary-btn {
  flex: 2;
  background-color: var(--primary-color);

  &:hover {
    background-color: #0969da;
  }

  &:disabled {
    background-color: var(--border-color);
    cursor: not-allowed;
  }
}

// 所有者操作按钮样式
.edit-btn {
  flex: 1;
  background-color: rgba(11, 128, 238, 0.1);
  border: 1px solid var(--primary-color);

  &:hover {
    background-color: rgba(11, 128, 238, 0.2);
  }
}

.delete-btn {
  flex: 1;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger-color);

  &:hover {
    background-color: rgba(239, 68, 68, 0.2);
  }
}

// 文本样式
.btn-text {
  font-size: 16px;
  color: var(--text-secondary);
}

.primary-text {
  color: #ffffff;
  font-weight: 600;
}

.edit-text {
  color: var(--primary-color);
  font-weight: 500;
}

.delete-text {
  color: var(--danger-color);
  font-weight: 500;
}

// 响应式设计
@media (max-width: 375px) {
  .action-btn {
    height: 44px;
  }

  .btn-text {
    font-size: 14px;
  }
}

// 库存不足时的样式
.stock-out {
  .primary-btn {
    background-color: var(--border-color);
    cursor: not-allowed;
    
    .primary-text {
      color: var(--text-secondary);
    }
  }
}
</style>
