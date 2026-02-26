// src/pages/Admin/Rooms.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Image, message, Modal, Form, Input, Typography, Drawer, Descriptions, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { fetchPendingRooms, submitRoomAudit } from '../../api/admin';

const { Title, Text } = Typography;

export default function AdminRooms() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 驳回弹窗
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [form] = Form.useForm();

  // 详情抽屉
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchPendingRooms();
      if (res.code === 0) setData(res.data?.list || []);
    } catch (error) {
      console.error('获取待审核房型失败', error);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const showDetail = (record) => {
    setDetailRecord(record);
    setIsDetailVisible(true);
  };

  const handlePass = (record) => {
    Modal.confirm({
      title: '确认通过审核？',
      content: `批准房型【${record.title}】过审。过审后商户即可将其上架售卖。`,
      onOk: async () => {
        const res = await submitRoomAudit({ roomId: record._id, status: 1 });
        if (res.code === 0) {
          message.success('房型已通过审核！');
          setIsDetailVisible(false);
          loadData();
        }
      }
    });
  };

  const showRejectModal = (record) => {
    setCurrentRecord(record);
    setIsModalVisible(true);
  };

  const handleRejectSubmit = async (values) => {
    const res = await submitRoomAudit({
      roomId: currentRecord._id,
      status: 3, 
      remark: values.remark
    });
    if (res.code === 0) {
      message.success('已驳回该房型！');
      setIsModalVisible(false);
      setIsDetailVisible(false);
      form.resetFields();
      loadData();
    }
  };

  const columns = [
    { title: '所属酒店', dataIndex: ['hotel', 'name_cn'], render: (text) => <Tag color="blue">{text || '未知'}</Tag> },
    { title: '首图', dataIndex: 'images', render: (imgs) => imgs?.[0] ? <Image width={60} height={40} src={imgs[0]} style={{ objectFit: 'cover', borderRadius: 4 }} /> : '无' },
    { title: '房型名称', dataIndex: 'title', render: (text) => <b>{text}</b> },
    { title: '售价', dataIndex: 'price', render: (val) => <span style={{color: '#ff4d4f'}}>¥{val}</span> },
    { title: '总数', dataIndex: 'total_count', render: (val) => `${val} 间` },
    {
      title: '操作',
      render: (_, record) => (
        <Space size="middle">
          <Button type="default" icon={<EyeOutlined />} size="small" onClick={() => showDetail(record)}>详情</Button>
          <Button type="primary" icon={<CheckCircleOutlined />} size="small" onClick={() => handlePass(record)}>通过</Button>
          <Button danger icon={<CloseCircleOutlined />} size="small" onClick={() => showRejectModal(record)}>驳回</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card bordered={false} style={{ borderRadius: '8px' }}>
        <Title level={3} style={{ marginBottom: '24px' }}>🛏️ 平台房型内容审核</Title>
        <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} />
      </Card>

      <Modal title="填写房型驳回理由" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleRejectSubmit}>
          <Form.Item name="remark" rules={[{ required: true, message: '请输入理由' }]}>
            <Input.TextArea rows={4} placeholder="例如：图片包含水印、价格明显异常等..." />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8 }}>取消</Button>
            <Button type="primary" danger htmlType="submit">确认驳回</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="🔍 房型详情审查"
        width={640}
        placement="right"
        onClose={() => setIsDetailVisible(false)}
        open={isDetailVisible}
        extra={
          <Space>
            <Button danger icon={<CloseCircleOutlined />} onClick={() => showRejectModal(detailRecord)}>驳回</Button>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handlePass(detailRecord)}>通过审核</Button>
          </Space>
        }
      >
        {detailRecord && (
          <div style={{ paddingBottom: 40 }}>
            <Descriptions title="归属信息" bordered column={1} size="small">
              <Descriptions.Item label="所属酒店"><Tag color="blue">{detailRecord.hotel?.name_cn}</Tag></Descriptions.Item>
            </Descriptions>
            <Divider />
            <Descriptions title="房型参数" bordered column={2} size="small">
              <Descriptions.Item label="房型名称" span={2}><b>{detailRecord.title}</b></Descriptions.Item>
              <Descriptions.Item label="售卖价格"><Text type="danger" strong>¥{detailRecord.price}</Text></Descriptions.Item>
              <Descriptions.Item label="物理总数">{detailRecord.total_count} 间</Descriptions.Item>
              <Descriptions.Item label="床型">{detailRecord.bed_type}</Descriptions.Item>
              <Descriptions.Item label="面积 / 限住">{detailRecord.area}㎡ / {detailRecord.max_guests}人</Descriptions.Item>
              <Descriptions.Item label="窗户 / 早餐">{detailRecord.window_status} / {detailRecord.breakfast}</Descriptions.Item>
              <Descriptions.Item label="浴缸">{detailRecord.has_bathtub ? '有' : '无'}</Descriptions.Item>
            </Descriptions>
            <Divider />
            <Descriptions title="配置设施" bordered column={1} size="small">
              <Descriptions.Item label="客房设施">
                {detailRecord.facilities?.length > 0 ? detailRecord.facilities.map(f => <Tag color="cyan" key={f}>{f}</Tag>) : '无'}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Title level={5}>🖼️ 房型图片</Title>
            <div style={{ marginTop: 16 }}>
              {detailRecord.images && detailRecord.images.length > 0 ? (
                <Image.PreviewGroup>
                  <Space wrap>
                    {detailRecord.images.map((img, idx) => (
                      <Image key={idx} width={100} height={100} style={{ objectFit: 'cover', borderRadius: 4 }} src={img} />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              ) : <Text disabled>无图片</Text>}
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}