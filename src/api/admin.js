// src/api/admin.js
import request from '../utils/request';

/**
 * 获取待审核商户列表
 * @returns Promise
 */
export const fetchPendingMerchants = () => {
  return request.get('/api/admin/merchants/pending');
};

/**
 * 提交商户审核结果
 * @param {Object} data - 包含 merchantId, status, remark
 * @returns Promise
 */
export const submitMerchantAudit = (data) => {
  return request.post('/api/admin/merchants/audit', data);
};
/**
 * 获取待审核酒店列表
 */
export const fetchPendingHotels = () => {
  return request.get('/api/admin/hotels/pending');
};

// src/api/admin.js

/**
 * 提交酒店审核结果
 * @param {Object} data - 包含 hotelId, status(1:通过, 2:驳回), remark
 */
export const submitHotelAudit = (data) => {
  const { hotelId, status, remark } = data;
  
  // 🌟 核心适配：将前端的 status 翻译成后端的 action
  const action = status === 1 ? 'approve' : 'reject';

  return request.patch(`/api/admin/hotels/${hotelId}/audit`, {
    action, // 对应后端的 const { action } = req.body
    remark  // 对应后端的 const { remark } = req.body
  });
};

// src/api/admin.js

/**
 * 获取待审核的房型列表
 */
export const fetchPendingRooms = () => {
  return request.get('/api/admin/rooms/pending');
};

/**
 * 提交房型审核结果
 * @param {Object} data - 包含 roomId, status(1:通过, 3:驳回), remark
 */
export const submitRoomAudit = (data) => {
  const { roomId, status, remark } = data;
  const action = status === 1 ? 'approve' : 'reject';
  
  return request.patch(`/api/admin/rooms/${roomId}/audit`, {
    action,
    remark
  });
};

/**
 * 获取所有酒店大盘数据
 */
export const fetchAllHotels = (params) => {
  return request.get('/api/admin/hotels/all', { params });
};

/**
 * 获取所有房型大盘数据
 */
export const fetchAllRooms = (params) => {
  return request.get('/api/admin/rooms/all', { params });
};