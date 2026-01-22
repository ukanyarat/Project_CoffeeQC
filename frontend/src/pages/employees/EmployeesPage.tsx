import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Typography, message, Spin, Modal, Form, Input, Popconfirm, Select, DatePicker, Row, Col, Space, Tag, Statistic, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, TeamOutlined, IdcardOutlined, SearchOutlined } from '@ant-design/icons';
import { getUsers, createUser, updateUser, deleteUser, getRoles } from '../../api';
import moment from 'moment';

const { Title, Text } = Typography;
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
  password?: string;
  created_at: string;
  updated_at: string;
  role: {
    role_name: string;
  };
}

const EmployeesPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        getUsers(),
        getRoles(),
      ]);

      if (usersResponse.success && usersResponse.responseObject) {
        setUsers(usersResponse.responseObject);
      } else {
        message.error(usersResponse.message || 'ไม่สามารถโหลดข้อมูลพนักงานได้');
      }

      if (rolesResponse.success && rolesResponse.responseObject) {
        setRoles(rolesResponse.responseObject);
      } else {
        message.error(rolesResponse.message || 'ไม่สามารถโหลดข้อมูลตำแหน่งได้');
      }
    } catch (error: any) {
      message.error('เกิดข้อผิดพลาด: ' + error.message);
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
        message.success('ลบพนักงานเรียบร้อยแล้ว!');
        fetchUsersAndRoles();
      } else {
        message.error(response.message || 'ไม่สามารถลบพนักงานได้');
      }
    } catch (error: any) {
      message.error('เกิดข้อผิดพลาด: ' + error.message);
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
        response = await createUser(payload);
      }

      if (response.success) {
        message.success(`${editingUser ? 'แก้ไข' : 'เพิ่ม'}พนักงานเรียบร้อยแล้ว!`);
        setIsModalVisible(false);
        fetchUsersAndRoles();
      } else {
        message.error(response.message || `ไม่สามารถ${editingUser ? 'แก้ไข' : 'เพิ่ม'}พนักงานได้`);
      }
    } catch (error: any) {
      message.error('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const filteredUsers = users.filter(user =>
    user.emp_fname?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.emp_lname?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchText.toLowerCase())
  );

  const getRoleColor = (roleName: string) => {
    const roleColors: { [key: string]: string } = {
      'admin': 'red',
      'manager': 'orange',
      'staff': 'blue',
      'default': 'default'
    };
    return roleColors[roleName?.toLowerCase()] || roleColors['default'];
  };

  const getStatusTag = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('active') || statusLower.includes('working')) {
      return <Tag color="success" className="!rounded-lg !px-3">ทำงาน</Tag>;
    }
    if (statusLower.includes('inactive') || statusLower.includes('resigned')) {
      return <Tag color="default" className="!rounded-lg !px-3">ลาออก</Tag>;
    }
    return <Tag color="blue" className="!rounded-lg !px-3">{status || 'ปกติ'}</Tag>;
  };

  const columns = [
    {
      title: 'พนักงาน',
      key: 'employee_info',
      render: (_: any, record: User) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={44}
            className="bg-coffee-gradient"
            icon={<UserOutlined />}
          />
          <div>
            <Text strong className="text-coffee-espresso block">
              {record.emp_fname} {record.emp_lname}
            </Text>
            <Text type="secondary" className="text-sm">@{record.username}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'เบอร์โทร',
      dataIndex: 'emp_phone',
      key: 'emp_phone',
      width: 140,
      render: (phone: string) => <Text type="secondary">{phone}</Text>,
    },
    {
      title: 'ตำแหน่ง',
      dataIndex: ['role', 'role_name'],
      key: 'role_name',
      width: 120,
      render: (roleName: string) => (
        <Tag color={getRoleColor(roleName)} className="!rounded-lg !px-3 !capitalize">
          {roleName}
        </Tag>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'emp_status',
      key: 'emp_status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'วันที่เริ่มงาน',
      dataIndex: 'emp_start_date',
      key: 'emp_start_date',
      width: 140,
      render: (date: string) => (
        <Text type="secondary">
          {date ? moment(date).format('DD MMM YYYY') : '-'}
        </Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_: any, record: User) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="!rounded-lg !border-blue-400 !text-blue-500 hover:!bg-blue-50"
          />
          <Popconfirm
            title="ยืนยันการลบ?"
            description="คุณต้องการลบพนักงานคนนี้หรือไม่?"
            onConfirm={() => handleDelete(record.id)}
            okText="ใช่"
            cancelText="ไม่"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} danger className="!rounded-lg" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-coffee-cream min-h-screen">
      {/* Header */}
      <Card
        className="!rounded-2xl !shadow-coffee-md !mb-6"
        styles={{ body: { padding: '20px 24px' } }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-coffee-gradient flex items-center justify-center shadow-coffee-md">
                <IdcardOutlined className="text-2xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-0 !text-coffee-espresso">
                  จัดการข้อมูลพนักงาน
                </Title>
                <Text className="text-brand-text-secondary">
                  บริหารจัดการพนักงานและผู้ใช้ระบบ
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
              เพิ่มพนักงานใหม่
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card stat-card-purple">
            <Statistic
              title={<span className="text-white/80 text-sm">พนักงานทั้งหมด</span>}
              value={users.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
              suffix="คน"
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card stat-card-coffee">
            <Statistic
              title={<span className="text-white/80 text-sm">Admin</span>}
              value={users.filter(u => u.role?.role_name?.toLowerCase() === 'admin').length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
              suffix="คน"
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card stat-card-warning">
            <Statistic
              title={<span className="text-white/80 text-sm">Manager</span>}
              value={users.filter(u => u.role?.role_name?.toLowerCase() === 'manager').length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
              suffix="คน"
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card stat-card-info">
            <Statistic
              title={<span className="text-white/80 text-sm">Staff</span>}
              value={users.filter(u => u.role?.role_name?.toLowerCase() === 'staff').length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
              suffix="คน"
            />
          </div>
        </Col>
      </Row>

      {/* Table */}
      <Card
        className="!rounded-2xl !shadow-coffee-md"
        styles={{ body: { padding: '24px' } }}
      >
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <UserOutlined className="text-lg text-white" />
            </div>
            <Title level={4} className="!mb-0 !text-coffee-espresso">
              รายชื่อพนักงาน
            </Title>
          </div>
          <Input
            placeholder="ค้นหาชื่อหรือ username..."
            prefix={<SearchOutlined className="text-brand-text-muted" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="!w-64 !rounded-xl"
            size="large"
            allowClear
          />
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `ทั้งหมด ${total} รายการ`,
              className: 'mt-4'
            }}
            className="coffee-table"
          />
        </Spin>
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-brand-border-light">
            <div className="w-10 h-10 rounded-xl bg-coffee-gradient flex items-center justify-center">
              <UserOutlined className="text-lg text-white" />
            </div>
            <span className="text-lg font-semibold text-coffee-espresso">
              {editingUser ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'}
            </span>
          </div>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText={editingUser ? 'บันทึก' : 'เพิ่มพนักงาน'}
        cancelText="ยกเลิก"
        width={600}
      >
        <Form form={form} layout="vertical" name="employee_form" className="mt-6">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="emp_fname"
                label={<span className="font-medium text-coffee-dark-roast">ชื่อจริง</span>}
                rules={[{ required: true, message: 'กรุณากรอกชื่อจริง' }]}
              >
                <Input placeholder="กรุณาใส่ชื่อจริง" size="large" className="!rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="emp_lname"
                label={<span className="font-medium text-coffee-dark-roast">นามสกุล</span>}
                rules={[{ required: true, message: 'กรุณากรอกนามสกุล' }]}
              >
                <Input placeholder="กรุณาใส่นามสกุล" size="large" className="!rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="emp_phone"
                label={<span className="font-medium text-coffee-dark-roast">เบอร์โทร</span>}
                rules={[{ required: true, message: 'กรุณากรอกเบอร์โทร' }]}
              >
                <Input placeholder="กรุณาใส่เบอร์โทร" size="large" className="!rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role_id"
                label={<span className="font-medium text-coffee-dark-roast">ตำแหน่ง</span>}
                rules={[{ required: true, message: 'กรุณาเลือกตำแหน่ง' }]}
              >
                <Select placeholder="กรุณาเลือกตำแหน่ง" size="large" className="!rounded-xl">
                  {roles.map(role => (
                    <Option key={role.id} value={role.id}>
                      {role.role_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="username"
                label={<span className="font-medium text-coffee-dark-roast">ชื่อผู้ใช้</span>}
                rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
              >
                <Input placeholder="กรุณาใส่ชื่อผู้ใช้" size="large" className="!rounded-xl" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label={<span className="font-medium text-coffee-dark-roast">รหัสผ่าน</span>}
                rules={[{ required: !editingUser, message: 'กรุณากรอกรหัสผ่าน' }]}
              >
                <Input.Password
                  placeholder={editingUser ? 'เว้นว่างไว้เพื่อใช้รหัสผ่านปัจจุบัน' : 'กรุณาใส่รหัสผ่าน'}
                  size="large"
                  className="!rounded-xl"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="emp_status"
                label={<span className="font-medium text-coffee-dark-roast">สถานะ</span>}
              >
                <Select placeholder="กรุณาเลือกสถานะ" size="large" allowClear className="!rounded-xl">
                  <Option value="active">ทำงาน</Option>
                  <Option value="inactive">ลาออก</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="emp_start_date"
                label={<span className="font-medium text-coffee-dark-roast">วันที่เริ่มงาน</span>}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  placeholder="เลือกวันที่เริ่มงาน"
                  size="large"
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

export default EmployeesPage;
