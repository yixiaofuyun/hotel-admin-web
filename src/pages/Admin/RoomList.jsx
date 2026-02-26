import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, Image, Space } from 'antd';
import { fetchAllRooms } from '../../api/admin';

export default function AdminRoomList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAllRooms(statusFilter !== '' ? { status: statusFilter } : {});
      if (res.code === 0) setData(res.data?.list || []);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [statusFilter]);

  const columns = [
    { title: '所属酒店', dataIndex: ['hotel', 'name_cn'], render: text => <Tag color="blue">{text || '未知'}</Tag> },
    { title: '首图', dataIndex: 'images', render: (imgs) => imgs?.[0] ? <Image width={50} src={imgs[0]} /> : '无' },
    { title: '房型名称', dataIndex: 'title', render: text => <b>{text}</b> },
    { title: '售价', dataIndex: 'price', render: val => <span style={{color: '#ff4d4f'}}>¥{val}</span> },
    { title: '总数', dataIndex: 'total_count', render: val => `${val}间` },
    { title: '平台审核', dataIndex: 'status', render: (status) => {
        if (status === 1) return <Tag color="success">已通过</Tag>;
        if (status === 3) return <Tag color="error">被驳回</Tag>;
        return <Tag color="processing">待审核</Tag>;
    }},
    { title: '商户上架状态', dataIndex: 'is_published', render: (isPublished) => {
        return isPublished ? <Tag color="cyan">售卖中</Tag> : <Tag color="default">商户已隐藏</Tag>;
    }}
  ];

  return (
    <Card bordered={false} style={{ borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3>🛏️ 平台全量房型大盘</h3>
        <Space>
          <span>审核状态：</span>
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 120 }}>
            <Select.Option value="">全部房型</Select.Option>
            <Select.Option value="1">审核通过</Select.Option>
            <Select.Option value="0">待审核</Select.Option>
            <Select.Option value="3">被驳回</Select.Option>
          </Select>
        </Space>
      </div>
      <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} />
    </Card>
  );
}