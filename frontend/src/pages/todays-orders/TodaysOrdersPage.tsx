import React, { useState, useEffect } from 'react';
import { Card, Typography, message, Spin, Tag, Row, Col, Statistic, Collapse, Space, Divider, Button, Popconfirm, Empty } from 'antd';
import { ShoppingOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, CoffeeOutlined, UserOutlined, CalendarOutlined, ReloadOutlined } from '@ant-design/icons';
import { getOrders, getOrderLists, updateOrder } from '../../api';
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

const TodaysOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderListItems, setOrderListItems] = useState<{ [orderId: string]: OrderListItem[] }>({});
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchTodaysOrders = async () => {
    setLoading(true);
    try {
      const today = moment().format('YYYY-MM-DD');
      const ordersResponse = await getOrders({ date: today });

      if (ordersResponse.success && ordersResponse.responseObject?.data) {
        setOrders(ordersResponse.responseObject.data);

        const allOrderIds = ordersResponse.responseObject.data.map((order: Order) => order.id);
        let revenue = 0;

        for (const orderId of allOrderIds) {
          const orderListResponse = await getOrderLists({ orderId });
          if (orderListResponse.success && orderListResponse.responseObject?.data) {
            const items = orderListResponse.responseObject.data;
            revenue += items.reduce((sum: number, item: OrderListItem) =>
              sum + (item.price * item.quantity), 0
            );
          }
        }

        setTotalRevenue(revenue);
      } else {
        message.error(ordersResponse.message || 'ไม่สามารถโหลดข้อมูลออเดอร์ได้');
      }
    } catch (error: any) {
      message.error('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaysOrders();
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

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const response = await updateOrder(orderId, { order_status: 'completed' });
      if (response.success) {
        message.success('อัปเดตสถานะเรียบร้อย!');
        fetchTodaysOrders();
      } else {
        message.error(response.message || 'ไม่สามารถอัปเดตสถานะได้');
      }
    } catch (error: any) {
      message.error('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const getStatusCounts = () => {
    const counts: { [key: string]: number } = {};
    orders.forEach(order => {
      counts[order.order_status] = (counts[order.order_status] || 0) + 1;
    });
    return counts;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed') || statusLower.includes('done')) return 'success';
    if (statusLower.includes('pending') || statusLower.includes('waiting')) return 'warning';
    if (statusLower.includes('processing') || statusLower.includes('preparing')) return 'processing';
    if (statusLower.includes('cancelled') || statusLower.includes('failed')) return 'error';
    return 'default';
  };

  const getPaymentIcon = (channel: string) => {
    const channelLower = channel.toLowerCase();
    if (channelLower.includes('cash')) return { icon: '💵', label: 'เงินสด' };
    if (channelLower.includes('card') || channelLower.includes('credit')) return { icon: '💳', label: 'บัตรเครดิต' };
    if (channelLower.includes('qr') || channelLower.includes('promptpay')) return { icon: '📱', label: 'PromptPay' };
    return { icon: '💰', label: channel };
  };

  const statusCounts = getStatusCounts();
  const completedCount = Object.keys(statusCounts).filter(s => s.toLowerCase().includes('completed') || s.toLowerCase().includes('done')).reduce((sum, key) => sum + statusCounts[key], 0);
  const pendingCount = Object.keys(statusCounts).filter(s => s.toLowerCase().includes('pending') || s.toLowerCase().includes('waiting')).reduce((sum, key) => sum + statusCounts[key], 0);

  return (
    <div className="p-4 md:p-6 bg-coffee-cream min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-coffee-gradient flex items-center justify-center shadow-coffee-md">
              <CalendarOutlined className="text-2xl text-white" />
            </div>
            <div>
              <Title level={2} className="!mb-0 !text-coffee-espresso">
                คำสั่งซื้อวันนี้
              </Title>
              <Text className="text-brand-text-secondary">
                {moment().format('dddd, D MMMM YYYY')}
              </Text>
            </div>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchTodaysOrders}
            loading={loading}
            className="!rounded-xl !h-11"
          >
            รีเฟรช
          </Button>
        </div>

        <Spin spinning={loading}>
          {/* Statistics Cards */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <div className="stat-card stat-card-purple">
                <Statistic
                  title={<span className="text-white/80 text-sm">ยอดคำสั่งซื้อทั้งหมด</span>}
                  value={orders.length}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
                />
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="stat-card stat-card-pink">
                <Statistic
                  title={<span className="text-white/80 text-sm">รายได้รวม</span>}
                  value={totalRevenue}
                  prefix={<DollarOutlined />}
                  suffix="฿"
                  precision={0}
                  valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
                />
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="stat-card stat-card-success">
                <Statistic
                  title={<span className="text-white/80 text-sm">สำเร็จแล้ว</span>}
                  value={completedCount}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
                />
              </div>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <div className="stat-card stat-card-warning">
                <Statistic
                  title={<span className="text-white/80 text-sm">รอดำเนินการ</span>}
                  value={pendingCount}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
                />
              </div>
            </Col>
          </Row>

          {/* Orders List */}
          <Card
            className="!rounded-2xl !shadow-coffee-md"
            styles={{ body: { padding: '24px' } }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <ShoppingOutlined className="text-lg text-white" />
              </div>
              <Title level={4} className="!mb-0 !text-coffee-espresso">
                รายละเอียดคำสั่งซื้อ
              </Title>
            </div>

            {orders.length === 0 ? (
              <Empty
                description="ไม่มีรายการคำสั่งซื้อวันนี้"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                className="py-16"
              />
            ) : (
              <Collapse
                accordion
                bordered={false}
                className="!bg-transparent"
                onChange={(key) => {
                  if (key) {
                    const orderId = Array.isArray(key) ? key[0] : key;
                    if (orderId) fetchOrderListForOrder(orderId);
                  }
                }}
              >
                {orders.map((order) => (
                  <Collapse.Panel
                    key={order.id}
                    header={
                      <div className="flex items-center justify-between flex-wrap gap-3 py-1">
                        <Space size="middle" wrap>
                          <Tag
                            color="blue"
                            className="!text-sm !px-3 !py-1 !font-bold !rounded-lg"
                          >
                            #{order.order_number}
                          </Tag>
                          <Space size="small">
                            <UserOutlined className="text-coffee-light-roast" />
                            <Text strong className="text-coffee-espresso">{order.customer.customer_name}</Text>
                          </Space>
                        </Space>
                        <Space size="small" wrap>
                          <Tag
                            color={getStatusColor(order.order_status)}
                            className="!rounded-lg !px-3"
                          >
                            {order.order_status}
                          </Tag>
                          {order.order_status.toLowerCase() !== 'completed' && (
                            <Popconfirm
                              title="ยืนยันการอัปเดตสถานะ?"
                              description="ต้องการเปลี่ยนสถานะเป็นเสร็จสิ้นหรือไม่?"
                              onConfirm={(e) => {
                                e?.stopPropagation();
                                handleCompleteOrder(order.id);
                              }}
                              okText="ใช่"
                              cancelText="ไม่"
                              okButtonProps={{ style: { background: '#2E7D32' } }}
                            >
                              <Button
                                type="primary"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={(e) => e.stopPropagation()}
                                className="!rounded-lg"
                                style={{ background: '#2E7D32' }}
                              >
                                เสร็จสิ้น
                              </Button>
                            </Popconfirm>
                          )}
                          <Text type="secondary" className="text-sm">
                            {moment(order.created_at).format('HH:mm น.')}
                          </Text>
                        </Space>
                      </div>
                    }
                    className="!mb-3 !bg-coffee-latte !rounded-xl !border !border-brand-border-light overflow-hidden"
                  >
                    <div className="py-2">
                      {/* Order Info */}
                      <Row gutter={[16, 16]} className="mb-5">
                        <Col xs={24} sm={8}>
                          <div className="bg-white rounded-xl p-4 border border-brand-border-light">
                            <Text type="secondary" className="text-xs block mb-1">รับบริการ</Text>
                            <div className="flex items-center gap-2">
                              <CoffeeOutlined className="text-coffee-medium-roast" />
                              <Text strong className="text-coffee-espresso">{order.service}</Text>
                            </div>
                          </div>
                        </Col>
                        <Col xs={24} sm={8}>
                          <div className="bg-white rounded-xl p-4 border border-brand-border-light">
                            <Text type="secondary" className="text-xs block mb-1">วิธีการชำระเงิน</Text>
                            <div className="flex items-center gap-2">
                              <span>{getPaymentIcon(order.payment_channel).icon}</span>
                              <Text strong className="text-coffee-espresso">{getPaymentIcon(order.payment_channel).label}</Text>
                            </div>
                          </div>
                        </Col>
                        <Col xs={24} sm={8}>
                          <div className="bg-white rounded-xl p-4 border border-brand-border-light">
                            <Text type="secondary" className="text-xs block mb-1">เวลาคำสั่งซื้อ</Text>
                            <div className="flex items-center gap-2">
                              <ClockCircleOutlined className="text-green-600" />
                              <Text strong className="text-coffee-espresso">
                                {moment(order.created_at).format('HH:mm:ss')}
                              </Text>
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <Divider className="!my-4">
                        <span className="text-brand-text-secondary text-sm">รายการสินค้า</span>
                      </Divider>

                      {/* Order Items */}
                      {!orderListItems[order.id] ? (
                        <div className="text-center py-8">
                          <Spin />
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl p-4 border border-brand-border-light">
                          {orderListItems[order.id].map((item, index) => (
                            <div
                              key={item.id}
                              className={`py-3 flex justify-between items-center ${
                                index < orderListItems[order.id].length - 1 ? 'border-b border-brand-border-light' : ''
                              }`}
                            >
                              <Space size="middle" className="flex-1 min-w-0">
                                <Tag color="cyan" className="!text-base !px-3 !py-1 !rounded-lg !font-bold">
                                  {item.quantity}x
                                </Tag>
                                <div className="min-w-0">
                                  <Text strong className="text-coffee-espresso block truncate">
                                    {item.menu?.name || 'Unknown Item'}
                                  </Text>
                                  {item.remark && (
                                    <Text type="secondary" className="text-xs">
                                      Note: {item.remark}
                                    </Text>
                                  )}
                                </div>
                              </Space>
                              <Text strong className="text-coffee-medium-roast text-base">
                                ฿{(item.price * item.quantity).toFixed(0)}
                              </Text>
                            </div>
                          ))}
                          <div className="mt-4 pt-4 border-t-2 border-brand-border flex justify-between items-center">
                            <Text strong className="text-coffee-espresso">ยอดรวม</Text>
                            <Text strong className="text-xl text-coffee-medium-roast">
                              ฿{orderListItems[order.id].reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(0)}
                            </Text>
                          </div>
                        </div>
                      )}
                    </div>
                  </Collapse.Panel>
                ))}
              </Collapse>
            )}
          </Card>
        </Spin>
      </div>
    </div>
  );
};

export default TodaysOrdersPage;
