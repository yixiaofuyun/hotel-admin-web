// src/pages/Merchant/Hotels.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, InputNumber, Select, Radio, Rate, Upload, message, Image, Typography, Row, Col, Divider, Drawer, Descriptions, Tag } from 'antd';
import { PlusOutlined, EditOutlined, LoadingOutlined, EnvironmentOutlined, EyeOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchMyHotels, createHotel, updateHotel } from '../../api/hotel'; // 🌟 彻底移除了 deleteHotel 引用

const { Title, Text } = Typography;
const { Option } = Select;

export default function MerchantHotels() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // 详情抽屉状态
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);

  // 图片上传相关的状态
  const [coverUploading, setCoverUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(''); 
  const [detailFileList, setDetailFileList] = useState([]); 

  const [isMapVisible, setIsMapVisible] = useState(false);
  const [form] = Form.useForm();

  // 1. 获取酒店列表
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchMyHotels();
      // 🌟 适配后端的 list 结构
      if (res.code === 0) {
        setData(res.data?.list || []);
      }
    } catch (error) {
      console.error('获取酒店列表失败', error);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. 监听地图消息
  useEffect(() => {
    const handleMapMessage = (event) => {
      const loc = event.data;
      if (loc && loc.module === 'locationPicker') {
        form.setFieldsValue({
          longitude: loc.latlng.lng,
          latitude: loc.latlng.lat,
          address: loc.poiaddress 
        });
        setIsMapVisible(false);
        message.success(`📍 位置已锁定：${loc.poiname || '自定义坐标'}`);
      }
    };
    window.addEventListener('message', handleMapMessage);
    return () => window.removeEventListener('message', handleMapMessage);
  }, [form]);

  // 3. 查看详情
  const showDetail = (record) => {
    setDetailRecord(record);
    setIsDetailVisible(true);
  };

  // 4. 打开表单弹窗
  const openModal = (record = null) => {
    if (record) {
      setEditingId(record._id);
      setImageUrl(record.cover_image || ''); 
      if (record.detail_images && record.detail_images.length > 0) {
        const fileList = record.detail_images.map((url, index) => ({
          uid: `-${index}`,
          name: `image-${index}.png`,
          status: 'done',
          url: url,
        }));
        setDetailFileList(fileList);
      } else {
        setDetailFileList([]);
      }
      form.setFieldsValue({
        ...record,
        longitude: record.location?.coordinates?.[0],
        latitude: record.location?.coordinates?.[1],
      });
    } else {
      setEditingId(null);
      setImageUrl('');
      setDetailFileList([]);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 5. 处理提交
  const handleSubmit = async (values) => {
    if (!imageUrl) return message.warning('请上传酒店封面图！');
    const detailImagesUrls = detailFileList.map(file => file.url || file.response?.data?.url).filter(url => url); 

    const submitData = {
      ...values,
      location: { type: "Point", coordinates: [values.longitude, values.latitude] },
      cover_image: imageUrl,
      detail_images: detailImagesUrls
    };

    try {
      const res = editingId ? await updateHotel(editingId, submitData) : await createHotel(submitData);
      if (res.code === 0) {
        message.success(editingId ? '酒店信息更新成功！' : '新酒店发布成功！');
        setIsModalVisible(false);
        loadData(); 
      }
    } catch (error) { console.error(error); }
  };

  const uploadUrl = "http://47.236.128.86:3000/api/upload";
  const uploadHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const columns = [
    { title: '封面', dataIndex: 'cover_image', render: (url) => url ? <Image width={60} height={60} src={url} style={{ objectFit: 'cover', borderRadius: 4 }} /> : '无' },
    { title: '酒店名称', dataIndex: 'name_cn', render: (text) => <b>{text}</b> },
    { title: '品牌', dataIndex: 'brand' },
    { title: '星级', dataIndex: 'star_rating', render: (val) => <Rate disabled defaultValue={val} style={{ fontSize: 14 }} /> },
    { title: '城市', dataIndex: 'city' },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => showDetail(record)}>详情</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)}>编辑</Button>
          {/* 🌟 确认：删除按钮已被永久移除 */}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card bordered={false} style={{ borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <Title level={4} style={{ margin: 0 }}>🏢 我的酒店管理</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>发布新酒店</Button>
        </div>
        <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} />
      </Card>

      {/* 🌟 详情预览抽屉 - 包含“添加房型”按钮 */}
      <Drawer
        title="🏨 酒店详情预览"
        width={640}
        onClose={() => setIsDetailVisible(false)}
        open={isDetailVisible}
        extra={
          <Space>
            <Button 
              icon={<KeyOutlined />} 
              onClick={() => {
                setIsDetailVisible(false);
                navigate(`/merchant/rooms?hotelId=${detailRecord._id}&hotelName=${detailRecord.name_cn}`);
              }}
            >
              添加房型
            </Button>
            <Button type="primary" icon={<EditOutlined />} onClick={() => { setIsDetailVisible(false); openModal(detailRecord); }}>
              编辑酒店
            </Button>
          </Space>
        }
      >
        {detailRecord && (
          <>
            <Descriptions title="基本信息" bordered column={1} size="small">
              <Descriptions.Item label="酒店名称"><b>{detailRecord.name_cn}</b></Descriptions.Item>
              <Descriptions.Item label="品牌/类型">{detailRecord.brand || '无'} / {detailRecord.hotel_type}</Descriptions.Item>
              <Descriptions.Item label="推荐星级"><Rate disabled defaultValue={detailRecord.star_rating} style={{ fontSize: 12 }} /></Descriptions.Item>
              <Descriptions.Item label="价格/折扣">¥{detailRecord.min_price} / {detailRecord.discount ? `${detailRecord.discount * 10}折` : '无'}</Descriptions.Item>
            </Descriptions>
            <Divider />
            <Descriptions title="位置信息" bordered column={1} size="small">
              <Descriptions.Item label="详细地址">{detailRecord.address}</Descriptions.Item>
              <Descriptions.Item label="坐标">{detailRecord.location?.coordinates?.join(', ')}</Descriptions.Item>
            </Descriptions>
            <Divider />
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>酒店图片：</Text>
              <Space wrap>
                <div style={{textAlign: 'center'}}><Image width={120} height={80} src={detailRecord.cover_image} style={{ borderRadius: 4, objectFit: 'cover' }} /><div style={{fontSize: 12, color: '#999'}}>封面图</div></div>
                <Image.PreviewGroup>
                  {detailRecord.detail_images?.map((img, i) => (
                    <Image key={i} width={80} height={80} src={img} style={{ borderRadius: 4, objectFit: 'cover' }} />
                  ))}
                </Image.PreviewGroup>
              </Space>
            </div>
            <Descriptions title="服务设施" bordered column={1} size="small">
              <Descriptions.Item label="特色标签">{detailRecord.tags?.map(t => <Tag color="blue" key={t}>{t}</Tag>) || '暂无'}</Descriptions.Item>
              <Descriptions.Item label="配套服务">{detailRecord.services?.map(s => <Tag color="green" key={s}>{s}</Tag>) || '暂无'}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Drawer>

      <Modal title={editingId ? "✏️ 编辑酒店信息" : "🏨 发布新酒店"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()} width={800} destroyOnClose maskClosable={false}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 20 }} initialValues={{ country: '中国', region_type: '国内', discount: 1, star_rating: 5 }}>
          <Divider orientation="left">基本信息</Divider>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name_cn" label="酒店名称" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="brand" label="所属品牌"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="hotel_type" label="业态类型" rules={[{ required: true }]}>
                <Select><Option value="酒店">酒店</Option><Option value="民宿">民宿</Option><Option value="度假村">度假村</Option></Select>
              </Form.Item>
            </Col>
            <Col span={8}><Form.Item name="region_type" label="境内/境外"><Radio.Group><Radio value="国内">国内</Radio><Radio value="海外">海外</Radio></Radio.Group></Form.Item></Col>
            <Col span={8}><Form.Item name="star_rating" label="推荐星级"><Rate /></Form.Item></Col>
          </Row>
          <Divider orientation="left">位置信息</Divider>
          <Row gutter={16}>
            <Col span={6}><Form.Item name="country" label="国家"><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="city" label="城市" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="district" label="行政区"><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="business_zone" label="商圈"><Input /></Form.Item></Col>
          </Row>
          <Form.Item label="地理坐标与详细地址" required>
            <Space align="start" size="large">
              <Space direction="vertical" size="small">
                <Space>
                  <Form.Item name="longitude" noStyle rules={[{ required: true }]}><InputNumber placeholder="经度" style={{ width: 140 }} readOnly /></Form.Item>
                  <Form.Item name="latitude" noStyle rules={[{ required: true }]}><InputNumber placeholder="纬度" style={{ width: 140 }} readOnly /></Form.Item>
                  <Button type="primary" onClick={() => setIsMapVisible(true)} icon={<EnvironmentOutlined />}>地图选点</Button>
                </Space>
                <Form.Item name="address" noStyle rules={[{ required: true }]}><Input placeholder="详细地址" style={{ width: 420 }} /></Form.Item>
              </Space>
            </Space>
          </Form.Item>
          <Divider orientation="left">商业属性</Divider>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="min_price" label="起步价 (元)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="discount" label="默认折扣"><InputNumber style={{ width: '100%' }} min={0.1} max={1} step={0.01} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="tags" label="特色标签"><Select mode="tags" /></Form.Item></Col>
            <Col span={12}><Form.Item name="services" label="酒店服务"><Select mode="tags" /></Form.Item></Col>
          </Row>
          <Divider orientation="left">图片资料</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="酒店封面图" required>
                <Upload name="file" listType="picture-card" showUploadList={false} action={uploadUrl} headers={uploadHeaders} onChange={(info) => {
                  if (info.file.status === 'done') setImageUrl(info.file.response?.data?.url);
                }}>
                  {imageUrl ? <img src={imageUrl} alt="cover" style={{ width: '100%' }} /> : <PlusOutlined />}
                </Upload>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item label="酒店详情图">
                <Upload name="file" listType="picture-card" action={uploadUrl} headers={uploadHeaders} fileList={detailFileList} onChange={({ fileList }) => setDetailFileList(fileList)}>
                  {detailFileList.length >= 8 ? null : <PlusOutlined />}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 地图选点 */}
      <Modal title="📍 地图选点" open={isMapVisible} onCancel={() => setIsMapVisible(false)} footer={null} width={900} destroyOnClose>
        <div style={{ height: '450px', overflow: 'hidden', position: 'relative' }}>
          <iframe title="map" style={{ width: '100%', height: '750px', border: 'none', position: 'absolute', top: 0 }} src="https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=BZWBZ-VDHL7-5EKX5-P42UI-F36S6-V7B7G&referer=snowPlatform" />
        </div>
      </Modal>
    </>
  );
}