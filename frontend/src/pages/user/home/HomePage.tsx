import React, { useContext, useEffect, useState } from 'react';
import { Typography, Row, Col, Card, Statistic, Table, Segmented, Spin, Empty } from 'antd';
import {
  ArrowUpOutlined,
  CoffeeOutlined,
  TeamOutlined,
  DollarCircleOutlined,
  UserOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { AuthContext } from '../../../auth/auth';
import { getSalesAnalytics, getCustomers, getMenus, getOrders } from '../../../api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import moment from 'moment';

const { Title } = Typography;

interface SalesData {
  menu: string;
  sales: number;
  revenue: number;
}

interface Customer {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_purchase: number;
  created_at: string;
}

interface Menu {
  id: string;
  name: string;
  price: number;
  category: {
    id: string;
    name: string;
  };
  status: string;
}

interface Order {
  id: string;
  order_number: string;
  order_status: string;
  created_at: string;
  customer: {
    customer_name: string;
  };
}

const COLORS = ['#66BB6A', '#29B6F6', '#FFA726', '#8D6E63', '#AB47BC', '#EC407A'];

const HomePage: React.FC = () => {
  const { user } = useContext(AuthContext)!;
  const [period, setPeriod] = useState<string>('monthly');
  const [loading, setLoading] = useState(true);

  // State for data
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // State for statistics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0);
  const [growth, setGrowth] = useState(0);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [salesRes, customersRes, menusRes, ordersRes] = await Promise.all([
        getSalesAnalytics(period),
        getCustomers(),
        getMenus(),
        getOrders({ date: moment().format('YYYY-MM-DD') })
      ]);

      console.log('Sales Response:', salesRes);
      console.log('Customers Response:', customersRes);
      console.log('Menus Response:', menusRes);
      console.log('Orders Response:', ordersRes);

      // Set sales data - API uses responseObject
      const salesDataArray = salesRes?.responseObject || [];
      setSalesData(salesDataArray);
      console.log('Sales Data Array:', salesDataArray);

      // Set customers - API uses responseObject
      const customersArray = customersRes?.responseObject || [];
      setCustomers(customersArray);
      console.log('Customers Array:', customersArray);

      // Set menus - API uses responseObject
      const menusArray = menusRes?.responseObject || [];
      setMenus(menusArray);
      console.log('Menus Array:', menusArray);

      // Set orders - API uses responseObject.data for orders
      const ordersArray = ordersRes?.responseObject?.data || ordersRes?.responseObject || [];
      setOrders(ordersArray);
      console.log('Orders Array:', ordersArray);

      // Calculate statistics
      const revenue = salesDataArray.reduce((sum: number, item: SalesData) => sum + item.revenue, 0);
      setTotalRevenue(revenue);

      setTotalOrders(ordersArray.length);

      // Calculate new customers (customers created in the last 7 days)
      const sevenDaysAgo = moment().subtract(7, 'days');
      const recentCustomers = customersArray.filter((c: Customer) =>
        moment(c.created_at).isAfter(sevenDaysAgo)
      );
      setNewCustomers(recentCustomers.length);

      // Calculate growth (mock calculation - you may want to implement actual growth calculation)
      setGrowth(revenue > 0 ? 9.3 : 0);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const topSellingProducts = salesData
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);

  const revenueByProduct = salesData
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Customer table columns
  const customerColumns = [
    {
      title: 'ชื่อลูกค้า',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 200,
    },
    {
      title: 'เบอร์โทร',
      dataIndex: 'customer_phone',
      key: 'customer_phone',
      width: 150,
    },
    {
      title: 'ยอดซื้อสะสม',
      dataIndex: 'total_purchase',
      key: 'total_purchase',
      width: 150,
      render: (value: number) => `${value?.toLocaleString() || 0} บาท`,
    },
    {
      title: 'วันที่ลงทะเบียน',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date: string) => moment(date).format('DD/MM/YYYY'),
    },
  ];

  // Menu table columns
  const menuColumns = [
    {
      title: 'ชื่อสินค้า',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'หมวดหมู่',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 150,
    },
    {
      title: 'ราคา',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (value: number) => `${value?.toLocaleString() || 0} บาท`,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <span style={{
          color: status === 'available' ? '#66BB6A' : '#F44336',
          fontWeight: 500
        }}>
          {status === 'available' ? 'พร้อมขาย' : 'หมด'}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          ยินดีต้อนรับ, {user?.username || 'User'}!
        </Title>
        <Segmented
          value={period}
          onChange={(value) => setPeriod(value as string)}
          options={[
            { label: 'รายเดือน', value: 'monthly' },
            { label: 'รายปี', value: 'yearly' },
          ]}
          size="large"
        />
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="รายได้รวม"
              value={totalRevenue}
              precision={2}
              valueStyle={{ color: '#66BB6A', fontSize: 28 }}
              prefix={<DollarCircleOutlined />}
              suffix="บาท"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ออเดอร์วันนี้"
              value={totalOrders}
              valueStyle={{ color: '#8D6E63', fontSize: 28 }}
              prefix={<CoffeeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ลูกค้าใหม่"
              value={newCustomers}
              valueStyle={{ color: '#29B6F6', fontSize: 28 }}
              prefix={<TeamOutlined />}
              suffix="คน"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="การเติบโต"
              value={growth}
              precision={1}
              valueStyle={{ color: '#66BB6A', fontSize: 28 }}
              prefix={<ArrowUpOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Top Selling Products */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <ShoppingOutlined style={{ marginRight: 8, color: '#66BB6A' }} />
                สินค้าขายดี Top 10
              </span>
            }
            style={{ height: '100%' }}
          >
            {topSellingProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSellingProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="menu"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#66BB6A" name="จำนวนที่ขาย" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="ไม่มีข้อมูลการขาย" />
            )}
          </Card>
        </Col>

        {/* Revenue by Product */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <DollarCircleOutlined style={{ marginRight: 8, color: '#29B6F6' }} />
                รายได้ตามสินค้า Top 5
              </span>
            }
            style={{ height: '100%' }}
          >
            {revenueByProduct.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueByProduct}
                    dataKey="revenue"
                    nameKey="menu"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.menu}: ${entry.revenue.toLocaleString()} บาท`}
                  >
                    {revenueByProduct.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()} บาท`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="ไม่มีข้อมูลรายได้" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Sales Trend (Mock Data for now) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card
            title={
              <span>
                <ArrowUpOutlined style={{ marginRight: 8, color: '#FFA726' }} />
                แนวโน้มยอดขาย
              </span>
            }
          >
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={salesData.slice(0, 12).map((item, index) => ({
                    name: item.menu.substring(0, 10),
                    revenue: item.revenue,
                    orders: item.sales
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#66BB6A"
                    name="รายได้ (บาท)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#29B6F6"
                    name="จำนวนออเดอร์"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="ไม่มีข้อมูลแนวโน้ม" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Tables Section */}
      <Row gutter={[16, 16]}>
        {/* Customers Table */}
        <Col xs={24} xl={12}>
          <Card
            title={
              <span>
                <UserOutlined style={{ marginRight: 8, color: '#AB47BC' }} />
                ข้อมูลลูกค้า ({customers.length} คน)
              </span>
            }
          >
            <Table
              columns={customerColumns}
              dataSource={customers}
              rowKey="id"
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                showTotal: (total) => `ทั้งหมด ${total} รายการ`
              }}
              scroll={{ x: 600 }}
            />
          </Card>
        </Col>

        {/* Products Table */}
        <Col xs={24} xl={12}>
          <Card
            title={
              <span>
                <CoffeeOutlined style={{ marginRight: 8, color: '#EC407A' }} />
                รายการสินค้า ({menus.length} รายการ)
              </span>
            }
          >
            <Table
              columns={menuColumns}
              dataSource={menus}
              rowKey="id"
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                showTotal: (total) => `ทั้งหมด ${total} รายการ`
              }}
              scroll={{ x: 600 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
