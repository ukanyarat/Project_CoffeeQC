import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, message, Spin, Tag } from 'antd';
import { getOrders, getOrderLists } from '../../api';
import moment from 'moment';

const { Title } = Typography;

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

  const fetchTodaysOrders = async () => {
    setLoading(true);
    try {
      const today = moment().format('YYYY-MM-DD');
      const ordersResponse = await getOrders({ date: today });

      if (ordersResponse.success && ordersResponse.responseObject?.data) {
        setOrders(ordersResponse.responseObject.data);
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
      render: (price: number) => `${price.toFixed(2)} THB`,
    },
    {
      title: 'Remark',
      dataIndex: 'remark',
      key: 'remark',
      render: (remark: string) => remark || '-',
    },
  ];

  return (
    <Card>
      <Title level={3}>Today's Orders</Title>
      <Spin spinning={loading}>
        <Table
          columns={orderColumns}
          dataSource={orders}
          rowKey="id"
          expandable={{
            expandedRowRender: (record) => (
              <Table
                columns={orderListItemColumns}
                dataSource={orderListItems[record.id] || []}
                rowKey="id"
                pagination={false}
                loading={!orderListItems[record.id] && expandedRowKeys.includes(record.id)}
              />
            ),
            onExpand: handleExpand,
            expandedRowKeys: expandedRowKeys,
          }}
          pagination={false}
        />
      </Spin>
    </Card>
  );
};

export default TodaysOrdersPage;