import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../auth/auth';
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined, CoffeeOutlined } from "@ant-design/icons";
import { login as apiLogin } from '../../../api';
const { Title, Text } = Typography;
import Swal from 'sweetalert2';

interface LoginValues {
  username: string;
  password_hash: string;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (authContext?.user) {
      navigate('/');
    }
  }, [authContext, navigate]);

  const onFinish = async (values: LoginValues) => {
    setLoading(true);
    try {
      const response = await apiLogin(values);
      if (response.success === true && response.responseObject.token) {
        Swal.fire({
          title: "เข้าสู่ระบบสำเร็จ",
          text: "ยินดีต้อนรับเข้าสู่ระบบ Coffee Shop POS",
          icon: "success",
          confirmButtonColor: '#6F4E37',
        });
        authContext?.login(response.responseObject.token);
        navigate('/');
        message.success(response.message || 'เข้าสู่ระบบสำเร็จ');
      } else {
        Swal.fire({
          title: "เข้าสู่ระบบไม่สำเร็จ",
          text: response.message || 'กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน',
          icon: "error",
          confirmButtonColor: '#6F4E37',
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: error.message || 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง',
          icon: "error",
          confirmButtonColor: '#6F4E37',
        });
      } else {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง',
          icon: "error",
          confirmButtonColor: '#6F4E37',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #6F4E37 0%, #4A3C31 50%, #2D2A26 100%)',
        }}
      >
        {/* Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
          {/* Logo */}
          <div className="mb-8">
            <div
              className="w-32 h-32 rounded-3xl flex items-center justify-center"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <CoffeeOutlined style={{ fontSize: '64px', color: '#D4B896' }} />
            </div>
          </div>

          {/* Brand Text */}
          <h1 className="text-4xl font-bold mb-4 text-center">Coffee Shop POS</h1>
          <p className="text-lg text-center opacity-80 max-w-md leading-relaxed">
            ระบบจัดการร้านกาแฟครบวงจร ง่าย รวดเร็ว และใช้งานสะดวก
          </p>

          {/* Features */}
          <div className="mt-12 space-y-4">
            {[
              'จัดการออเดอร์แบบ Real-time',
              'ติดตามยอดขายและรายได้',
              'บริหารจัดการสต็อกสินค้า',
              'รองรับหลายช่องทางการชำระเงิน',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(212, 184, 150, 0.3)' }}
                >
                  <svg className="w-3 h-3 text-[#D4B896]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm opacity-90">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Circles */}
        <div
          className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full"
          style={{ background: 'rgba(212, 184, 150, 0.1)' }}
        />
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full"
          style={{ background: 'rgba(212, 184, 150, 0.08)' }}
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-coffee-cream">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: 'linear-gradient(135deg, #6F4E37 0%, #4A3C31 100%)',
              }}
            >
              <CoffeeOutlined style={{ fontSize: '40px', color: '#D4B896' }} />
            </div>
            <h2 className="text-xl font-bold text-coffee-espresso">Coffee Shop POS</h2>
          </div>

          {/* Login Card */}
          <div
            className="bg-white rounded-3xl p-8 lg:p-10"
            style={{
              boxShadow: '0 4px 24px rgba(111, 78, 55, 0.08)',
            }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <Title level={2} className="!mb-2 !text-coffee-espresso">
                เข้าสู่ระบบ
              </Title>
              <Text className="text-brand-text-secondary">
                กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
              </Text>
            </div>

            {/* Login Form */}
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
              size="large"
              requiredMark={false}
            >
              <Form.Item
                label={<span className="font-medium text-coffee-dark-roast">ชื่อผู้ใช้</span>}
                name="username"
                rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-coffee-light-roast" />}
                  placeholder="กรอกชื่อผู้ใช้ของคุณ"
                  className="!h-12 !rounded-xl"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-medium text-coffee-dark-roast">รหัสผ่าน</span>}
                name="password"
                rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-coffee-light-roast" />}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  className="!h-12 !rounded-xl"
                  minLength={4}
                />
              </Form.Item>

              <Form.Item className="!mt-8 !mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full !h-12 !rounded-xl !text-base !font-semibold"
                  loading={loading}
                  style={{
                    background: 'linear-gradient(135deg, #6F4E37 0%, #5C4030 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(111, 78, 55, 0.3)',
                  }}
                >
                  {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </Button>
              </Form.Item>
            </Form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-brand-border-light text-center">
              <Text className="text-brand-text-muted text-sm">
                Coffee Shop POS System v1.0
              </Text>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 text-center">
            <Text className="text-brand-text-muted text-xs">
              &copy; 2024 Coffee Shop. All rights reserved.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
