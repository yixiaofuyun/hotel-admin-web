// src/pages/Merchant/Rooms.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, InputNumber, Select, Tag, Upload, message, Popconfirm, Image, Typography, Row, Col, Alert, Switch, Tooltip, Drawer, Descriptions, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
// 🌟 引入刚加的 fetchRoomStock
import { fetchRoomsByHotel, createRoom, updateRoom, deleteRoom, toggleRoomStatus, fetchRoomStock } from '../../api/room';
import { fetchMyHotels } from '../../api/hotel';

const { Title, Text } = Typography;
const { Option } = Select;

export default function MerchantRooms() {
  const [searchParams] = useSearchParams();
  const urlHotelId = searchParams.get('hotelId');
  const urlHotelName = searchParams.get('hotelName');

  const [data, setData] = useState([]);
  const [hotels, setHotels] = useState([]); 
  const [currentHotelId, setCurrentHotelId] = useState(urlHotelId || null); 
  const [loading, setLoading] = useState(false);
  
  // 表单相关状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [fileList, setFileList] = useState([]); 
  const [form] = Form.useForm();

  // 🌟 详情抽屉与库存状态
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [stockData, setStockData] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);

  const loadHotels = async () => {
    try {
      const res = await fetchMyHotels();
      if (res.code === 0) {
        const approvedHotels = (res.data?.list || []).filter(h => h.status === 1);
        setHotels(approvedHotels);
        if (!currentHotelId && approvedHotels.length > 0) {
          setCurrentHotelId(approvedHotels[0]._id);
        }
      }
    } catch (error) { console.error(error); }
  };

  const loadRooms = async () => {
    if (!currentHotelId) return;
    setLoading(true);
    try {
      const res = await fetchRoomsByHotel(currentHotelId);
      if (res.code === 0) setData(res.data?.list || []);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  useEffect(() => { loadHotels(); }, []);
  useEffect(() => { if (currentHotelId) loadRooms(); }, [currentHotelId]);

  // 🌟 打开详情抽屉并加载库存
  const showDetail = async (record) => {
    setDetailRecord(record);
    setIsDetailVisible(true);
    setStockLoading(true);
    try {
      const res = await fetchRoomStock(record._id);
      if (res.code === 0) {
        setStockData(res.data?.list || []);
      }
    } catch (error) {
      message.error('获取库存日历失败');
    }
    setStockLoading(false);
  };

  const openModal = (record = null) => {
    if (record) {
      setEditingId(record._id);
      if (record.images && record.images.length > 0) {
        setFileList(record.images.map((url, i) => ({ uid: `-${i}`, name: 'room.png', status: 'done', url })));
      } else {
        setFileList([]);
      }
      form.setFieldsValue({ ...record, hotelId: record.hotel || currentHotelId });
    } else {
      setEditingId(null);
      setFileList([]);
      form.resetFields();
      form.setFieldsValue({ hotelId: currentHotelId }); 
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    const imagesUrls = fileList.map(file => file.url || file.response?.data?.url).filter(url => url);
    if (imagesUrls.length === 0) return message.warning('请至少上传一张房间图片！');

    const submitData = { ...values, images: imagesUrls };

    try {
      const res = editingId ? await updateRoom(editingId, submitData) : await createRoom(submitData);
      if (res.code === 0) {
        message.success(editingId ? '房型修改成功' : '房型保存成功，并已生成初始库存！');
        setIsModalVisible(false);
        loadRooms();
      }
    } catch (error) { 
       if (error.response?.data?.message) {
           message.error(error.response.data.message);
       } else {
           message.error('保存失败');
       }
    }
  };

  const handleDelete = async (id) => {
    try {
        const res = await deleteRoom(id);
        if (res.code === 0) { message.success('房型已彻底删除'); loadRooms(); }
    } catch (error) {
        if (error.response?.data?.message) {
            message.error(error.response.data.message);
        } else {
            message.error('删除失败');
        }
    }
  };

  const handleTogglePublish = async (checked, record) => {
      try {
          const action = checked ? 'recover' : 'hide';
          const res = await toggleRoomStatus(record._id, action);
          if (res.code === 0) {
              message.success(res.message);
              loadRooms(); 
          }
      } catch (error) {
          message.error('状态切换失败');
          loadRooms(); 
      }
  }

  const columns = [
    { title: '首图', dataIndex: 'images', render: (imgs) => imgs?.[0] ? <Image width={50} height={50} src={imgs[0]} style={{borderRadius: 4, objectFit: 'cover'}} /> : '无' },
    { title: '房型名称', dataIndex: 'title', render: (text) => <b>{text}</b> }, 
    { title: '床型', dataIndex: 'bed_type' },
    { title: '当前售价', dataIndex: 'price', render: (val) => <span style={{color: '#ff4d4f', fontWeight: 'bold'}}>¥{val}</span> },
    { title: '物理总房间数', dataIndex: 'total_count', render: (val) => <Tag color="blue">{val} 间</Tag> }, 
    { title: '审核状态', dataIndex: 'status', render: (status, record) => {
        if (status === 1) return <Tag color="success">审核通过</Tag>;
        if (status === 3) return <Tag color="error" title={record.audit_remark}>被驳回</Tag>;
        if (status === 0) return <Tag color="processing">待审核</Tag>;
        return <Tag color="default">未知</Tag>;
    }},
    { 
      title: '上架状态', 
      dataIndex: 'is_published', 
      render: (isPublished, record) => (
         <Tooltip title={record.status !== 1 ? '必须通过平台审核后方可上架' : ''}>
           <Switch 
              checkedChildren="售卖中" 
              unCheckedChildren="已隐藏" 
              checked={isPublished} 
              disabled={record.status !== 1} 
              onChange={(checked) => handleTogglePublish(checked, record)}
           />
         </Tooltip>
      )
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          {/* 🌟 增加详情按钮 */}
          <Button type="link" icon={<EyeOutlined />} onClick={() => showDetail(record)}>详情</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)}>编辑</Button>
          <Popconfirm title="确定彻底删除该房型及其库存记录？" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 🌟 库存表格列配置
  const stockColumns = [
    { title: '日期', dataIndex: 'date', render: (text) => <Text strong>{text}</Text> },
    { title: '物理总房间数', dataIndex: 'total_count', render: (val) => `${val} 间` },
    { title: '已被预订', dataIndex: 'booked_count', render: (val) => <Text type={val > 0 ? "danger" : "secondary"}>{val} 间</Text> },
    { 
      title: '剩余可售', 
      render: (_, record) => {
        const remaining = record.total_count - record.booked_count;
        return <Tag color={remaining > 0 ? 'green' : 'red'}>{remaining > 0 ? `${remaining} 间` : '已满房'}</Tag>;
      }
    },
  ];

  const uploadUrl = "http://47.236.128.86:3000/api/upload";
  const uploadHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  return (
    <>
      <Card bordered={false} style={{ borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <Space direction="vertical" size="small">
            <Title level={4} style={{ margin: 0 }}>🛏️ 客房与库存管理</Title>
            {urlHotelName && <Alert message={`提示：您是从【${urlHotelName}】详情页跳转过来的`} type="info" showIcon />}
            
            <Space style={{ marginTop: 8 }}>
              <span>当前管理酒店：</span>
              <Select value={currentHotelId} onChange={setCurrentHotelId} style={{ width: 250 }} placeholder="请选择要管理的酒店">
                {hotels.map(h => <Option key={h._id} value={h._id}>{h.name_cn}</Option>)}
              </Select>
            </Space>
          </Space>
          
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} size="large" disabled={!currentHotelId}>
            添加新房型
          </Button>
        </div>
        <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} />
      </Card>

      {/* 🌟 详情与库存抽屉 */}
      <Drawer
        title="🛏️ 房型详情与库存监控"
        width={750}
        onClose={() => setIsDetailVisible(false)}
        open={isDetailVisible}
        extra={<Button type="primary" icon={<EditOutlined />} onClick={() => { setIsDetailVisible(false); openModal(detailRecord); }}>修改房型</Button>}
      >
        {detailRecord && (
          <>
            <Descriptions title="房型基础信息" bordered column={2} size="small">
              <Descriptions.Item label="房型名称" span={2}><b>{detailRecord.title}</b></Descriptions.Item>
              <Descriptions.Item label="当前售价"><Text type="danger" strong>¥{detailRecord.price}</Text></Descriptions.Item>
              <Descriptions.Item label="划线原价">{detailRecord.original_price ? `¥${detailRecord.original_price}` : '无'}</Descriptions.Item>
              <Descriptions.Item label="床型">{detailRecord.bed_type}</Descriptions.Item>
              <Descriptions.Item label="面积/限住">{detailRecord.area} ㎡ / 最多 {detailRecord.max_guests} 人</Descriptions.Item>
              <Descriptions.Item label="窗户/早餐">{detailRecord.window_status} / {detailRecord.breakfast}</Descriptions.Item>
              <Descriptions.Item label="浴缸配套">{detailRecord.has_bathtub ? '有浴缸' : '无浴缸'}</Descriptions.Item>
              <Descriptions.Item label="客房设施" span={2}>
                {detailRecord.facilities?.length > 0 ? detailRecord.facilities.map(f => <Tag color="blue" key={f}>{f}</Tag>) : '未配置'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />
            
            <Title level={5}>🖼️ 房型实拍图</Title>
            <div style={{ marginBottom: 24 }}>
              {detailRecord.images?.length > 0 ? (
                <Image.PreviewGroup>
                  <Space wrap>
                    {detailRecord.images.map((img, i) => (
                      <Image key={i} width={100} height={100} src={img} style={{ borderRadius: 4, objectFit: 'cover' }} />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              ) : <Text disabled>暂无图片</Text>}
            </div>

            <Divider />

            {/* 🌟 核心：未来 60 天库存表 */}
            <Title level={5}>📅 未来 60 天库存日历</Title>
            <Alert message="提示：C端用户下单会自动扣减这里的【剩余可售】数量。如果总房间数有变动，请点击右上角【修改房型】。" type="info" showIcon style={{ marginBottom: 16 }} />
            <Table 
              columns={stockColumns} 
              dataSource={stockData} 
              rowKey="_id" 
              loading={stockLoading} 
              size="small" 
              pagination={{ pageSize: 10, showSizeChanger: false }} // 一页显示10天，不显得臃肿
            />
          </>
        )}
      </Drawer>

      <Modal title={editingId ? "✏️ 编辑房型" : "🛏️ 添加新房型"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()} width={750} destroyOnClose maskClosable={false}>
        <Alert message="提示：修改房型会使其重新进入待审核状态；若修改了总房间数，未来库存将自动同步。" type="warning" showIcon style={{ marginBottom: 16 }} />
        
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ breakfast: '双早', window_status: '有窗', total_count: 1, max_guests: 2, has_bathtub: false }}>
          <Form.Item name="hotelId" hidden><Input /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="title" label="房型名称" rules={[{ required: true }]}><Input placeholder="例：豪华海景大床房" /></Form.Item></Col>
            <Col span={12}><Form.Item name="bed_type" label="床型" rules={[{ required: true }]}><Input placeholder="例：1张1.8m大床" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="price" label="当前售价 (元)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={8}><Form.Item name="original_price" label="划线原价 (元)"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={8}><Form.Item name="total_count" label="物理总房间数 (决定库存)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}><Form.Item name="area" label="面积 (㎡)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={6}><Form.Item name="max_guests" label="最多入住人数" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={1} max={10} /></Form.Item></Col>
            <Col span={6}>
              <Form.Item name="window_status" label="窗户情况">
                <Select><Option value="有窗">有窗</Option><Option value="无窗">无窗</Option><Option value="部分有窗">部分有窗</Option></Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="breakfast" label="早餐包含情况">
                <Select><Option value="无早">无早</Option><Option value="单早">单早</Option><Option value="双早">双早</Option><Option value="多早">多早</Option></Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
             <Col span={24}>
                 <Form.Item name="has_bathtub" label="是否有浴缸" valuePropName="checked">
                    <Switch checkedChildren="有" unCheckedChildren="无" />
                 </Form.Item>
             </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="facilities" label="房间内设施 (输入后回车确认)">
                <Select mode="tags" placeholder="例：智能马桶, 投影仪, 免费洗漱用品" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="房型轮播图 (多张)" required>
            <Upload name="file" listType="picture-card" action={uploadUrl} headers={uploadHeaders} fileList={fileList} onChange={({ fileList }) => setFileList(fileList)}>
              {fileList.length >= 8 ? null : <div><PlusOutlined /><div style={{marginTop: 8}}>上传图片</div></div>}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}