import React, { useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";

const { Text } = Typography;

const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values: any) => {
    setLoading(true);
    console.log("Form values:", values);
    // simulate async
    setTimeout(() => {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "ไม่พบผู้ใช้",
        text: "ไม่พบบัญชีผู้ใช้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่านอีกครั้ง",
      });
    }, 900);
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center p-4"
      style={{
        backgroundImage: `url('/images/logofront.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >

      <div className="rounded-2xl border border-pastel-primary/40 bg-white/50 p-6 shadow-xl backdrop-blur-md md:p-8 dark:border-white/10 dark:bg-gray-900/60">
        {" "}
        <div className="text-center mb-8">
          {" "}
          {/* Logo Placeholder */}{" "}
          <h1 className="text-3xl font-bold text-pastel-text mb-2">
            เข้าสู่ระบบ
          </h1>{" "}
          <p className="text-pastel-text text-opacity-75">
            กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
          </p>{" "}
        </div>{" "}
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          {" "}
          <Form.Item
            label={<span className="text-pastel-text">ชื่อผู้ใช้</span>}
            name="username"
          >
            {" "}
            <Input
              prefix={
                <UserOutlined className="site-form-item-icon text-pastel-primary" />
              }
              placeholder="ชื่อผู้ใช้"
              size="large"
              className="border-pastel-primary focus:border-pastel-primary-dark"
            />{" "}
          </Form.Item>{" "}
          <Form.Item
            label={<span className="text-pastel-text">รหัสผ่าน</span>}
            name="password"
          >
            {" "}
            <Input.Password
              prefix={
                <LockOutlined className="site-form-item-icon text-pastel-primary" />
              }
              placeholder="รหัสผ่าน"
              size="large"
              className="border-pastel-primary focus:border-pastel-primary-dark"
            />{" "}
          </Form.Item>{" "}
          <Form.Item className="mt-6">
            {" "}
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-pastel-primary hover:bg-pastel-primary-dark border-none text-white font-semibold py-2 rounded-lg transition duration-300"
              size="large"
            >
              {" "}
              เข้าสู่ระบบ{" "}
            </Button>{" "}
          </Form.Item>{" "}
        </Form>{" "}
      </div>{" "}
    </div>
  );
};
export default HomePage;
