// src/api/auth.js
import request from '../utils/request';

/**
 * 商户注册
 * @param {Object} data - 包含 username, password
 * @returns Promise
 */
export const registerMerchant = (data) => {
  return request.post('/api/auth/register/merchant', data);
};

/**
 * 用户通用登录
 * @param {Object} data - 包含 username, password
 * @returns Promise
 */
export const loginUser = (data) => {
  return request.post('/api/auth/login', data);
};