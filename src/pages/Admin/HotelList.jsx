import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, Image, Space } from 'antd';
import { fetchAllHotels } from '../../api/admin';

export default function AdminHotelList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAllHotels(statusFilter !== '' ? { status: statusFilter } : {});
      if (res.code === 0) setData(res.data?.list || []);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [statusFilter]);

  const columns = [
    { title: '封面', dataIndex: 'cover_image', render: (url) => url ? <Image width={50} src={url} /> : '无' },
    { title: '酒店名称', dataIndex: 'name_cn', render: text => <b>{text}</b> },
    { title: '归属商户', dataIndex: ['merchant', 'username'] },
    { title: '城市', dataIndex: 'city' },
    { title: '星级', dataIndex: 'star_rating', render: val => `${val}星` },
    { title: '审核状态', dataIndex: 'status', render: (status) => {
        if (status === 1) return <Tag color="success">已上架</Tag>;
        if (status === 3) return <Tag color="error">被驳回</Tag>;
        if (status === 0) return <Tag color="processing">待审核</Tag>;
        return <Tag>未知</Tag>;
    }},
    { title: '创建时间', dataIndex: 'createdAt', render: val => new Date(val).toLocaleDateString() }
  ];

  return (
    <Card bordered={false} style={{ borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3>🏢 平台全量酒店大盘</h3>
        <Space>
          <span>状态过滤：</span>
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 120 }}>
            <Select.Option value="">全部酒店</Select.Option>
            <Select.Option value="1">已上架</Select.Option>
            <Select.Option value="0">待审核</Select.Option>
            <Select.Option value="3">被驳回</Select.Option>
          </Select>
        </Space>
      </div>
      <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} />
    </Card>
  );
}