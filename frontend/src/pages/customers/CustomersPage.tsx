import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Typography, message, Spin, Modal, Form, Input, Popconfirm, Row, Col, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../api';

const { Title } = Typography;

interface Customer {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_status: string;
  created_at: string;
  updated_at: string;
}

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await getCustomers(); // Assuming getCustomers fetches all without pagination for now
      if (response.success && response.responseObject) {
        setCustomers(response.responseObject);
      } else {
        message.error(response.message || 'Failed to fetch customers.');
      }
    } catch (error: any) {
      message.error('Error fetching customers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAdd = () => {
    setEditingCustomer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue(customer);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteCustomer(id);
      if (response.success) {
        message.success('Customer deleted successfully!');
        fetchCustomers();
      } else {
        message.error(response.message || 'Failed to delete customer.');
      }
    } catch (error: any) {
      message.error('Error deleting customer: ' + error.message);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      let response;
      if (editingCustomer) {
        response = await updateCustomer({ ...values, id: editingCustomer.id });
      } else {
        response = await createCustomer(values);
      }

      if (response.success) {
        message.success(`Customer ${editingCustomer ? 'updated' : 'created'} successfully!`);
        setIsModalVisible(false);
        fetchCustomers();
      } else {
        message.error(response.message || `Failed to ${editingCustomer ? 'update' : 'create'} customer.`);
      }
    } catch (error: any) {
      message.error('Error saving customer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Phone',
      dataIndex: 'customer_phone',
      key: 'customer_phone',
    },
    {
      title: 'Status',
      dataIndex: 'customer_status',
      key: 'customer_status',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: any, record: Customer) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Are you sure to delete this customer?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3}>Customers Management</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add New Customer
          </Button>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Table columns={columns} dataSource={customers} rowKey="id" pagination={{ pageSize: 10 }} />
      </Spin>

      <Modal
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" name="customer_form">
          <Form.Item
            name="customer_name"
            label="Customer Name"
            rules={[{ required: true, message: 'Please input the customer name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="customer_phone"
            label="Customer Phone"
            rules={[{ required: true, message: 'Please input the customer phone!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="customer_status"
            label="Customer Status"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CustomersPage;