/**
 * 地址相关类型定义
 */

export interface Address {
  addressId: string;
  receiverName: string;
  phoneNumber: string;
  address: string;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  receiverName: string;
  phoneNumber: string;
  address: string;
  isDefault: boolean;
}

export interface UpdateAddressRequest {
  receiverName: string;
  phoneNumber: string;
  address: string;
  isDefault: boolean;
}
