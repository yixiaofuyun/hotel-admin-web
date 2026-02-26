// src/pages/Merchant/Dashboard.jsx
import React from 'react';
import { Card, Row, Col, Statistic, Typography, Divider, Button } from 'antd';
import { ShopOutlined, ShoppingCartOutlined, PayCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function MerchantDashboard() {
  const navigate = useNavigate();
  // 从本地拿到商户资料，为了显示他的店名
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const businessName = user.merchant_profile?.business_name || '尊贵的商户';

  return (
    <>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>👋 欢迎回来，{businessName}</Title>
          <Text type="secondary">今天是您加入 Snow 平台的又一天，祝您生意兴隆！</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/merchant/rooms')}>
          发布新房型
        </Button>
      </div>

      <Divider />

      {/* 🌟 核心数据看板 */}
      <Row gutter={16}>
        <Col span={8}>
          <Card hoverable style={{ borderRadius: '8px' }}>
            <Statistic 
              title="今日有效订单" 
              value={12} 
              prefix={<ShoppingCartOutlined style={{ color: '#1677ff' }} />} 
              suffix="单" 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable style={{ borderRadius: '8px' }}>
            <Statistic 
              title="当前在售房型" 
              value={5} 
              prefix={<ShopOutlined style={{ color: '#52c41a' }} />} 
              suffix="种"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable style={{ borderRadius: '8px' }}>
            <Statistic 
              title="今日预计收入" 
              value={3580.00} 
              precision={2} // 保留两位小数
              prefix={<PayCircleOutlined style={{ color: '#faad14' }} />} 
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      {/* 这里下面未来可以放一个 Echarts 折线图，或者最新订单的表格 */}
      <Card style={{ marginTop: 24, borderRadius: '8px', minHeight: '300px' }}>
        <Title level={5}>📈 近期订单趋势</Title>
        <div style={{ textAlign: 'center', color: '#999', marginTop: '100px' }}>
          [ 暂无图表数据，待接入订单模块后展示 ]
        </div>
      </Card>
    </>
  );
}