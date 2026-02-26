// src/api/room.js
import request from '../utils/request';

/**
 * 1. 获取某个酒店的所有房型列表 (商户专属)
 * 对应后端: GET /api/rooms/hotel/:hotelId
 */
export const fetchRoomsByHotel = (hotelId) => {
  return request.get(`/api/rooms/hotel/${hotelId}`);
};

/**
 * 2. 商户给酒店添加新房型
 * 对应后端: POST /api/rooms
 */
export const createRoom = (data) => {
  return request.post('/api/rooms', data);
};

/**
 * 3. 修改房型
 * 对应后端: PUT /api/rooms/:roomId
 */
export const updateRoom = (roomId, data) => {
  return request.put(`/api/rooms/${roomId}`, data);
};

/**
 * 4. 删除房型
 * 对应后端: DELETE /api/rooms/:roomId
 */
export const deleteRoom = (roomId) => {
  return request.delete(`/api/rooms/${roomId}`);
};

/**
 * 5. 获取单个房型的详细信息 (用于数据回显)
 * 对应后端: GET /api/rooms/:roomId
 */
export const fetchRoomDetail = (roomId) => {
  return request.get(`/api/rooms/${roomId}`);
};

/**
 * 6. 切换房型状态 (上架/下架)
 * 对应后端: PATCH /api/rooms/:roomId/status
 * @param {string} roomId 
 * @param {string} action - 'hide' 或 'recover'
 */
export const toggleRoomStatus = (roomId, action) => {
  return request.patch(`/api/rooms/${roomId}/status`, { action });
};

/**
 * 7. 获取酒店下可售卖的已上架房型 (这是未来给 C 端小程序/H5 用的！)
 * 对应后端: GET /api/rooms/hotel/:hotelId/published
 */
export const fetchPublishedRooms = (hotelId) => {
  return request.get(`/api/rooms/hotel/${hotelId}/published`);
};

/**
 * 8. 获取某个房型的未来日历库存
 * 对应后端: GET /api/rooms/:roomId/stock
 */
export const fetchRoomStock = (roomId) => {
  return request.get(`/api/rooms/${roomId}/stock`);
};