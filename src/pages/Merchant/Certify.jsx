// src/pages/Merchant/Certify.jsx
import React, { useState } from 'react';
import { Card, Form, Input, Button, Upload, message, Typography, Divider } from 'antd';
import { LoadingOutlined, PlusOutlined, ShopOutlined, PhoneOutlined, FileImageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import request from '../../utils/request';

const { Title, Paragraph, Text } = Typography;

export default function Certify() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(''); // 存储上传成功后的图片URL
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 🌟 1. 处理图片上传逻辑
// 🌟 核心：必须通过 .data.url 来读取你的后端地址
  const handleChange = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      // 🎯 关键修改：从 response.data 里拿 url
      const finalUrl = info.file.response?.data?.url; 

      if (finalUrl) {
        setImageUrl(finalUrl); // 拿到真实地址，给变量赋值
        setLoading(false);
        // 🚨 注意看这句话！如果弹出的不是这句话，说明你代码没保存成功！
        message.success('代码更新生效，图片回显成功！'); 
      } else {
        setLoading(false);
        message.error('未获取到图片地址，请检查代码');
      }
    } else if (info.file.status === 'error') {
      setLoading(false);
      message.error('图片上传失败');
    }
  };

  // 🌟 2. 提交认证资料
  const onFinish = async (values) => {
    if (!imageUrl) {
      return message.error('请上传营业执照图片！');
    }

    try {
      // 这里的接口建议路径：POST /api/auth/certify
      const res = await request.post('/api/auth/certify', {
        business_name: values.business_name,
        contact_phone: values.contact_phone,
        license_url: imageUrl
      });

      if (res.code === 0) {
        message.success('资料提交成功，请等待平台审核！');
        // 提交后，本地缓存的状态也要更新，防止页面刷新又跳回来
        const user = JSON.parse(localStorage.getItem('user'));
        user.merchant_status = 1; // 变成待审核状态
        localStorage.setItem('user', JSON.stringify(user));
        
        // 跳转到一个“等待审核”的提示页，或者直接回登录页
        navigate('/login');
      }
    } catch (error) {
      console.error('提交失败', error);
    }
  };

  // 上传按钮的 UI
  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传照片</div>
    </div>
  );

  return (
    <div style={{ padding: '40px', background: '#f0f2f5', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <Card style={{ width: 700, borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2}>🏢 商户入驻资质认证</Title>
          <Paragraph type="secondary">请提供真实有效的企业信息，审核通过后即可开启酒店管理权限</Paragraph>
        </div>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            label="企业/酒店名称"
            name="business_name"
            rules={[{ required: true, message: '请输入营业执照上的名称' }]}
          >
            <Input prefix={<ShopOutlined />} placeholder="例：星链国际大酒店" />
          </Form.Item>

          <Form.Item
            label="联系电话"
            name="contact_phone"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' }
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="用于接收审核结果通知" />
          </Form.Item>

          <Form.Item label="营业执照扫描件" required>
            <Upload
                // 1. 对应 Apifox 中的参数名 "file"
                name="file" 
                
                // 2. 对应 Apifox 中的接口地址 (请根据你后端实际端口修改)
                action="http://47.236.128.86:3000/api/upload" 
                
                // 3. 对应 Apifox 中的 Headers (必须手动传入 Token)
                headers={{
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }}
                
                // 4. 固定参数
                listType="picture-card"
                showUploadList={false}
                
                // 5. 上传状态监听函数
                onChange={handleChange}
                >
                {imageUrl ? (
                    <img src={imageUrl} alt="license" style={{ width: '100%', borderRadius: '8px' }} />
                ) : (
                    uploadButton
                )}
            </Upload>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <FileImageOutlined /> 支持 jpg/png 格式，图片大小不超过 2MB
            </Text>
          </Form.Item>

          <Form.Item style={{ marginTop: '40px' }}>
            <Button type="primary" htmlType="submit" block style={{ height: '50px', fontSize: '18px' }}>
              提交审核资料
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}