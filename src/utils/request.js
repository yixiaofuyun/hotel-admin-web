// src/utils/request.js
import axios from 'axios';
import { message } from 'antd';

// 创建一个 axios 实例
const request = axios.create({
  // 🌟 这里填你 Node.js 后端的真实地址
  baseURL: 'http://47.236.128.86:3000', 
  timeout: 5000, // 请求超时时间：5秒
});

// 请求拦截器：发请求之前，自动带上 Token
request.interceptors.request.use(
  (config) => {
    // 从本地存储里拿出 token
    const token = localStorage.getItem('token');
    // 如果有 token，就放到请求头的 Authorization 里面（完美对接你后端的 verifyToken 保安！）
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理后端报错
request.interceptors.response.use(
  (response) => {
    // 这里的 response.data 就是你后端 res.json() 返回的那个对象 { code: 0, message: '...', data: ... }
    return response.data;
  },
  (error) => {
    // 处理 HTTP 状态码错误（比如你后端返回的 401, 403, 404, 500）
    const errorMsg = error.response?.data?.message || '网络请求失败，请检查后端是否启动';
    message.error(errorMsg);
    return Promise.reject(error);
  }
);

export default request;