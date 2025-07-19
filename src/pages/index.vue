<template>
    <div>
        支付
    </div>
</template>

<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';

onLaunch(() => {
    uni.login({
        provider: 'weixin',
        success: (res) => {
            console.log('登录成功', res.code);
        }
    })
   })


</script>

<style lang="scss" scoped>

</style>