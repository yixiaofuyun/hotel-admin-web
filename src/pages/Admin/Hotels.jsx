// src/pages/Admin/Hotels.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Image, message, Modal, Form, Input, Typography, Drawer, Descriptions, Divider, Rate } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { fetchPendingHotels, submitHotelAudit } from '../../api/admin';

const { Title, Text } = Typography;

export default function AdminHotels() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 驳回弹窗状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  
  // 🌟 新增：详情抽屉的状态
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);

  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchPendingHotels();
      if (res.code === 0) setData(res.data?.list || []);
    } catch (error) {
      console.error('获取列表失败', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🌟 打开详情抽屉
  const showDetail = (record) => {
    setDetailRecord(record);
    setIsDetailVisible(true);
  };

  // 通过操作
  const handlePass = (record) => {
    Modal.confirm({
      title: '确认通过审核？',
      content: `批准【${record.name_cn}】在平台上架。`,
      onOk: async () => {
        const res = await submitHotelAudit({ hotelId: record._id, status: 1 });
        if (res.code === 0) {
          message.success('酒店已通过审核并上架！');
          setIsDetailVisible(false); // 如果是在详情里点的通过，顺便把抽屉关了
          loadData();
        }
      }
    });
  };

  // 驳回操作
  const showRejectModal = (record) => {
    setCurrentRecord(record);
    setIsModalVisible(true);
  };

  const handleRejectSubmit = async (values) => {
    const res = await submitHotelAudit({
      hotelId: currentRecord._id,
      status: 2, 
      remark: values.remark
    });
    if (res.code === 0) {
      message.success('已驳回该酒店！');
      setIsModalVisible(false);
      setIsDetailVisible(false); // 关抽屉
      form.resetFields();
      loadData();
    }
  };

  const columns = [
    {
      title: '提交商户',
      dataIndex: ['merchant', 'username'],
      render: (text) => <Tag color="blue">{text || '未知商户'}</Tag>,
    },
    {
      title: '酒店封面',
      dataIndex: 'cover_image',
      render: (url) => url ? <Image width={60} height={40} src={url} style={{ objectFit: 'cover', borderRadius: 4 }} /> : '无',
    },
    {
      title: '酒店名称',
      dataIndex: 'name_cn',
      render: (text) => <b>{text}</b>,
    },
    { title: '城市', dataIndex: 'city' },
    { title: '星级', dataIndex: 'star_rating', render: (val) => <Rate disabled defaultValue={val} style={{ fontSize: 14 }} /> },
    {
      title: '操作',
      render: (_, record) => (
        <Space size="middle">
          {/* 🌟 新增的详情按钮 */}
          <Button type="default" icon={<EyeOutlined />} size="small" onClick={() => showDetail(record)}>
            详情
          </Button>
          <Button type="primary" icon={<CheckCircleOutlined />} size="small" onClick={() => handlePass(record)}>
            通过
          </Button>
          <Button danger icon={<CloseCircleOutlined />} size="small" onClick={() => showRejectModal(record)}>
            驳回
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card bordered={false} style={{ borderRadius: '8px' }}>
        <Title level={3} style={{ marginBottom: '24px' }}>🏨 平台酒店上架审核</Title>
        <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} />
      </Card>

      {/* 驳回理由弹窗 */}
      <Modal title="填写驳回理由" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleRejectSubmit} style={{ marginTop: '20px' }}>
          <Form.Item name="remark" rules={[{ required: true, message: '请输入理由' }]}>
            <Input.TextArea rows={4} placeholder="例如：酒店名称包含违规词汇，或者封面图片不清晰..." />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8 }}>取消</Button>
            <Button type="primary" danger htmlType="submit">确认驳回</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 🌟 究极华丽的酒店详情抽屉 (Drawer) */}
      <Drawer
        title={<span style={{ fontSize: 18 }}>🔍 酒店详情审查</span>}
        width={700} // 给一个较宽的尺寸展示相册
        placement="right"
        onClose={() => setIsDetailVisible(false)}
        open={isDetailVisible}
        destroyOnClose
        extra={
          <Space>
            <Button danger icon={<CloseCircleOutlined />} onClick={() => showRejectModal(detailRecord)}>驳回</Button>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handlePass(detailRecord)}>通过审核</Button>
          </Space>
        }
      >
        {detailRecord && (
          <div style={{ paddingBottom: 40 }}>
            <Descriptions title="基本信息" bordered column={2} size="small">
              <Descriptions.Item label="酒店名称" span={2}><b>{detailRecord.name_cn}</b></Descriptions.Item>
              <Descriptions.Item label="所属品牌">{detailRecord.brand || '无'}</Descriptions.Item>
              <Descriptions.Item label="业态类型">{detailRecord.hotel_type}</Descriptions.Item>
              <Descriptions.Item label="境内/境外">{detailRecord.region_type}</Descriptions.Item>
              <Descriptions.Item label="推荐星级"><Rate disabled defaultValue={detailRecord.star_rating} style={{ fontSize: 12 }} /></Descriptions.Item>
              <Descriptions.Item label="起步价"><Text type="danger" strong>¥{detailRecord.min_price}</Text></Descriptions.Item>
              <Descriptions.Item label="默认折扣">{detailRecord.discount ? `${detailRecord.discount * 10}折` : '无'}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="位置信息" bordered column={2} size="small">
              <Descriptions.Item label="国家/城市">{detailRecord.country} - {detailRecord.city}</Descriptions.Item>
              <Descriptions.Item label="行政区/商圈">{detailRecord.district} / {detailRecord.business_zone}</Descriptions.Item>
              <Descriptions.Item label="详细地址" span={2}>{detailRecord.address}</Descriptions.Item>
              <Descriptions.Item label="经纬度坐标" span={2}>
                <Text code>
                  {detailRecord.location?.coordinates?.[0]}, {detailRecord.location?.coordinates?.[1]}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="设施与服务" bordered column={1} size="small">
              <Descriptions.Item label="特色标签">
                {detailRecord.tags?.length > 0 ? detailRecord.tags.map(tag => <Tag color="cyan" key={tag}>{tag}</Tag>) : '无'}
              </Descriptions.Item>
              <Descriptions.Item label="提供服务">
                {detailRecord.services?.length > 0 ? detailRecord.services.map(svc => <Tag color="geekblue" key={svc}>{svc}</Tag>) : '无'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />
            
            <Title level={5}>🖼️ 酒店相册</Title>
            <div style={{ marginTop: 16 }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>封面图：</Text>
              <Image width={120} height={80} style={{ objectFit: 'cover', borderRadius: 4 }} src={detailRecord.cover_image} />
              
              <Text type="secondary" style={{ display: 'block', marginTop: 16, marginBottom: 8 }}>环境图/细节图：</Text>
              {detailRecord.detail_images && detailRecord.detail_images.length > 0 ? (
                <Image.PreviewGroup>
                  <Space wrap>
                    {detailRecord.detail_images.map((img, idx) => (
                      <Image key={idx} width={100} height={100} style={{ objectFit: 'cover', borderRadius: 4 }} src={img} />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              ) : (
                <Text disabled>暂无更多图片</Text>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}