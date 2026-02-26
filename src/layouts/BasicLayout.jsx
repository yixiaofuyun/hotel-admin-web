// src/layouts/BasicLayout.jsx
import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Space, Typography } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  UserOutlined, 
  AuditOutlined, 
  HomeOutlined,
  LogoutOutlined,
  AppstoreOutlined, // 🌟 新增：商户工作台图标
  KeyOutlined       // 🌟 新增：客房管理图标
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function BasicLayout() {
  const [collapsed, setCollapsed] = useState(false); // 控制侧边栏展开/收起
  const navigate = useNavigate();
  const location = useLocation(); // 获取当前路径，用于菜单高亮

  // 从本地存储获取当前登录的用户信息
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const role = user.role; // 提取角色，用于动态生成菜单

  // 退出登录逻辑
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 顶部右上角的下拉菜单
  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人中心',
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  // 🌟 核心升级：根据用户角色动态配置左侧菜单
  const menuItems = role === 'admin' 
    ? [
        // 👑 管理员专属菜单
        {
          key: '/admin/dashboard',
          icon: <AuditOutlined />,
          label: '商户资质审核',
        },
        {
          // 🌟 已修改：更新了路径和文案
          key: '/admin/hotels',
          icon: <HomeOutlined />,
          label: '平台酒店审核',
        },
        // 🌟 新增：平台房型审核入口
        {
          key: '/admin/rooms',
          icon: <AppstoreOutlined />, // 你可以换成你喜欢的图标
          label: '平台房型审核',
        },
        {
          key: '/admin/hotel-list',
          icon: <AppstoreOutlined />, 
          label: '酒店大盘总览',
        },
        {
          key: '/admin/room-list',
          icon: <AppstoreOutlined />, 
          label: '房型大盘总览',
        },
      ]
    : [
        // 🏢 商户专属菜单
        {
          key: '/merchant/dashboard',
          icon: <AppstoreOutlined />,
          label: '数据工作台',
        },
        {
          key: '/merchant/hotels',
          icon: <HomeOutlined />,
          label: '我的酒店管理',
        },
        {
          key: '/merchant/rooms',
          icon: <KeyOutlined />,
          label: '客房与库存',
        },
      ];

  // 点击菜单跳转
  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 🌟 左侧边栏 (Gemini 风格的亮色主题) */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        style={{ borderRight: '1px solid #f0f0f0' }}
      >
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: collapsed ? '14px' : '18px',
          fontWeight: 'bold',
          color: '#1677ff',
          transition: 'all 0.2s'
        }}>
          {collapsed ? 'Snow' : 'Snow 管理中台'}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]} // 自动高亮当前所在的页面
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        {/* 🌟 顶部全局 Header */}
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          {/* 左侧：折叠按钮 */}
          <div style={{ fontSize: '18px', cursor: 'pointer' }} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>

          {/* 右侧：用户信息 */}
          <Dropdown menu={userMenu} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
              <Text strong>{user.username || '未知用户'}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                ({user.role === 'admin' ? '超级管理员' : '商户'})
              </Text>
            </Space>
          </Dropdown>
        </Header>

        {/* 🌟 中间内容区域 (Outlet 就是用来装子路由页面的“容器”) */}
        <Content style={{ margin: '24px', background: '#fff', padding: 24, borderRadius: '8px', overflow: 'auto' }}>
          <Outlet /> 
        </Content>
      </Layout>
    </Layout>
  );
}