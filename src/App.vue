<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { initPrivacyListener, cleanupPrivacyListener } from '@/utils/privacy';

onLaunch(() => {
  console.log("App Launch");

  // 初始化隐私授权监听（仅在微信小程序环境）
  // #ifdef MP-WEIXIN
  initPrivacyListener();
  // #endif
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");

  // 清理隐私授权监听（仅在微信小程序环境）
  // #ifdef MP-WEIXIN
  cleanupPrivacyListener();
  // #endif
});
</script>
<style></style>
