// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Certify from './pages/Merchant/Certify'; 
import AdminDashboard from './pages/Admin/Dashboard'; 
// 🌟 1. 引入我们刚写好的全局布局
import BasicLayout from './layouts/BasicLayout'; 
import MerchantDashboard from './pages/Merchant/Dashboard';
import MerchantHotels from './pages/Merchant/Hotels';
import AdminHotels from './pages/Admin/Hotels';
import MerchantRooms from './pages/Merchant/Rooms';
import AdminRooms from './pages/Admin/Rooms'; // 引入组件
import AdminHotelList from './pages/Admin/HotelList';
import AdminRoomList from './pages/Admin/RoomList';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. 独立页面 (不需要左侧边栏的) */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/merchant/certify" element={<Certify />} />
        
        {/* 🌟 2. 嵌套路由：包裹在 BasicLayout 里的页面 */}
        <Route element={<BasicLayout />}>
          {/* 管理员页面 */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} /> 
          <Route path="/admin/hotels" element={<AdminHotels />} />
          <Route path="/admin/rooms" element={<AdminRooms />} />
          <Route path="/admin/hotel-list" element={<AdminHotelList />} />
          <Route path="/admin/room-list" element={<AdminRoomList />} />
          
          {/* 未来商户审核通过后，商户的工作台也可以放这里！ */}
          {/* <Route path="/merchant/dashboard" element={<MerchantDashboard />} /> */}
          <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
          <Route path="/merchant/hotels" element={<MerchantHotels />} />
          <Route path="/merchant/rooms" element={<MerchantRooms />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;