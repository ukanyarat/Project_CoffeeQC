import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, message, Spin, Tag, Row, Col, Statistic, Space, Divider, Empty } from 'antd';
import { HistoryOutlined, DollarOutlined, ShoppingOutlined, UserOutlined, CoffeeOutlined } from '@ant-design/icons';
import { getOrders, getOrderLists } from '../../api';
import moment from 'moment';

const { Title, Text } = Typography;

interface Customer {
  id: string;
  customer_name: string;
}

interface Order {
  id: string;
  order_number: string;
  order_status: string;
  service: string;
  payment_channel: string;
  customer: Customer;
  created_at: string;
  updated_at: string;
}

interface MenuItem {
  id: string;
  name: string;
  type: string;
  price: number;
}

interface OrderListItem {
  id: string;
  menu: MenuItem;
  price: number;
  quantity: number;
  remark?: string;
  status: string;
  created_at: string;
}

const SalesHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderListItems, setOrderListItems] = useState<{ [orderId: string]: OrderListItem[] }>({});

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const ordersResponse = await getOrders();

      if (ordersResponse.success && ordersResponse.responseObject?.data) {
        setOrders(ordersResponse.responseObject.data);
      } else {
        message.error(ordersResponse.message || 'ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (error: any) {
      message.error('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchOrderListForOrder = async (orderId: string) => {
    if (orderListItems[orderId]) return;

    try {
      const orderListResponse = await getOrderLists({ orderId: orderId });
      if (orderListResponse.success && orderListResponse.responseObject?.data) {
        setOrderListItems(prev => ({ ...prev, [orderId]: orderListResponse.responseObject.data }));
      } else {
        message.error(orderListResponse.message || `ไม่สามารถโหลดรายการสินค้าได้`);
      }
    } catch (error: any) {
      message.error(`เกิดข้อผิดพลาด: ` + error.message);
    }
  };

  const getOrderStatus = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('completed') || statusLower.includes('done')) {
      return { color: 'success', text: 'สำเร็จแล้ว' };
    }
    if (statusLower.includes('pending') || statusLower.includes('waiting')) {
      return { color: 'warning', text: 'รอดำเนินการ' };
    }
    if (statusLower.includes('cancelled') || statusLower.includes('failed')) {
      return { color: 'error', text: 'ยกเลิกแล้ว' };
    }
    if (statusLower.includes('processing') || statusLower.includes('preparing')) {
      return { color: 'processing', text: 'กำลังดำเนินการ' };
    }
    return { color: 'default', text: status };
  };

  const getPaymentIcon = (channel: string) => {
    const channelLower = channel?.toLowerCase() || '';
    if (channelLower.includes('cash')) return { icon: '💵', label: 'เงินสด' };
    if (channelLower.includes('card') || channelLower.includes('credit')) return { icon: '💳', label: 'บัตรเครดิต' };
    if (channelLower.includes('qr') || channelLower.includes('promptpay')) return { icon: '📱', label: 'PromptPay' };
    return { icon: '💰', label: channel };
  };

  // Calculate statistics
  const completedOrders = orders.filter(o => o.order_status?.toLowerCase().includes('completed') || o.order_status?.toLowerCase().includes('done'));
  const pendingOrders = orders.filter(o => o.order_status?.toLowerCase().includes('pending'));

  const orderColumns = [
    {
      title: 'เลขที่คำสั่งซื้อ',
      dataIndex: 'order_number',
      key: 'order_number',
      width: 150,
      render: (orderNumber: string) => (
        <Tag color="blue" className="!text-sm !px-3 !py-1 !font-bold !rounded-lg">
          #{orderNumber}
        </Tag>
      ),
    },
    {
      title: 'ลูกค้า',
      dataIndex: ['customer', 'customer_name'],
      key: 'customer_name',
      render: (name: string) => (
        <Space size="small">
          <UserOutlined className="text-coffee-light-roast" />
          <Text strong className="text-coffee-espresso">{name}</Text>
        </Space>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'order_status',
      key: 'order_status',
      width: 140,
      render: (status: string) => {
        const { color, text } = getOrderStatus(status);
        return <Tag color={color} className="!rounded-lg !px-3">{text}</Tag>;
      },
    },
    {
      title: 'บริการ',
      dataIndex: 'service',
      key: 'service',
      width: 120,
      render: (service: string) => (
        <Space size="small">
          <CoffeeOutlined className="text-coffee-medium-roast" />
          <Text type="secondary">{service}</Text>
        </Space>
      ),
    },
    {
      title: 'ชำระเงิน',
      dataIndex: 'payment_channel',
      key: 'payment_channel',
      width: 130,
      render: (channel: string) => {
        const { icon, label } = getPaymentIcon(channel);
        return (
          <Space size="small">
            <span>{icon}</span>
            <Text type="secondary">{label}</Text>
          </Space>
        );
      },
    },
    {
      title: 'วันที่',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => (
        <Text type="secondary">
          {moment(date).format('DD MMM YYYY, HH:mm')}
        </Text>
      ),
    },
  ];

  const orderListItemColumns = [
    {
      title: 'รายการ',
      dataIndex: ['menu', 'name'],
      key: 'menu_name',
      render: (name: string) => <Text strong className="text-coffee-espresso">{name || 'Unknown'}</Text>,
    },
    {
      title: 'จำนวน',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (qty: number) => (
        <Tag color="cyan" className="!text-base !px-3 !py-1 !rounded-lg !font-bold">{qty}x</Tag>
      ),
    },
    {
      title: 'ราคา',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => (
        <Text strong className="text-coffee-medium-roast">฿{Number(price).toFixed(0)}</Text>
      ),
    },
    {
      title: 'หมายเหตุ',
      dataIndex: 'remark',
      key: 'remark',
      render: (remark: string) => (
        <Text type="secondary" className="text-sm">{remark || '-'}</Text>
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
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-coffee-gradient flex items-center justify-center shadow-coffee-md">
            <HistoryOutlined className="text-2xl text-white" />
          </div>
          <div>
            <Title level={2} className="!mb-0 !text-coffee-espresso">
              ประวัติการขาย
            </Title>
            <Text className="text-brand-text-secondary">
              ดูประวัติคำสั่งซื้อทั้งหมดของร้าน
            </Text>
          </div>
        </div>
      </Card>

      <Spin spinning={loading}>
        {/* Statistics */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <div className="stat-card stat-card-purple">
              <Statistic
                title={<span className="text-white/80 text-sm">คำสั่งซื้อทั้งหมด</span>}
                value={orders.length}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
              />
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="stat-card stat-card-success">
              <Statistic
                title={<span className="text-white/80 text-sm">สำเร็จแล้ว</span>}
                value={completedOrders.length}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
              />
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="stat-card stat-card-warning">
              <Statistic
                title={<span className="text-white/80 text-sm">รอดำเนินการ</span>}
                value={pendingOrders.length}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
              />
            </div>
          </Col>
        </Row>

        {/* Orders Table */}
        <Card
          className="!rounded-2xl !shadow-coffee-md"
          styles={{ body: { padding: '24px' } }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <ShoppingOutlined className="text-lg text-white" />
            </div>
            <Title level={4} className="!mb-0 !text-coffee-espresso">
              รายการคำสั่งซื้อ
            </Title>
          </div>

          {orders.length === 0 ? (
            <Empty
              description="ยังไม่มีประวัติการขาย"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="py-16"
            />
          ) : (
            <Table
              columns={orderColumns}
              dataSource={orders}
              rowKey="id"
              expandable={{
                expandedRowRender: (record) => (
                  <div className="p-4 bg-coffee-latte rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <CoffeeOutlined className="text-coffee-medium-roast" />
                      <Text strong className="text-coffee-espresso">รายการสินค้า</Text>
                    </div>
                    {!orderListItems[record.id] ? (
                      <div className="text-center py-4">
                        <Spin size="small" />
                      </div>
                    ) : orderListItems[record.id].length === 0 ? (
                      <Text type="secondary">ไม่มีรายการสินค้า</Text>
                    ) : (
                      <>
                        <Table
                          columns={orderListItemColumns}
                          dataSource={orderListItems[record.id]}
                          rowKey="id"
                          pagination={false}
                          size="small"
                          className="coffee-table"
                        />
                        <Divider className="!my-3" />
                        <div className="flex justify-end">
                          <div className="bg-white rounded-xl px-6 py-3 border border-brand-border-light">
                            <Text type="secondary" className="mr-4">ยอดรวม:</Text>
                            <Text strong className="text-xl text-coffee-medium-roast">
                              ฿{orderListItems[record.id].reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(0)}
                            </Text>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ),
                onExpand: (expanded, record) => {
                  if (expanded) {
                    fetchOrderListForOrder(record.id);
                  }
                },
              }}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `ทั้งหมด ${total} รายการ`,
                className: 'mt-4'
              }}
              className="coffee-table"
            />
          )}
        </Card>
      </Spin>
    </div>
  );
};

export default SalesHistoryPage;
