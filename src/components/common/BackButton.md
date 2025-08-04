# BackButton 通用返回按钮组件

## 概述

`BackButton` 是一个通用的返回按钮组件，提供了统一的返回按钮样式和交互行为。该组件支持多种样式变体，可以在不同的页面和场景中使用。

## 特性

- 🎨 **多种样式变体**：支持 default、circle、minimal 三种样式
- 🎯 **统一交互**：标准化的点击反馈和动画效果
- 🔧 **高度可定制**：支持自定义图标大小和颜色
- ♿ **无障碍支持**：支持禁用状态和键盘导航
- 📱 **响应式设计**：适配不同屏幕尺寸

## 使用方法

### 基础用法

```vue
<template>
  <BackButton @click="handleBackClick" />
</template>

<script setup lang="ts">
import BackButton from '@/components/common/BackButton.vue';

const handleBackClick = () => {
  uni.navigateBack();
};
</script>
```

### 样式变体

#### 1. Default 样式（默认）
适用于大多数页面的标准返回按钮：

```vue
<BackButton variant="default" @click="handleBackClick" />
```

#### 2. Circle 样式
适用于商品详情页等需要突出显示的场景：

```vue
<BackButton variant="circle" @click="handleBackClick" />
```

#### 3. Minimal 样式
适用于需要简洁样式的场景：

```vue
<BackButton variant="minimal" @click="handleBackClick" />
```

### 自定义配置

```vue
<BackButton 
  variant="default"
  :icon-size="28"
  custom-icon-color="#0b80ee"
  :disabled="isLoading"
  @click="handleBackClick" 
/>
```

## Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| variant | `'default' \| 'circle' \| 'minimal'` | `'default'` | 按钮样式变体 |
| disabled | `boolean` | `false` | 是否禁用按钮 |
| iconSize | `number` | `24` | 图标大小（像素） |
| customIconColor | `string` | `''` | 自定义图标颜色 |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 按钮点击事件 | - |

## 样式变体详解

### Default 样式
- 40x40px 的方形按钮
- 8px 圆角
- 透明背景，悬停时显示浅色背景
- 适用于大多数页面的头部导航

### Circle 样式
- 40x40px 的圆形按钮
- 白色半透明背景
- 带阴影和边框
- 悬停时有缩放效果
- 适用于商品详情页等需要突出显示的场景

### Minimal 样式
- 32x32px 的小尺寸按钮
- 无背景，悬停时显示浅色背景
- 适用于需要简洁样式的场景

## 在 Layout 组件中的应用

### OrderPageLayout
```vue
<BackButton variant="default" @click="handleBackClick" />
```

### ProductDetailLayout
```vue
<BackButton variant="circle" @click="handleBackClick" />
```

### PageLayout
```vue
<BackButton variant="default" @click="handleBackClick" />
```

## 最佳实践

1. **选择合适的样式变体**：
   - 普通页面使用 `default`
   - 商品详情页使用 `circle`
   - 简洁场景使用 `minimal`

2. **处理返回逻辑**：
   ```vue
   const handleBackClick = () => {
     // 检查是否有未保存的更改
     if (hasUnsavedChanges()) {
       uni.showModal({
         title: '提示',
         content: '您有未保存的内容，确定要离开吗？',
         success: (res) => {
           if (res.confirm) {
             uni.navigateBack();
           }
         }
       });
     } else {
       uni.navigateBack();
     }
   };
   ```

3. **禁用状态**：
   在加载或处理过程中禁用按钮：
   ```vue
   <BackButton :disabled="isLoading" @click="handleBackClick" />
   ```

## 注意事项

- 组件使用 `uni-icons` 的 `back` 图标
- 所有样式都支持响应式设计
- 在小屏幕设备上会自动调整尺寸
- 组件已经包含了适当的点击反馈动画
