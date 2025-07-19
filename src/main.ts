import { createSSRApp } from "vue";
import App from "./App.vue";

// 在开发环境下导入Mock服务
if (import.meta.env.MODE === 'development') {
  import('./api/mock');
}

export function createApp() {
  const app = createSSRApp(App);
  
  return {
    app,
  };
}
