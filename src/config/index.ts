// 使用 uni-app 提供的条件编译方式
const ENV = import.meta.env.MODE;


interface Config{
    baseURL?: string;
    timeout?:number;

    //其他配置
}


const config: Record<string,Config> = {
    development: {
        baseURL: 'http://localhost:3000',
        timeout: 5000,
    },


    production: {
        baseURL: 'https://api.example.com',
        timeout: 5000,
    }

}



export default config[ENV] || config.development;
