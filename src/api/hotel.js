// src/api/hotel.js
import request from '../utils/request';

/**
 * 获取当前商户的酒店列表
 */
export const fetchMyHotels = () => {
  return request.get('/api/hotels/my-hotels');
};

/**
 * 添加新酒店
 * @param {Object} data 酒店表单数据
 */
export const createHotel = (data) => {
  return request.post('/api/hotels', data);
};

/**
 * 更新酒店信息
 * @param {String} id 酒店ID
 * @param {Object} data 酒店表单数据
 */
export const updateHotel = (id, data) => {
  return request.put(`/api/hotels/${id}`, data);
};

/**
 * 删除酒店
 * @param {String} id 酒店ID
 */
export const deleteHotel = (id) => {
  return request.delete(`/api/hotels/${id}`);
};