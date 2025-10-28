import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../auth/AuthContext';
import { Form, Input, Button, Typography, ConfigProvider, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { login as apiLogin } from '../../../api';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (authContext?.user) {
      navigate('/');
    }
  }, [authContext, navigate]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await apiLogin(values);
      if (response.success === true && response.responseObject.user) {
        authContext?.login(response.responseObject.user);
        navigate('/');
        message.success(response.message || 'Login successful!');
      } else {
        message.error(response.message || 'Login failed. Please try again.');
      }
    } catch (error: any) {
      message.error(error.message || 'An error occurred during login.');
    }
    setLoading(false);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#FF8A65',
        },
      }}
    >
      <div
        className="relative min-h-screen overflow-hidden flex items-center justify-center p-4"
        style={{
          background: '#FDF5E6',
        }}
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              เข้าสู่ระบบ
            </h1>
            <p className="text-gray-500">
              กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
            </p>
          </div>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              label={<span className="text-gray-700">ชื่อผู้ใช้</span>}
              name="username"
              rules={[{ required: true, message: 'Please input your Username!' }]}
            >
              <Input
                prefix={
                  <UserOutlined className="site-form-item-icon" />
                }
                placeholder="Username"
                size="large"
              />
            </Form.Item>
            <Form.Item
              label={<span className="text-gray-700">รหัสผ่าน</span>}
              name="password"
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input.Password
                prefix={
                  <LockOutlined className="site-form-item-icon" />
                }
                placeholder="Password"
                size="large"
              />
            </Form.Item>
            <Form.Item className="mt-6">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full text-white font-semibold py-2 rounded-lg transition duration-300"
                size="large"
                loading={loading}
              >
                เข้าสู่ระบบ
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default LoginPage;