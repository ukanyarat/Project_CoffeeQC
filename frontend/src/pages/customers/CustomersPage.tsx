import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Typography, message, Spin, Modal, Form, Input, Popconfirm, Row, Col, Space, Statistic, Tag, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, UserOutlined, PhoneOutlined, SearchOutlined } from '@ant-design/icons';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../api';

const { Title, Text } = Typography;

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
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await getCustomers();
      if (response.success && response.responseObject) {
        setCustomers(response.responseObject);
      } else {
        message.error(response.message || 'ไม่สามารถโหลดข้อมูลลูกค้าได้');
      }
    } catch (error: any) {
      message.error('เกิดข้อผิดพลาด: ' + error.message);
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
        message.success('ลบข้อมูลลูกค้าเรียบร้อยแล้ว!');
        fetchCustomers();
      } else {
        message.error(response.message || 'ไม่สามารถลบข้อมูลลูกค้าได้');
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
      if (editingCustomer) {
        response = await updateCustomer({ ...values, id: editingCustomer.id });
      } else {
        response = await createCustomer(values);
      }

      if (response.success) {
        message.success(`${editingCustomer ? 'แก้ไข' : 'เพิ่ม'}ข้อมูลลูกค้าเรียบร้อยแล้ว!`);
        setIsModalVisible(false);
        fetchCustomers();
      } else {
        message.error(response.message || `ไม่สามารถ${editingCustomer ? 'แก้ไข' : 'เพิ่ม'}ข้อมูลลูกค้าได้`);
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

  const filteredCustomers = customers.filter(customer =>
    customer.customer_name.toLowerCase().includes(searchText.toLowerCase()) ||
    customer.customer_phone.includes(searchText)
  );

  const getStatusTag = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('active') || statusLower.includes('member')) {
      return <Tag color="success" className="!rounded-lg !px-3">สมาชิก</Tag>;
    }
    if (statusLower.includes('inactive')) {
      return <Tag color="default" className="!rounded-lg !px-3">ไม่ใช้งาน</Tag>;
    }
    return <Tag color="blue" className="!rounded-lg !px-3">{status || 'ทั่วไป'}</Tag>;
  };

  const columns = [
    {
      title: 'ลูกค้า',
      key: 'customer_info',
      render: (_: any, record: Customer) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={44}
            className="bg-coffee-gradient"
            icon={<UserOutlined />}
          />
          <div>
            <Text strong className="text-coffee-espresso block">{record.customer_name}</Text>
            <Space size="small" className="mt-1">
              <PhoneOutlined className="text-brand-text-muted text-xs" />
              <Text type="secondary" className="text-sm">{record.customer_phone}</Text>
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'customer_status',
      key: 'customer_status',
      width: 120,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'วันที่ลงทะเบียน',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text: string) => (
        <Text type="secondary">{new Date(text).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}</Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_: any, record: Customer) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="!rounded-lg !border-blue-400 !text-blue-500 hover:!bg-blue-50"
          />
          <Popconfirm
            title="ยืนยันการลบ?"
            description="คุณต้องการลบข้อมูลลูกค้ารายนี้หรือไม่?"
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
                <TeamOutlined className="text-2xl text-white" />
              </div>
              <div>
                <Title level={2} className="!mb-0 !text-coffee-espresso">
                  จัดการข้อมูลลูกค้า
                </Title>
                <Text className="text-brand-text-secondary">
                  บริหารจัดการข้อมูลลูกค้าของร้าน
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
              เพิ่มลูกค้าใหม่
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <div className="stat-card stat-card-purple">
            <Statistic
              title={<span className="text-white/80 text-sm">ลูกค้าทั้งหมด</span>}
              value={customers.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
              suffix="คน"
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <div className="stat-card stat-card-success">
            <Statistic
              title={<span className="text-white/80 text-sm">สมาชิก</span>}
              value={customers.filter(c => c.customer_status?.toLowerCase().includes('member') || c.customer_status?.toLowerCase().includes('active')).length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
              suffix="คน"
            />
          </div>
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <div className="stat-card stat-card-info">
            <Statistic
              title={<span className="text-white/80 text-sm">ลูกค้าใหม่ (7 วัน)</span>}
              value={customers.filter(c => {
                const createdDate = new Date(c.created_at);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - createdDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
              }).length}
              prefix={<PlusOutlined />}
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
              รายชื่อลูกค้า
            </Title>
          </div>
          <Input
            placeholder="ค้นหาชื่อหรือเบอร์โทร..."
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
            dataSource={filteredCustomers}
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
              {editingCustomer ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}
            </span>
          </div>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText={editingCustomer ? 'บันทึก' : 'เพิ่มลูกค้า'}
        cancelText="ยกเลิก"
        width={500}
      >
        <Form form={form} layout="vertical" name="customer_form" className="mt-6">
          <Form.Item
            name="customer_name"
            label={<span className="font-medium text-coffee-dark-roast">ชื่อลูกค้า</span>}
            rules={[{ required: true, message: 'กรุณากรอกชื่อลูกค้า' }]}
          >
            <Input
              prefix={<UserOutlined className="text-brand-text-muted" />}
              placeholder="กรุณาใส่ชื่อลูกค้า"
              size="large"
              className="!rounded-xl"
            />
          </Form.Item>
          <Form.Item
            name="customer_phone"
            label={<span className="font-medium text-coffee-dark-roast">เบอร์โทรลูกค้า</span>}
            rules={[{ required: true, message: 'กรุณากรอกเบอร์โทร' }]}
          >
            <Input
              prefix={<PhoneOutlined className="text-brand-text-muted" />}
              placeholder="กรุณาใส่เบอร์โทรลูกค้า"
              size="large"
              className="!rounded-xl"
            />
          </Form.Item>
          <Form.Item
            name="customer_status"
            label={<span className="font-medium text-coffee-dark-roast">สถานะลูกค้า</span>}
          >
            <Input
              placeholder="เช่น member, active"
              size="large"
              className="!rounded-xl"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomersPage;
