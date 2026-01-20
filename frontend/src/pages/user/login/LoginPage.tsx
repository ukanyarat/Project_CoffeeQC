import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../auth/auth';
import { Form, Input, Button, Typography, message, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
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
          title: "Login successful!",
          text: "เข้าสู่ระบบ สำเร็จ",
          icon: "success"
        });
        authContext?.login(response.responseObject.token);
        navigate('/');
        message.success(response.message || 'Login successful!');
      } else {
        Swal.fire({
          title: "Login Failed!",
          text: response.message || 'Login failed. Please try again.',
          icon: "error"
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        Swal.fire({
          title: "Login Error!",
          text: error.message || 'An error occurred during login.',
          icon: "error"
        });
      } else {
        Swal.fire({
          title: "Login Error!",
          text: 'An error occurred during login.',
          icon: "error"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-bg-layout p-4">
      <Card className="w-full max-w-md shadow-xl" style={{ borderRadius: '12px' }}>
        <div className="text-center mb-8">
          <img src="/images/logofront.jpg" alt="CoffeeQC Logo" className="w-24 h-24 mx-auto mb-4 rounded-full shadow-md" />
          <Title level={2} className="text-brand-text-primary">
            Welcome Back!
          </Title>
          <Text className="text-gray-500">
            Sign in to your CoffeeQC account
          </Text>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
            />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
              minLength={4}
            />
          </Form.Item>
          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={loading}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
