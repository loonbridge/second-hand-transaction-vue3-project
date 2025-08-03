// 使用 uni-app 提供的条件编译方式
const ENV = import.meta.env.MODE;


interface Config{
    baseURL?: string;
    timeout?:number;
    debug?: boolean; // 添加调试模式配置
    //其他配置
}


const config: Record<string,Config> = {
    development: {
        baseURL: 'http://localhost:8080',
        // baseURL: 'https://10ck4qg722204.vicp.fun',
        timeout: 30000,
        debug: true // 开发环境开启调试
    },

    production: {
        baseURL: 'https://api.example.com',
        timeout: 5000,
        debug: false
    }
}

// 获取当前环境配置
const currentConfig = config[ENV] || config.development;

// 注册请求拦截器 - 仅在开发环境并且debug=true时启用
if (currentConfig.debug) {
  console.log('🔍 API调试模式已启用');
  
  // 添加请求日志
  uni.addInterceptor('request', {
    invoke(options) {
      console.group(`🌐 HTTP请求: ${options.method} ${options.url}`);
      console.log('请求头:', options.header);
      console.log('数据:', options.data);
      return options;
    },
    success(res) {
      console.log(`✅ 响应:`, res);
      console.log('状态码:', res.statusCode);
      
      // 记录500错误的详细信息
      if (res.statusCode === 500) {
        console.error('⚠️ 服务器内部错误 (500)');
        console.error('响应数据:', res.data);
        
        // 尝试解析错误信息
        try {
          if (typeof res.data === 'string') {
            if (res.data.includes('Java') || res.data.includes('Exception')) {
              console.error('Java异常:', res.data);
            }
          } else if (typeof res.data === 'object' && res.data !== null) {
            console.error('错误详情:', JSON.stringify(res.data, null, 2));
          }
        } catch (e) {
          console.error('解析错误详情失败:', e);
        }
      }
      
      console.groupEnd();
      return res;
    },
    fail(err) {
      console.log(`❌ 请求失败:`, err);
      console.groupEnd();
      return err;
    }
  });
  
  // 添加上传文件日志
  uni.addInterceptor('uploadFile', {
    invoke(options) {
      console.group(`📤 文件上传: ${options.url}`);
      console.log('文件路径:', options.filePath);
      console.log('表单名称:', options.name);
      return options;
    },
    success(res) {
      console.log(`✅ 上传响应:`, res);
      console.groupEnd();
      return res;
    },
    fail(err) {
      console.log(`❌ 上传失败:`, err);
      console.groupEnd();
      return err;
    }
  });
}

export default currentConfig;
