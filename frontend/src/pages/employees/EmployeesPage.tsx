import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Typography, message, Spin, Modal, Form, Input, Popconfirm, Select, DatePicker, Row, Col, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getUsers, createUser, updateUser, deleteUser, getRoles } from '../../api';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

interface Role {
  id: string;
  role_name: string;
}

interface User {
  id: string;
  emp_fname: string;
  emp_lname: string;
  emp_phone: string;
  emp_start_date?: string;
  emp_status?: string;
  role_id: string;
  username: string;
  password?: string; // Password is only for creation/update, not fetched
  created_at: string;
  updated_at: string;
  role: { // Assuming role details are nested
    role_name: string;
  };
}

const EmployeesPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        getUsers(), // Assuming getUsers fetches all without pagination for now
        getRoles(), // Need to implement getRoles API
      ]);

      if (usersResponse.success && usersResponse.responseObject) {
        setUsers(usersResponse.responseObject);
      } else {
        message.error(usersResponse.message || 'Failed to fetch employees.');
      }

      if (rolesResponse.success && rolesResponse.responseObject) {
        setRoles(rolesResponse.responseObject);
      } else {
        message.error(rolesResponse.message || 'Failed to fetch roles.');
      }
    } catch (error: any) {
      message.error('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      emp_start_date: user.emp_start_date ? moment(user.emp_start_date) : null,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteUser(id);
      if (response.success) {
        message.success('Employee deleted successfully!');
        fetchUsersAndRoles();
      } else {
        message.error(response.message || 'Failed to delete employee.');
      }
    } catch (error: any) {
      message.error('Error deleting employee: ' + error.message);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      let response;

      const payload = {
        ...values,
        emp_start_date: values.emp_start_date ? values.emp_start_date.format('YYYY-MM-DD') : null,
      };

      if (editingUser) {
        response = await updateUser({ ...payload, id: editingUser.id });
      } else {
        response = await createUser(payload); // createUser is /user/register
      }

      if (response.success) {
        message.success(`Employee ${editingUser ? 'updated' : 'created'} successfully!`);
        setIsModalVisible(false);
        fetchUsersAndRoles();
      } else {
        message.error(response.message || `Failed to ${editingUser ? 'update' : 'create'} employee.`);
      }
    } catch (error: any) {
      message.error('Error saving employee: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: 'First Name',
      dataIndex: 'emp_fname',
      key: 'emp_fname',
    },
    {
      title: 'Last Name',
      dataIndex: 'emp_lname',
      key: 'emp_lname',
    },
    {
      title: 'Phone',
      dataIndex: 'emp_phone',
      key: 'emp_phone',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Role',
      dataIndex: ['role', 'role_name'],
      key: 'role_name',
    },
    {
      title: 'Status',
      dataIndex: 'emp_status',
      key: 'emp_status',
    },
    {
      title: 'Start Date',
      dataIndex: 'emp_start_date',
      key: 'emp_start_date',
      render: (date: string) => date ? moment(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: any, record: User) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Are you sure to delete this employee?"
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
          <Title level={3}>Employees Management</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add New Employee
          </Button>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Table columns={columns} dataSource={users} rowKey="id" pagination={{ pageSize: 10 }} />
      </Spin>

      <Modal
        title={editingUser ? 'Edit Employee' : 'Add New Employee'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" name="employee_form">
          <Form.Item
            name="emp_fname"
            label="First Name"
            rules={[{ required: true, message: 'Please input the first name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="emp_lname"
            label="Last Name"
            rules={[{ required: true, message: 'Please input the last name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="emp_phone"
            label="Phone"
            rules={[{ required: true, message: 'Please input the phone number!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input the username!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: !editingUser, message: 'Please input the password!' }]}
          >
            <Input.Password placeholder={editingUser ? 'Leave blank to keep current password' : ''} />
          </Form.Item>
          <Form.Item
            name="role_id"
            label="Role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select placeholder="Select a role">
              {roles.map(role => (
                <Option key={role.id} value={role.id}>
                  {role.role_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="emp_status"
            label="Status"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="emp_start_date"
            label="Start Date"
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default EmployeesPage;