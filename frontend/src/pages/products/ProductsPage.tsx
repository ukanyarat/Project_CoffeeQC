import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Button, Typography, message, Spin, Modal, Form, Input, InputNumber, Select, Popconfirm, Tabs, Badge, Tag, Space, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CoffeeOutlined } from '@ant-design/icons';
import { getMenus, getCategories, createMenu, updateMenu, deleteMenu } from '../../api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Category {
  id: string;
  category_name: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string; // Assuming description might be part of the menu item, though not in current model
  image_url?: string; // Assuming image_url might be part of the menu item
  price: number;
  stock?: number;
  category_id: string;
  type: string;
  status?: string; // Assuming status might be part of the menu item
}

const ProductsPage: React.FC = () => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const fetchMenusAndCategories = async () => {
    setLoading(true);
    try {
      const [menusResponse, categoriesResponse] = await Promise.all([
        getMenus(),
        getCategories(),
      ]);

      if (menusResponse.success && menusResponse.responseObject) {
        setMenus(menusResponse.responseObject);
      } else {
        messageApi.error(menusResponse.message || 'Failed to fetch menus.');
      }

      if (categoriesResponse.success && categoriesResponse.responseObject) {
        setCategories(categoriesResponse.responseObject);
      } else {
        messageApi.error(categoriesResponse.message || 'Failed to fetch categories.');
      }
    } catch (error: any) {
      messageApi.error('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenusAndCategories();
  }, []);

  const handleAdd = () => {
    setEditingMenu(null);
    form.resetFields();
    form.setFieldsValue({ stock: undefined }); // Explicitly clear stock
    setIsModalVisible(true);
  };

  const handleEdit = (menu: MenuItem) => {
    setEditingMenu(menu);
    form.setFieldsValue(menu);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await updateMenu({ id, status: 'deleted' }); // Perform soft delete
      if (response.success) {
        messageApi.success('Menu item deleted successfully!');
        fetchMenusAndCategories();
      } else {
        console.error('Backend Error Response:', response);
        messageApi.error(response.message || 'Failed to delete menu item.');
      }
    } catch (error: any) {
      console.error('Frontend Catch Error:', error);
      messageApi.error('Error deleting menu item: ' + error.message);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      let response;

      const payload = {
        ...values,
        status: values.status || 'available', // Default to 'available' if not provided
      };

      if (editingMenu) {
        response = await updateMenu({ ...payload, id: editingMenu.id });
      } else {
        response = await createMenu(payload);
      }

      if (response.success) {
        messageApi.success(`Menu item ${editingMenu ? 'updated' : 'created'} successfully!`);
        setIsModalVisible(false);
        fetchMenusAndCategories();
      } else {
        console.error('Backend Error Response:', response);
        messageApi.error(response.message || `Failed to ${editingMenu ? 'update' : 'create'} menu item.`);
      }
    } catch (error: any) {
      console.error('Frontend Catch Error:', error);
      messageApi.error('Error saving menu item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'HOT': '#ff4d4f',
      'COLD': '#1890ff',
      'FRAPPE': '#52c41a',
      'default': '#8c8c8c'
    };
    return colors[type.toUpperCase()] || colors['default'];
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {contextHolder}
      <Card
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: '12px',
          marginBottom: '24px'
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center">
              <CoffeeOutlined style={{ fontSize: '32px', color: '#8B4513' }} />
              <div>
                <Title level={2} style={{ margin: 0, color: '#262626' }}>จัดการเมนูและสินค้าในร้าน</Title>
                <Text type="secondary">จัดการเมนูและสินค้าในร้าน</Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{
                borderRadius: '8px',
                height: '48px',
                paddingLeft: '24px',
                paddingRight: '24px',
                background: '#8B4513',
                borderColor: '#8B4513'
              }}
            >
              เพิ่มสินค้าใหม่
            </Button>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        <Tabs
          defaultActiveKey={categories[0]?.id}
          size="large"
          style={{
            background: 'white',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
        >
          {categories.map(category => {
            const categoryMenus = menus.filter(menu => menu.category_id === category.id && menu.status !== 'deleted');
            return (
              <Tabs.TabPane
                tab={
                  // <Badge count={categoryMenus.length} offset={[10, 0]} showZero>
                    <span style={{ fontSize: '16px', padding: '0 8px' }}>
                      {category.category_name} <span style={{color:'gray'}}>({categoryMenus.length})</span>
                    </span>
                  // </Badge>
                }
                key={category.id}
              >
                {categoryMenus.length === 0 ? (
                  <Empty
                    description="ยังไม่มีสินค้าในหมวดนี้"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ padding: '60px 0' }}
                  >
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                      เพิ่มสินค้าแรก
                    </Button>
                  </Empty>
                ) : (
                  <Row gutter={[24, 24]} style={{ marginTop: '16px' }}>
                    {categoryMenus.map(menu => (
                      <Col key={menu.id} xs={24} sm={12} md={8} lg={6}>
                        {/* <Badge.Ribbon
                          text={menu.type || 'สินค้า'}
                          color={getTypeColor(menu.type || '')}
                        > */}
                          <Card
                            hoverable
                            style={{
                              borderRadius: '12px',
                              overflow: 'hidden',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                              transition: 'all 0.3s ease',
                              minHeight: '200px'
                            }}
                            actions={[
                              <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleEdit(menu)}
                                style={{ color: '#1890ff' }}
                              >
                                แก้ไข
                              </Button>,
                              <Popconfirm
                                title="ยืนยันการลบ?"
                                description="คุณต้องการลบเมนูนี้หรือไม่?"
                                onConfirm={() => handleDelete(menu.id)}
                                okText="ใช่"
                                cancelText="ไม่"
                                okButtonProps={{ danger: true }}
                              >
                                <Button
                                  type="text"
                                  icon={<DeleteOutlined />}
                                  danger
                                >
                                  ลบ
                                </Button>
                              </Popconfirm>,
                            ]}
                          >
                            <Card.Meta
                              title={
                                <div style={{
                                  fontSize: '18px',
                                  fontWeight: 600,
                                  marginBottom: '12px',
                                  color: '#262626'
                                }}>
                                  {menu.name}
                                </div>
                              }
                              description={
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                  {menu.description && (
                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                      {menu.description}
                                    </Text>
                                  )}
                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '8px',
                                    paddingTop: '12px',
                                    borderTop: '1px solid #f0f0f0'
                                  }}>
                                    <Text strong style={{ fontSize: '20px', color: '#8B4513' }}>
                                      ฿{Number(menu.price).toFixed(2)}
                                    </Text>
                                    {menu.stock !== undefined && (
                                      <Tag color={menu.stock > 10 ? 'success' : menu.stock > 0 ? 'warning' : 'error'}>
                                        คงเหลือ: {menu.stock}
                                      </Tag>
                                    )}
                                  </div>
                                </Space>
                              }
                            />
                          </Card>
                        {/* </Badge.Ribbon> */}
                      </Col>
                    ))}
                  </Row>
                )}
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </Spin>

      <Modal
        title={
          <Space>
            <span>{editingMenu ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</span>
          </Space>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={600}
        okText={editingMenu ? 'บันทึก' : 'เพิ่มสินค้า'}
        cancelText="ยกเลิก"
        okButtonProps={{
          style: { background: '#8B4513', borderColor: '#8B4513' }
        }}
      >
        <Form form={form} layout="vertical" name="menu_form">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="ชื่อสินค้า"
                rules={[{ required: true, message: 'กรุณากรอกชื่อสินค้า!' }]}
              >
                <Input
                  placeholder="เช่น Espresso, Cappuccino"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="description"
                label="รายละเอียด"
              >
                <TextArea
                  rows={3}
                  placeholder="รายละเอียดสินค้า (ไม่บังคับ)"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="category_id"
                label="หมวดหมู่"
                rules={[{ required: true, message: 'กรุณาเลือกหมวดหมู่!' }]}
              >
                <Select
                  placeholder="เลือกหมวดหมู่"
                  size="large"
                >
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="type"
                label="ประเภท"
              >
                <Select
                  placeholder="เลือกประเภท"
                  size="large"
                  allowClear
                >
                  <Option value="HOT">HOT (ร้อน)</Option>
                  <Option value="COLD">COLD (เย็น)</Option>
                  <Option value="FRAPPE">FRAPPE (ปั่น)</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="price"
                label="ราคา (บาท)"
                rules={[{ required: true, message: 'กรุณากรอกราคา!' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="0.00"
                  precision={2}
                  prefix="฿"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="stock"
                label="จำนวนคงเหลือ"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="ไม่ระบุ"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
