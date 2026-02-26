// src/pages/Login/index.jsx
import React, { useState } from 'react';
import { Card, Form, Input, Button, Radio, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; 

// 🌟 核心修改 1：引入抽离好的 API，删掉原本直接引入的 request
import { loginUser, registerMerchant } from '../../api/auth'; 

import './index.css';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form] = Form.useForm();
  const navigate = useNavigate(); 

  const onFinish = async (values) => {
    try {
      if (mode === 'register') {
        // ==========================================
        // 🚀 执行注册逻辑
        // ==========================================
        // 🌟 核心修改 2：使用封装好的 registerMerchant
        const res = await registerMerchant({
          username: values.username,
          password: values.password
        });

        if (res.code === 0) {
          message.success('注册成功！请使用新账号登录。');
          setMode('login'); // 自动切回登录界面
          form.resetFields();
        } else {
          message.error(res.message);
        }

      } else {
        // ==========================================
        // 🚀 执行登录逻辑
        // ==========================================
        // 🌟 核心修改 3：使用封装好的 loginUser
        const res = await loginUser({
          username: values.username,
          password: values.password
        });

        if (res.code === 0 && res.data) {
          message.success('登录成功，欢迎回来！');
          
          const { token, userInfo } = res.data; 
          
          if (!userInfo) {
              message.error('后端数据格式错误：缺少 userInfo');
              return;
          }

          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userInfo));

          const role = userInfo.role;
          const status = userInfo.merchant_status; 
          
          if (role === 'admin') {
             navigate('/admin/dashboard'); 
          } else if (role === 'merchant') {
             // 🚦 商户状态机拦截器
             if (status === 0) {
                 localStorage.setItem('token', token);
                 localStorage.setItem('user', JSON.stringify(userInfo));
                 message.warning('资质未提交，请先完善企业资料');
                 navigate('/merchant/certify');
                 
             } else if (status === 1) {
                 message.info('您的入驻申请正在审核中，请耐心等待管理员通过！');
                 
             } else if (status === 2) {
                 localStorage.setItem('token', token);
                 localStorage.setItem('user', JSON.stringify(userInfo));
                 message.success('登录成功，欢迎来到商户工作台');
                 navigate('/merchant/dashboard');
                 
             } else if (status === 3) {
                 localStorage.setItem('token', token);
                 localStorage.setItem('user', JSON.stringify(userInfo));
                 const remark = userInfo.audit_remark ? `理由：${userInfo.audit_remark}` : '请重新提交';
                 message.error(`资质审核被驳回！${remark}`);
                 navigate('/merchant/certify');
             }
          }
        } else {
          message.error(res.message || '登录失败');
        }
      }
    } catch (error) {
      console.error('请求出错:', error);
    }
  };

  const toggleMode = () => {
    const newMode = mode === 'login' ? 'register' : 'login';
    setMode(newMode);
    form.resetFields();
  };

  return (
    <div className="login-container">
      {/* Left Side */}
      <div className="login-left">
        <div>
          <div className="login-left-title">
            <SafetyCertificateOutlined style={{ marginRight: 15 }} />
            Snow·统一管理中台
          </div>
          <div style={{ marginTop: '15px', fontSize: '20px', opacity: 0.85, fontWeight: 300 }}>
            StarLink Unified Management Platform
          </div>
          <div style={{ marginTop: '30px', fontSize: '16px', opacity: 0.7, maxWidth: '600px', lineHeight: 1.8 }}>
            致力于为全球酒店商户提供安全、高效、智能的一站式数字化管理服务。连接商户与未来，让管理更简单。
          </div>
        </div>
        <div style={{ opacity: 0.6, fontSize: '14px' }}>
          © 2026 StarLink Tech. Build v1.0.0
        </div>
      </div>

      {/* Right Side - 毛玻璃区域 */}
      <div className="login-right">
        <Card bordered={false} className="login-content-card">
          <div className="login-form-header">
            <div className="login-form-title">
              {mode === 'login' ? '欢迎登录' : '创建新账户'}
            </div>
          </div>

          <Form
            form={form}
            name="authForm"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            initialValues={{ role: 'merchant' }}
          >
            <Form.Item
              name="username"
              label={<span style={{color: '#fff'}}>账号</span>}
              rules={[{ required: true, message: '请输入您的账号！' }]}
            >
              <Input prefix={<UserOutlined style={{ color: '#1890ff' }} />} placeholder="请输入账号" />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{color: '#fff'}}>密码</span>}
              rules={[{ required: true, message: '请输入您的密码！' }]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#1890ff' }} />} placeholder="请输入密码" />
            </Form.Item>

            {mode === 'register' && (
              <Form.Item
                name="role"
                label={<span style={{color: '#fff'}}>选择角色</span>}
                rules={[{ required: true, message: '请选择角色！' }]}
                style={{ marginBottom: '30px' }}
              >
                <Radio.Group style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                  <Radio value="merchant">🏢 酒店商户</Radio>
                </Radio.Group>
              </Form.Item>
            )}

            <Form.Item style={{ marginBottom: '20px', marginTop: '40px' }}>
              <Button type="primary" htmlType="submit" block className="login-submit-button">
                {mode === 'login' ? '安全登录' : '立即注册'}
              </Button>
            </Form.Item>

            <div className="login-form-footer">
              {mode === 'login' ? (
                <>
                  <span>
                    还没有账号？
                    <a onClick={toggleMode} style={{ marginLeft: '8px', fontWeight: 'bold' }}>立即注册</a>
                  </span>
                </>
              ) : (
                <>
                  <span></span>
                  <span>
                    已有账号？
                    <a onClick={toggleMode} style={{ marginLeft: '8px', fontWeight: 'bold' }}>返回登录</a>
                  </span>
                </>
              )}
            </div>

          </Form>
        </Card>
      </div>
    </div>
  );
}