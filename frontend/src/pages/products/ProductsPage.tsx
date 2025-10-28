import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Button, Typography, message, Spin, Modal, Form, Input, InputNumber, Select, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getMenus, getCategories, createMenu, updateMenu, deleteMenu } from '../../api';

const { Title, Text } = Typography;

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
      const response = await deleteMenu(id);
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
      if (editingMenu) {
        response = await updateMenu({ ...values, id: editingMenu.id });
      } else {
        response = await createMenu(values);
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

  return (
    <Card>
      {contextHolder}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3}>Products Management</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add New Product
          </Button>
        </Col>
      </Row>

      <Spin spinning={loading}>
        {categories.map(category => {
          const categoryMenus = menus.filter(menu => menu.category_id === category.id);
          if (categoryMenus.length === 0) return null; // Don't show category if no menus

          return (
            <div key={category.id} style={{ marginBottom: 24 }}>
              <Title level={4}>{category.category_name}</Title>
              <Row gutter={[16, 16]}>
                {categoryMenus.map(menu => (
                  <Col key={menu.id} xs={24} sm={12} md={8} lg={6}>
                    <Card
                      hoverable
                      actions={[
                        <EditOutlined key="edit" onClick={() => handleEdit(menu)} />,
                        <Popconfirm
                          title="Are you sure to delete this menu item?"
                          onConfirm={() => handleDelete(menu.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <DeleteOutlined key="delete" />
                        </Popconfirm>,
                      ]}
                    >
                      <Card.Meta
                        title={<Text strong>{menu.name}</Text>}
                        description={
                          <>
                            <Text type="secondary">Category: {categories.find(cat => cat.id === menu.category_id)?.category_name}</Text><br />
                            <Text type="secondary">Type: {menu.type}</Text><br />
                            <Text type="secondary">Price: {Number(menu.price).toFixed(2)} THB</Text><br />
                            {menu.stock !== undefined && <Text type="secondary">Stock: {menu.stock}</Text>}
                          </>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          );
        })}
      </Spin>

      <Modal
        title={editingMenu ? 'Edit Product' : 'Add New Product'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" name="menu_form">
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please input the product name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category_id"
            label="Category"
            rules={[{ required: true, message: 'Please select a category!' }]}
          >
            <Select placeholder="Select a category">
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please input the product type!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please input the price!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} formatter={value => `${value} THB`} parser={value => value ? parseFloat(value.replace(' THB', '')) : 0} />
          </Form.Item>
          <Form.Item
            name="stock"
            label="Stock"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ProductsPage;