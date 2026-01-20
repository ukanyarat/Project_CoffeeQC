import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, message, Spin, Tag, Row, Col, Statistic, Collapse, Space, Divider, Button, Popconfirm } from 'antd';
import { ShoppingOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, CoffeeOutlined, UserOutlined, CreditCardOutlined, CalendarOutlined } from '@ant-design/icons';
import { getOrders, getOrderLists, updateOrder } from '../../api';
import moment from 'moment';

const { Title, Text } = Typography;
const { Panel } = Collapse;

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
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [orderListItems, setOrderListItems] = useState<{ [orderId: string]: OrderListItem[] }>({});
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchTodaysOrders = async () => {
    setLoading(true);
    try {
      const today = moment().format('YYYY-MM-DD');
      const ordersResponse = await getOrders({ date: today });

      if (ordersResponse.success && ordersResponse.responseObject?.data) {
        setOrders(ordersResponse.responseObject.data);

        // Fetch all order lists to calculate total revenue
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
        message.error(ordersResponse.message || 'Failed to fetch today\'s orders.');
      }
    } catch (error: any) {
      message.error('Error fetching today\'s orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaysOrders();
  }, []);

  const fetchOrderListForOrder = async (orderId: string) => {
    if (orderListItems[orderId]) return; // Already fetched

    try {
      const orderListResponse = await getOrderLists({ orderId: orderId });
      if (orderListResponse.success && orderListResponse.responseObject?.data) {
        console.log('Order List Items Data:', orderListResponse.responseObject.data);
        setOrderListItems(prev => ({ ...prev, [orderId]: orderListResponse.responseObject.data }));
      } else {
        message.error(orderListResponse.message || `Failed to fetch order list for order ${orderId}.`);
      }
    } catch (error: any) {
      message.error(`Error fetching order list for order ${orderId}: ` + error.message);
    }
  };

  const handleExpand = (expanded: boolean, record: Order) => {
    if (expanded) {
      setExpandedRowKeys(prev => [...prev, record.id]);
      fetchOrderListForOrder(record.id);
    } else {
      setExpandedRowKeys(prev => prev.filter(key => key !== record.id));
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const response = await updateOrder(orderId, { order_status: 'completed' });
      if (response.success) {
        message.success('Order marked as completed!');
        fetchTodaysOrders(); // Refresh the orders list
      } else {
        message.error(response.message || 'Failed to update order status');
      }
    } catch (error: any) {
      message.error('Error updating order: ' + error.message);
    }
  };

  // Calculate statistics (removed getTotalRevenue as we now use state)

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
    if (channelLower.includes('cash')) return '💵';
    if (channelLower.includes('card') || channelLower.includes('credit')) return '💳';
    if (channelLower.includes('qr') || channelLower.includes('promptpay')) return '📱';
    return '💰';
  };

  const orderColumns = [
    {
      title: 'Order Number',
      dataIndex: 'order_number',
      key: 'order_number',
    },
    {
      title: 'Customer Name',
      dataIndex: ['customer', 'customer_name'],
      key: 'customer_name',
    },
    {
      title: 'Status',
      dataIndex: 'order_status',
      key: 'order_status',
      render: (status: string) => <Tag color="blue">{status}</Tag>,
    },
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: 'Payment Channel',
      dataIndex: 'payment_channel',
      key: 'payment_channel',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Order) => (
        <Space>
          {record.order_status.toLowerCase() !== 'completed' && (
            <Popconfirm
              title="Complete this order?"
              description="Are you sure you want to mark this order as completed?"
              onConfirm={() => handleCompleteOrder(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" size="small" icon={<CheckCircleOutlined />}>
                Complete
              </Button>
            </Popconfirm>
          )}
          {record.order_status.toLowerCase() === 'completed' && (
            <Tag color="success" icon={<CheckCircleOutlined />}>Completed</Tag>
          )}
        </Space>
      ),
    },
  ];

  const orderListItemColumns = [
    {
      title: 'Menu Item',
      dataIndex: ['menu', 'name'],
      key: 'menu_name',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${Number(price).toFixed(2)} THB`,
    },
    {
      title: 'Remark',
      dataIndex: 'remark',
      key: 'remark',
      render: (remark: string) => remark || '-',
    },
  ];

  const statusCounts = getStatusCounts();

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CalendarOutlined style={{ color: '#1890ff' }} />
            Today's Orders
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            {moment().format('dddd, MMMM D, YYYY')}
          </Text>
        </div>

        <Spin spinning={loading}>
          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card
                bordered={false}
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px' }}>Total Orders</span>}
                  value={orders.length}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                bordered={false}
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px' }}>Total Revenue</span>}
                  value={totalRevenue}
                  prefix={<DollarOutlined />}
                  suffix="THB"
                  precision={2}
                  valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                bordered={false}
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px' }}>Completed</span>}
                  value={Object.keys(statusCounts).filter(s => s.toLowerCase().includes('completed') || s.toLowerCase().includes('done')).reduce((sum, key) => sum + statusCounts[key], 0)}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card
                bordered={false}
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px' }}>Pending</span>}
                  value={Object.keys(statusCounts).filter(s => s.toLowerCase().includes('pending') || s.toLowerCase().includes('waiting')).reduce((sum, key) => sum + statusCounts[key], 0)}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#fff', fontSize: '32px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Orders List */}
          <Card
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}
          >
            <Title level={4} style={{ marginBottom: '20px' }}>
              <ShoppingOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              Order Details
            </Title>

            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                <ShoppingOutlined style={{ fontSize: '64px', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px' }}>No orders today</div>
              </div>
            ) : (
              <Collapse
                accordion
                bordered={false}
                style={{ background: 'transparent' }}
                onChange={(key) => {
                  if (key) {
                    const orderId = key as string;
                    fetchOrderListForOrder(orderId);
                  }
                }}
              >
                {orders.map((order) => (
                  <Panel
                    key={order.id}
                    header={
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <Space size="middle">
                          <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px', fontWeight: 'bold' }}>
                            {order.order_number}
                          </Tag>
                          <Space size="small">
                            <UserOutlined style={{ color: '#666' }} />
                            <Text strong>{order.customer.customer_name}</Text>
                          </Space>
                        </Space>
                        <Space size="small">
                          <Tag color={getStatusColor(order.order_status)} style={{ fontSize: '13px', padding: '2px 10px' }}>
                            {order.order_status}
                          </Tag>
                          {order.order_status.toLowerCase() !== 'completed' && (
                            <Popconfirm
                              title="Complete this order?"
                              description="Are you sure you want to mark this order as completed?"
                              onConfirm={(e) => {
                                e?.stopPropagation();
                                handleCompleteOrder(order.id);
                              }}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Button
                                type="primary"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={(e) => e.stopPropagation()}
                              >
                                Complete
                              </Button>
                            </Popconfirm>
                          )}
                          <Text type="secondary" style={{ fontSize: '13px' }}>
                            {moment(order.created_at).format('HH:mm')}
                          </Text>
                        </Space>
                      </div>
                    }
                    style={{
                      marginBottom: '12px',
                      background: '#fafafa',
                      borderRadius: '8px',
                      border: '1px solid #f0f0f0'
                    }}
                  >
                    <div style={{ padding: '16px 0' }}>
                      {/* Order Info */}
                      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
                        <Col xs={24} sm={8}>
                          <Card size="small" style={{ background: '#fff', borderRadius: '8px' }}>
                            <Space direction="vertical" size={4}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>Service Type</Text>
                              <Text strong style={{ fontSize: '16px' }}>
                                <CoffeeOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                {order.service}
                              </Text>
                            </Space>
                          </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Card size="small" style={{ background: '#fff', borderRadius: '8px' }}>
                            <Space direction="vertical" size={4}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>Payment</Text>
                              <Text strong style={{ fontSize: '16px' }}>
                                <span style={{ marginRight: '8px' }}>{getPaymentIcon(order.payment_channel)}</span>
                                {order.payment_channel}
                              </Text>
                            </Space>
                          </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Card size="small" style={{ background: '#fff', borderRadius: '8px' }}>
                            <Space direction="vertical" size={4}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>Order Time</Text>
                              <Text strong style={{ fontSize: '16px' }}>
                                <ClockCircleOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                                {moment(order.created_at).format('HH:mm:ss')}
                              </Text>
                            </Space>
                          </Card>
                        </Col>
                      </Row>

                      <Divider style={{ margin: '16px 0' }}>Order Items</Divider>

                      {/* Order Items */}
                      {!orderListItems[order.id] ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                          <Spin />
                        </div>
                      ) : (
                        <div style={{ background: '#fff', borderRadius: '8px', padding: '16px' }}>
                          {orderListItems[order.id].map((item, index) => (
                            <div
                              key={item.id}
                              style={{
                                padding: '12px',
                                borderBottom: index < orderListItems[order.id].length - 1 ? '1px solid #f0f0f0' : 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '8px'
                              }}
                            >
                              <Space size="middle" style={{ flex: 1, minWidth: '200px' }}>
                                <Tag color="cyan" style={{ fontSize: '18px', padding: '4px 8px', minWidth: '40px', textAlign: 'center' }}>
                                  {item.quantity}x
                                </Tag>
                                <div>
                                  <div style={{ fontSize: '16px', fontWeight: 500 }}>
                                    {item.menu?.name || 'Unknown Item'}
                                  </div>
                                  {item.remark && (
                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                      Note: {item.remark}
                                    </Text>
                                  )}
                                </div>
                              </Space>
                              <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                ฿{(item.price * item.quantity).toFixed(2)}
                              </Text>
                            </div>
                          ))}
                          <div style={{
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: '2px solid #f0f0f0',
                            textAlign: 'right'
                          }}>
                            <Text strong style={{ fontSize: '18px', color: '#000' }}>
                              Total: ฿{orderListItems[order.id].reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                            </Text>
                          </div>
                        </div>
                      )}
                    </div>
                  </Panel>
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
