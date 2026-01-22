import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Button, Typography, message, Spin, Modal, Form, Input, InputNumber, Select, Popconfirm, Tabs, Tag, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CoffeeOutlined, ShopOutlined } from '@ant-design/icons';
import { getMenus, getCategories, createMenu, updateMenu } from '../../api';

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
  description?: string;
  image_url?: string;
  price: number;
  stock?: number;
  category_id: string;
  type: string;
  status?: string;
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
        messageApi.error(menusResponse.message || 'ไม่สามารถโหลดข้อมูลเมนูได้');
      }

      if (categoriesResponse.success && categoriesResponse.responseObject) {
        setCategories(categoriesResponse.responseObject);
      } else {
        messageApi.error(categoriesResponse.message || 'ไม่สามารถโหลดข้อมูลหมวดหมู่ได้');
      }
    } catch (error: any) {
      messageApi.error('เกิดข้อผิดพลาด: ' + error.message);
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
    form.setFieldsValue({ stock: undefined });
    setIsModalVisible(true);
  };

  const handleEdit = (menu: MenuItem) => {
    setEditingMenu(menu);
    form.setFieldsValue(menu);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await updateMenu({ id, status: 'deleted' });
      if (response.success) {
        messageApi.success('ลบสินค้าเรียบร้อยแล้ว!');
        fetchMenusAndCategories();
      } else {
        messageApi.error(response.message || 'ไม่สามารถลบสินค้าได้');
      }
    } catch (error: any) {
      messageApi.error('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      let response;

      const payload = {
        ...values,
        status: values.status || 'available',
      };

      if (editingMenu) {
        response = await updateMenu({ ...payload, id: editingMenu.id });
      } else {
        response = await createMenu(payload);
      }

      if (response.success) {
        messageApi.success(`${editingMenu ? 'แก้ไข' : 'เพิ่ม'}สินค้าเรียบร้อยแล้ว!`);
        setIsModalVisible(false);
        fetchMenusAndCategories();
      } else {
        messageApi.error(response.message || `ไม่สามารถ${editingMenu ? 'แก้ไข' : 'เพิ่ม'}สินค้าได้`);
      }
    } catch (error: any) {
      messageApi.error('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'HOT': 'red',
      'COLD': 'blue',
      'FRAPPE': 'green',
      'default': 'default'
    };
    return colors[type?.toUpperCase()] || colors['default'];
  };

  return (
    <div className="p-4 md:p-6 bg-coffee-cream min-h-screen">
      {contextHolder}

      {/* Header */}
      <Card
        className="!rounded-2xl !shadow-coffee-md !mb-6"
        styles={{ body: { padding: '20px 24px' } }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-coffee-gradient flex items-center justify-center shadow-coffee-md">
                <ShopOutlined className="text-2xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-0 !text-coffee-espresso">
                  จัดการสินค้า
                </Title>
                <Text className="text-brand-text-secondary">
                  จัดการเมนูและสินค้าในร้าน
                </Text>
              </div>
            </div>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              className="!rounded-xl !h-12 !px-6"
            >
              เพิ่มสินค้าใหม่
            </Button>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        <Card
          className="!rounded-2xl !shadow-coffee-md"
          styles={{ body: { padding: '16px 24px 24px' } }}
        >
          <Tabs
            defaultActiveKey={categories[0]?.id}
            size="large"
            items={categories.map(category => {
              const categoryMenus = menus.filter(menu => menu.category_id === category.id && menu.status !== 'deleted');
              return {
                key: category.id,
                label: (
                  <span className="font-medium px-2">
                    {category.category_name}
                    <span className="text-brand-text-muted ml-2">({categoryMenus.length})</span>
                  </span>
                ),
                children: categoryMenus.length === 0 ? (
                  <Empty
                    description="ยังไม่มีสินค้าในหมวดนี้"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="py-16"
                  >
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="!rounded-xl">
                      เพิ่มสินค้าแรก
                    </Button>
                  </Empty>
                ) : (
                  <Row gutter={[20, 20]} className="mt-4">
                    {categoryMenus.map(menu => (
                      <Col key={menu.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                          hoverable
                          className="!rounded-2xl !overflow-hidden !border-2 !border-transparent hover:!border-coffee-medium-roast transition-all duration-300"
                          styles={{
                            body: { padding: '16px' },
                            actions: { borderTop: '1px solid #E8E2D9' }
                          }}
                          actions={[
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              onClick={() => handleEdit(menu)}
                              className="!text-blue-500 hover:!text-blue-600"
                            >
                              แก้ไข
                            </Button>,
                            <Popconfirm
                              title="ยืนยันการลบ?"
                              description="คุณต้องการลบสินค้านี้หรือไม่?"
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
                          <div className="mb-3">
                            {menu.type && (
                              <Tag color={getTypeColor(menu.type)} className="!rounded-md !mb-2">
                                {menu.type}
                              </Tag>
                            )}
                            <h3 className="text-lg font-semibold text-coffee-espresso line-clamp-2 min-h-[56px]">
                              {menu.name}
                            </h3>
                          </div>
                          {menu.description && (
                            <Text type="secondary" className="text-sm line-clamp-2 block mb-3">
                              {menu.description}
                            </Text>
                          )}
                          <div className="flex justify-between items-center pt-3 border-t border-brand-border-light">
                            <Text strong className="text-xl text-coffee-medium-roast">
                              ฿{Number(menu.price).toFixed(0)}
                            </Text>
                            {menu.stock !== undefined && (
                              <Tag color={menu.stock > 10 ? 'success' : menu.stock > 0 ? 'warning' : 'error'} className="!rounded-md">
                                คงเหลือ: {menu.stock}
                              </Tag>
                            )}
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )
              };
            })}
          />
        </Card>
      </Spin>

      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-brand-border-light">
            <div className="w-10 h-10 rounded-xl bg-coffee-gradient flex items-center justify-center">
              <CoffeeOutlined className="text-lg text-white" />
            </div>
            <span className="text-lg font-semibold text-coffee-espresso">
              {editingMenu ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
            </span>
          </div>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={600}
        okText={editingMenu ? 'บันทึก' : 'เพิ่มสินค้า'}
        cancelText="ยกเลิก"
        className="coffee-modal"
      >
        <Form form={form} layout="vertical" name="menu_form" className="mt-6">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label={<span className="font-medium text-coffee-dark-roast">ชื่อสินค้า</span>}
                rules={[{ required: true, message: 'กรุณากรอกชื่อสินค้า' }]}
              >
                <Input placeholder="เช่น Espresso, Cappuccino" size="large" className="!rounded-xl" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="description"
                label={<span className="font-medium text-coffee-dark-roast">รายละเอียด</span>}
              >
                <TextArea rows={3} placeholder="รายละเอียดสินค้า (ไม่บังคับ)" className="!rounded-xl" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="category_id"
                label={<span className="font-medium text-coffee-dark-roast">หมวดหมู่</span>}
                rules={[{ required: true, message: 'กรุณาเลือกหมวดหมู่' }]}
              >
                <Select placeholder="เลือกหมวดหมู่" size="large" className="!rounded-xl">
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.id}>{cat.category_name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="type"
                label={<span className="font-medium text-coffee-dark-roast">ประเภท</span>}
              >
                <Select placeholder="เลือกประเภท" size="large" allowClear className="!rounded-xl">
                  <Option value="HOT">HOT (ร้อน)</Option>
                  <Option value="COLD">COLD (เย็น)</Option>
                  <Option value="FRAPPE">FRAPPE (ปั่น)</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="price"
                label={<span className="font-medium text-coffee-dark-roast">ราคา (บาท)</span>}
                rules={[{ required: true, message: 'กรุณากรอกราคา' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="0.00"
                  precision={2}
                  prefix="฿"
                  className="!rounded-xl"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="stock"
                label={<span className="font-medium text-coffee-dark-roast">จำนวนคงเหลือ</span>}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  size="large"
                  placeholder="ไม่ระบุ"
                  className="!rounded-xl"
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
