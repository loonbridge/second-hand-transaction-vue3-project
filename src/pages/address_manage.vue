<template>
  <PageLayout title="地址管理" @back-click="handleBackClick">
    <view class="address-manage">
      <!-- 加载状态 -->
      <view v-if="loading && addresses.length === 0" class="loading-container">
        <uni-icons type="spinner-cycle" size="32" color="#ff6b35"></uni-icons>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 地址列表 -->
      <view class="address-list" v-else-if="addresses && addresses.length > 0">
        <view
          v-for="address in addresses"
          :key="address.addressId"
          class="address-item"
          :class="{ 'default-address': address.isDefault }"
        >
          <view class="address-main">
            <view class="address-icon">
              <uni-icons type="location-filled" size="20" :color="address.isDefault ? '#ff6b35' : '#9ca3af'"></uni-icons>
            </view>
            <view class="address-info">
              <view class="address-header">
                <text class="receiver-name">{{ address.receiverName }}</text>
                <text class="phone-number">{{ address.phoneNumber }}</text>
                <view v-if="address.isDefault" class="default-tag">
                  <uni-icons type="checkmarkempty" size="12" color="white"></uni-icons>
                  <text class="default-text">默认</text>
                </view>
              </view>
              <text class="address-detail">{{ address.address }}</text>
            </view>
          </view>
          <view class="address-actions">
            <button class="action-btn edit-btn" @click="editAddress(address)">
              <uni-icons type="compose" size="14" color="#3b82f6"></uni-icons>
              <text class="action-text">编辑</text>
            </button>
            <button class="action-btn delete-btn" @click="deleteAddress(address.addressId)">
              <uni-icons type="trash" size="14" color="#ef4444"></uni-icons>
              <text class="action-text">删除</text>
            </button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <view class="empty-icon">
          <uni-icons type="location" size="64" color="#d1d5db"></uni-icons>
        </view>
        <text class="empty-text">暂无收货地址</text>
        <text class="empty-hint">添加收货地址，让购物更便捷</text>
        <button class="empty-add-btn" @click="showAddForm = true">
          <uni-icons type="plus" size="16" color="white"></uni-icons>
          <text class="btn-text">添加地址</text>
        </button>
      </view>

      <!-- 添加地址按钮 -->
      <button class="add-address-btn" v-if="addresses && addresses.length > 0" @click="showAddForm = true">
        <uni-icons type="plus" size="16" color="white"></uni-icons>
        <text class="btn-text">添加新地址</text>
      </button>
    </view>

    <!-- 添加/编辑地址表单 -->
    <view class="address-form-modal" v-if="showAddForm" @click="handleModalMask">
      <view class="form-content" @click.stop>
        <view class="form-header">
          <text class="form-title">{{ editingAddress ? '编辑地址' : '添加地址' }}</text>
          <button class="close-btn" @click="closeForm">
            <uni-icons type="closeempty" size="20" color="#9ca3af"></uni-icons>
          </button>
        </view>
        
        <view class="form-body">
          <view class="form-item">
            <view class="form-label-row">
              <uni-icons type="person" size="16" color="#6b7280"></uni-icons>
              <text class="form-label">收货人</text>
            </view>
            <input
              class="form-input"
              v-model="formData.receiverName"
              placeholder="请输入收货人姓名"
              maxlength="20"
            />
          </view>

          <view class="form-item">
            <view class="form-label-row">
              <uni-icons type="phone" size="16" color="#6b7280"></uni-icons>
              <text class="form-label">手机号</text>
            </view>
            <input
              class="form-input"
              v-model="formData.phoneNumber"
              placeholder="请输入11位手机号"
              type="number"
              maxlength="11"
            />
            <text v-if="phoneError" class="error-text">{{ phoneError }}</text>
          </view>

          <view class="form-item">
            <view class="form-label-row">
              <uni-icons type="location" size="16" color="#6b7280"></uni-icons>
              <text class="form-label">详细地址</text>
            </view>
            <textarea
              class="form-textarea"
              v-model="formData.address"
              placeholder="请输入详细地址，如：广东省深圳市南山区科技园南区..."
              maxlength="200"
            />
            <view class="char-count">{{ formData.address.length }}/200</view>
          </view>

          <view class="form-item checkbox-item">
            <label class="checkbox-wrapper" @click="toggleDefault">
              <view class="checkbox-container">
                <checkbox
                  :checked="formData.isDefault"
                  @change="handleDefaultChange"
                  color="#ff6b35"
                />
                <text class="checkbox-label">设为默认地址</text>
              </view>
              <text class="checkbox-hint">默认地址将优先用于下单</text>
            </label>
          </view>
        </view>

        <view class="form-footer">
          <button class="cancel-btn" @click="closeForm">取消</button>
          <button
            class="save-btn"
            :class="{ disabled: !canSave || loading }"
            @click="saveAddress"
            :disabled="!canSave || loading"
          >
            <uni-icons v-if="loading" type="spinner-cycle" size="16" color="white"></uni-icons>
            <text>{{ loading ? '保存中...' : '保存' }}</text>
          </button>
        </view>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageLayout from '@/components/layout/PageLayout.vue';
import { getMyAddresses, createAddress, updateAddress as updateAddressAPI, deleteAddress as deleteAddressAPI } from '@/api/addressApi';
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
         formData.value.phoneNumber.length === 11 &&
         !phoneError.value;
});

// 表单验证
const phoneError = computed(() => {
  if (!formData.value.phoneNumber) return '';
  if (formData.value.phoneNumber.length < 11) return '手机号长度不足';
  if (!/^1[3-9]\d{9}$/.test(formData.value.phoneNumber)) return '手机号格式不正确';
  return '';
});

// 加载地址列表
const loadAddresses = async () => {
  try {
    loading.value = true;
    const result = await getMyAddresses();
    // 确保 addresses 始终是数组
    addresses.value = Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('加载地址失败:', error);
    // 出错时也要确保 addresses 是数组
    addresses.value = [];
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
      // 编辑地址
      await updateAddressAPI(editingAddress.value.addressId, formData.value);
      uni.showToast({
        title: '地址更新成功',
        icon: 'success'
      });
    } else {
      // 创建新地址
      await createAddress(formData.value);
      uni.showToast({
        title: '地址添加成功',
        icon: 'success'
      });
    }

    // 重新加载地址列表
    await loadAddresses();
    closeForm();
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
    content: '确定要删除这个地址吗？删除后无法恢复。',
    confirmText: '删除',
    confirmColor: '#ef4444',
    success: async (res) => {
      if (res.confirm) {
        try {
          loading.value = true;
          await deleteAddressAPI(addressId);

          uni.showToast({
            title: '地址删除成功',
            icon: 'success'
          });

          // 重新加载地址列表
          await loadAddresses();
        } catch (error) {
          console.error('删除地址失败:', error);
          uni.showToast({
            title: error instanceof Error ? error.message : '删除失败',
            icon: 'none'
          });
        } finally {
          loading.value = false;
        }
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

// 切换默认地址
const toggleDefault = () => {
  formData.value.isDefault = !formData.value.isDefault;
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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  margin: 20px 0;
}

.loading-text {
  font-size: 14px;
  color: #9ca3af;
  margin-top: 12px;
}

.address-list {
  margin-bottom: 20px;
}

.address-item {
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;
}

.address-item:active {
  transform: scale(0.98);
}

.address-item.default-address {
  border-color: #ff6b35;
  box-shadow: 0 2px 12px rgba(255, 107, 53, 0.15);
}

.address-main {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.address-icon {
  margin-right: 12px;
  margin-top: 2px;
}

.address-info {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
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
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background-color: #f8fafc;
  transition: all 0.2s ease;
}

.action-btn:active {
  transform: scale(0.95);
}

.edit-btn {
  border: 1px solid #e2e8f0;
}

.edit-btn:hover {
  background-color: #f1f5f9;
}

.delete-btn {
  border: 1px solid #fee2e2;
}

.delete-btn:hover {
  background-color: #fef2f2;
}

.action-text {
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  margin: 20px 0;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-text {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-hint {
  display: block;
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 24px;
}

.empty-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, #ff6b35, #f59e0b);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  transition: all 0.3s ease;
}

.empty-add-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.add-address-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #ff6b35, #f59e0b);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  transition: all 0.3s ease;
}

.add-address-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.btn-text {
  font-size: 16px;
  font-weight: 600;
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
  margin-bottom: 24px;
}

.form-label-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  background-color: #f9fafb;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #ff6b35;
  background-color: white;
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.form-textarea {
  height: 100px;
  resize: none;
  line-height: 1.5;
}

.error-text {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
  display: block;
}

.char-count {
  font-size: 12px;
  color: #9ca3af;
  text-align: right;
  margin-top: 4px;
}

.checkbox-item {
  margin-bottom: 0 !important;
}

.checkbox-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.checkbox-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-left: 24px;
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
  background: linear-gradient(135deg, #ff6b35, #f59e0b);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;

  &.disabled {
    background: #d1d5db;
    color: #9ca3af;
    cursor: not-allowed;
  }

  &:not(.disabled):active {
    transform: translateY(1px);
  }
}
</style>
