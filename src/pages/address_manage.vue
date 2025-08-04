<template>
  <PageLayout title="地址管理" @back-click="handleBackClick">
    <view class="address-manage">
      <!-- 地址列表 -->
      <view class="address-list" v-if="addresses.length > 0">
        <view 
          v-for="address in addresses" 
          :key="address.addressId"
          class="address-item"
        >
          <view class="address-info">
            <view class="address-header">
              <text class="receiver-name">{{ address.receiverName }}</text>
              <text class="phone-number">{{ address.phoneNumber }}</text>
              <view v-if="address.isDefault" class="default-tag">默认</view>
            </view>
            <text class="address-detail">{{ address.address }}</text>
          </view>
          <view class="address-actions">
            <button class="edit-btn" @click="editAddress(address)">编辑</button>
            <button class="delete-btn" @click="deleteAddress(address.addressId)">删除</button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-text">暂无收货地址</text>
        <text class="empty-hint">点击下方按钮添加新地址</text>
      </view>

      <!-- 添加地址按钮 -->
      <button class="add-address-btn" @click="showAddForm = true">
        + 添加新地址
      </button>
    </view>

    <!-- 添加/编辑地址表单 -->
    <view class="address-form-modal" v-if="showAddForm" @click="handleModalMask">
      <view class="form-content" @click.stop>
        <view class="form-header">
          <text class="form-title">{{ editingAddress ? '编辑地址' : '添加地址' }}</text>
          <button class="close-btn" @click="closeForm">×</button>
        </view>
        
        <view class="form-body">
          <view class="form-item">
            <text class="form-label">收货人</text>
            <input 
              class="form-input"
              v-model="formData.receiverName"
              placeholder="请输入收货人姓名"
              maxlength="20"
            />
          </view>

          <view class="form-item">
            <text class="form-label">手机号</text>
            <input 
              class="form-input"
              v-model="formData.phoneNumber"
              placeholder="请输入手机号"
              type="number"
              maxlength="11"
            />
          </view>

          <view class="form-item">
            <text class="form-label">详细地址</text>
            <textarea 
              class="form-textarea"
              v-model="formData.address"
              placeholder="请输入详细地址（省市区街道门牌号等）"
              maxlength="200"
            />
          </view>

          <view class="form-item">
            <label class="checkbox-item">
              <checkbox 
                :checked="formData.isDefault"
                @change="handleDefaultChange"
              />
              <text class="checkbox-label">设为默认地址</text>
            </label>
          </view>
        </view>

        <view class="form-footer">
          <button class="cancel-btn" @click="closeForm">取消</button>
          <button 
            class="save-btn" 
            :class="{ disabled: !canSave }"
            @click="saveAddress"
            :disabled="!canSave"
          >
            保存
          </button>
        </view>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageLayout from '@/components/layout/PageLayout.vue';
import { getMyAddresses, createAddress } from '@/api/addressApi';
import type { Address, CreateAddressRequest } from '@/api/types/addressTypes';

// 响应式数据
const addresses = ref<Address[]>([]);
const showAddForm = ref(false);
const editingAddress = ref<Address | null>(null);
const loading = ref(false);

// 表单数据
const formData = ref<CreateAddressRequest>({
  receiverName: '',
  phoneNumber: '',
  address: '',
  isDefault: false
});

// 计算属性
const canSave = computed(() => {
  return formData.value.receiverName.trim() && 
         formData.value.phoneNumber.trim() && 
         formData.value.address.trim() &&
         formData.value.phoneNumber.length === 11;
});

// 加载地址列表
const loadAddresses = async () => {
  try {
    loading.value = true;
    addresses.value = await getMyAddresses();
  } catch (error) {
    console.error('加载地址失败:', error);
    uni.showToast({
      title: '加载地址失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 保存地址
const saveAddress = async () => {
  if (!canSave.value) return;

  try {
    loading.value = true;
    
    if (editingAddress.value) {
      // TODO: 实现编辑地址功能
      uni.showToast({
        title: '编辑功能开发中',
        icon: 'none'
      });
    } else {
      // 创建新地址
      await createAddress(formData.value);
      uni.showToast({
        title: '地址添加成功',
        icon: 'success'
      });
      
      // 重新加载地址列表
      await loadAddresses();
      closeForm();
    }
  } catch (error) {
    console.error('保存地址失败:', error);
    uni.showToast({
      title: error instanceof Error ? error.message : '保存失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 编辑地址
const editAddress = (address: Address) => {
  editingAddress.value = address;
  formData.value = {
    receiverName: address.receiverName,
    phoneNumber: address.phoneNumber,
    address: address.address,
    isDefault: address.isDefault
  };
  showAddForm.value = true;
};

// 删除地址
const deleteAddress = (addressId: string) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个地址吗？',
    success: (res) => {
      if (res.confirm) {
        // TODO: 实现删除地址功能
        uni.showToast({
          title: '删除功能开发中',
          icon: 'none'
        });
      }
    }
  });
};

// 关闭表单
const closeForm = () => {
  showAddForm.value = false;
  editingAddress.value = null;
  formData.value = {
    receiverName: '',
    phoneNumber: '',
    address: '',
    isDefault: false
  };
};

// 处理默认地址选择
const handleDefaultChange = (e: any) => {
  formData.value.isDefault = e.detail.value.length > 0;
};

// 处理模态框遮罩点击
const handleModalMask = () => {
  closeForm();
};

// 返回按钮处理
const handleBackClick = () => {
  uni.navigateBack();
};

// 页面加载
onMounted(() => {
  loadAddresses();
});
</script>

<style lang="scss" scoped>
.address-manage {
  padding: 16px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.address-list {
  margin-bottom: 20px;
}

.address-item {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.address-info {
  margin-bottom: 12px;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.receiver-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-right: 12px;
}

.phone-number {
  font-size: 14px;
  color: #666;
  margin-right: 12px;
}

.default-tag {
  background-color: #ff4757;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.address-detail {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.address-actions {
  display: flex;
  gap: 12px;
}

.edit-btn,
.delete-btn {
  flex: 1;
  height: 36px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.edit-btn {
  background-color: #007aff;
  color: white;
}

.delete-btn {
  background-color: #ff4757;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-text {
  display: block;
  font-size: 16px;
  color: #999;
  margin-bottom: 8px;
}

.empty-hint {
  display: block;
  font-size: 14px;
  color: #ccc;
}

.add-address-btn {
  width: 100%;
  height: 48px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 20px;
}

// 表单模态框样式
.address-form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.form-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 24px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  background-color: white;
}

.form-textarea {
  height: 80px;
  resize: none;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-label {
  font-size: 14px;
  color: #333;
}

.form-footer {
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
}

.cancel-btn,
.save-btn {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #666;
}

.save-btn {
  background-color: #007aff;
  color: white;

  &.disabled {
    background-color: #ccc;
    color: #999;
  }
}
</style>
