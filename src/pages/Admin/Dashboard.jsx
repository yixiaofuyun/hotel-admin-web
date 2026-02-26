// src/pages/Admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Image, message, Modal, Form, Input, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
// 🌟 核心修改 1：移除直接引用 request，改为引用我们封装好的 API
import { fetchPendingMerchants, submitMerchantAudit } from '../../api/admin';

const { Title } = Typography;

export default function AdminDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [form] = Form.useForm();

  // 🌟 1. 获取待审核列表数据
  const fetchData = async () => {
    setLoading(true);
    try {
      // 🌟 核心修改 2：极其清爽的 API 调用
      const res = await fetchPendingMerchants();
      if (res.code === 0) {
        setData(res.data);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.error('获取列表失败', error);
    }
    setLoading(false);
  };

  // 页面加载时自动获取数据
  useEffect(() => {
    fetchData();
  }, []);

  // 🌟 2. 处理【通过】操作
  const handlePass = async (record) => {
    Modal.confirm({
      title: '确认通过审核？',
      content: `您将批准【${record.merchant_profile.business_name}】的入驻申请。`,
      onOk: async () => {
        try {
          // 🌟 核心修改 3：通过封装好的 API 提交“通过”状态
          const res = await submitMerchantAudit({
            merchantId: record._id,
            status: 2 // 2代表通过
          });
          if (res.code === 0) {
            message.success('审核已通过！该商户已获得正式权限。');
            fetchData(); // 刷新表格
          }
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  // 🌟 3. 处理【驳回】操作 (打开弹窗)
  const showRejectModal = (record) => {
    setCurrentRecord(record);
    setIsModalVisible(true);
  };

  // 提交驳回理由
  const handleRejectSubmit = async (values) => {
    try {
      // 🌟 核心修改 4：通过封装好的 API 提交“驳回”状态及理由
      const res = await submitMerchantAudit({
        merchantId: currentRecord._id,
        status: 3, // 3代表驳回
        remark: values.remark
      });
      if (res.code === 0) {
        message.success('已驳回该商户的申请！');
        setIsModalVisible(false);
        form.resetFields(); // 清空表单
        fetchData(); // 刷新表格
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 🌟 4. 定义表格的列
  const columns = [
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString(), // 格式化时间
    },
    {
      title: '企业/酒店名称',
      dataIndex: ['merchant_profile', 'business_name'], // 嵌套数据的取法
      key: 'business_name',
      render: (text) => <b>{text}</b>,
    },
    {
      title: '联系电话',
      dataIndex: ['merchant_profile', 'contact_phone'],
      key: 'contact_phone',
    },
    {
      title: '营业执照',
      key: 'license_url',
      render: (_, record) => (
        <Image
          width={60}
          height={60}
          src={record.merchant_profile.license_url}
          alt="营业执照"
          style={{ objectFit: 'cover', borderRadius: '4px', border: '1px solid #d9d9d9' }}
          preview={{ mask: '点击放大' }} // 自带超级好用的图片放大镜！
        />
      ),
    },
    {
      title: '当前状态',
      key: 'status',
      render: () => <Tag color="processing">待平台审核</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
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
      <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Title level={3} style={{ marginBottom: '24px' }}>🛡️ 平台管理员工作台 - 资质审核</Title>
        
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 8 }} // 每页显示8条
        />
      </Card>

      {/* 驳回理由弹窗 */}
      <Modal
        title="填写驳回理由"
        open={isModalVisible}
        onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleRejectSubmit} style={{ marginTop: '20px' }}>
          <Form.Item
            name="remark"
            label="驳回原因（将直接展示给商户）"
            rules={[{ required: true, message: '请输入驳回原因，以便商户修改！' }]}
          >
            <Input.TextArea rows={4} placeholder="例如：营业执照照片模糊不清，请重新上传高清原件扫描件。" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
              <Button type="primary" danger htmlType="submit">确认驳回</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}