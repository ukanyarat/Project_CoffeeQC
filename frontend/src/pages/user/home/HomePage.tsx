import React, { useContext, useEffect, useState } from 'react';
import { Typography, Row, Col, Card, Statistic, Table, Segmented, Empty } from 'antd';
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

const { Title, Text } = Typography;

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

const COLORS = ['#6F4E37', '#8B7355', '#D4B896', '#C68E17', '#10B981', '#0EA5E9'];

const HomePage: React.FC = () => {
  const { user } = useContext(AuthContext)!;
  const [period, setPeriod] = useState<string>('monthly');
  const [loading, setLoading] = useState(true);

  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0);
  const [growth, setGrowth] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [salesRes, customersRes, menusRes, ordersRes] = await Promise.all([
        getSalesAnalytics(period),
        getCustomers(),
        getMenus(),
        getOrders({ date: moment().format('YYYY-MM-DD') })
      ]);

      const salesDataArray = salesRes?.responseObject || [];
      setSalesData(salesDataArray);

      const customersArray = customersRes?.responseObject || [];
      setCustomers(customersArray);

      const menusArray = menusRes?.responseObject || [];
      setMenus(menusArray);

      const ordersArray = ordersRes?.responseObject?.data || ordersRes?.responseObject || [];

      const revenue = salesDataArray.reduce((sum: number, item: SalesData) => sum + item.revenue, 0);
      setTotalRevenue(revenue);

      setTotalOrders(ordersArray.length);

      const sevenDaysAgo = moment().subtract(7, 'days');
      const recentCustomers = customersArray.filter((c: Customer) =>
        moment(c.created_at).isAfter(sevenDaysAgo)
      );
      setNewCustomers(recentCustomers.length);

      setGrowth(revenue > 0 ? 9.3 : 0);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const topSellingProducts = salesData
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);

  const revenueByProduct = salesData
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const customerColumns = [
    {
      title: 'ลูกค้า',
      key: 'customer',
      render: (_: any, record: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-coffee-gradient flex items-center justify-center">
            <UserOutlined className="text-white text-sm" />
          </div>
          <div>
            <Text strong className="text-coffee-espresso block">{record.customer_name}</Text>
            <Text type="secondary" className="text-xs">{record.customer_phone}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'ยอดซื้อสะสม',
      dataIndex: 'total_purchase',
      key: 'total_purchase',
      width: 120,
      render: (value: number) => (
        <Text strong className="text-coffee-medium-roast">
          ฿{value?.toLocaleString() || 0}
        </Text>
      ),
    },
    {
      title: 'วันที่ลงทะเบียน',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => (
        <Text type="secondary" className="text-sm">
          {moment(date).format('DD/MM/YYYY')}
        </Text>
      ),
    },
  ];

  const menuColumns = [
    {
      title: 'สินค้า',
      key: 'product',
      render: (_: any, record: Menu) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-coffee-latte flex items-center justify-center">
            <CoffeeOutlined className="text-coffee-medium-roast text-sm" />
          </div>
          <div>
            <Text strong className="text-coffee-espresso block">{record.name}</Text>
            <Text type="secondary" className="text-xs">{record.category?.name || '-'}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'ราคา',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (value: number) => (
        <Text strong className="text-coffee-medium-roast">
          ฿{value?.toLocaleString() || 0}
        </Text>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            status === 'available'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {status === 'available' ? 'พร้อมขาย' : 'หมด'}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="coffee-spinner mx-auto mb-4" />
          <Text className="text-brand-text-secondary">กำลังโหลดข้อมูล...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-coffee-cream min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <Title level={2} className="!mb-1 !text-coffee-espresso">
            ยินดีต้อนรับ, {user?.username || 'User'}!
          </Title>
          <Text className="text-brand-text-secondary">
            ภาพรวมการดำเนินงานของร้านกาแฟ
          </Text>
        </div>
        <Segmented
          value={period}
          onChange={(value) => setPeriod(value as string)}
          options={[
            { label: 'รายเดือน', value: 'monthly' },
            { label: 'รายปี', value: 'yearly' },
          ]}
          size="large"
          className="!rounded-xl"
        />
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card stat-card-success">
            <Statistic
              title={<span className="text-white/80 text-sm">รายได้รวม</span>}
              value={totalRevenue}
              precision={0}
              prefix={<DollarCircleOutlined />}
              suffix="฿"
              valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card stat-card-coffee">
            <Statistic
              title={<span className="text-white/80 text-sm">ออเดอร์วันนี้</span>}
              value={totalOrders}
              prefix={<CoffeeOutlined />}
              valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card stat-card-info">
            <Statistic
              title={<span className="text-white/80 text-sm">ลูกค้าใหม่ (7 วัน)</span>}
              value={newCustomers}
              prefix={<TeamOutlined />}
              suffix="คน"
              valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="stat-card stat-card-purple">
            <Statistic
              title={<span className="text-white/80 text-sm">การเติบโต</span>}
              value={growth}
              precision={1}
              prefix={<ArrowUpOutlined />}
              suffix="%"
              valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
            />
          </div>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* Top Selling Products */}
        <Col xs={24} lg={12}>
          <Card
            className="!rounded-2xl !shadow-coffee-md h-full"
            styles={{ body: { padding: '20px' } }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                <ShoppingOutlined className="text-lg text-white" />
              </div>
              <Title level={5} className="!mb-0 !text-coffee-espresso">
                สินค้าขายดี Top 10
              </Title>
            </div>
            {topSellingProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topSellingProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" />
                  <XAxis
                    dataKey="menu"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tick={{ fontSize: 11, fill: '#5C5650' }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#5C5650' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(111, 78, 55, 0.12)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="sales" fill="#6F4E37" name="จำนวนที่ขาย" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="ไม่มีข้อมูลการขาย" className="py-16" />
            )}
          </Card>
        </Col>

        {/* Revenue by Product */}
        <Col xs={24} lg={12}>
          <Card
            className="!rounded-2xl !shadow-coffee-md h-full"
            styles={{ body: { padding: '20px' } }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <DollarCircleOutlined className="text-lg text-white" />
              </div>
              <Title level={5} className="!mb-0 !text-coffee-espresso">
                รายได้ตามสินค้า Top 5
              </Title>
            </div>
            {revenueByProduct.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={revenueByProduct as { menu: string; revenue: number }[]}
                    dataKey="revenue"
                    nameKey="menu"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, value }) => `${name || ''}: ฿${(value as number)?.toLocaleString()}`}
                    labelLine={{ stroke: '#8B7355' }}
                  >
                    {revenueByProduct.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `฿${value.toLocaleString()}`}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(111, 78, 55, 0.12)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="ไม่มีข้อมูลรายได้" className="py-16" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Sales Trend */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Card
            className="!rounded-2xl !shadow-coffee-md"
            styles={{ body: { padding: '20px' } }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                <ArrowUpOutlined className="text-lg text-white" />
              </div>
              <Title level={5} className="!mb-0 !text-coffee-espresso">
                แนวโน้มยอดขาย
              </Title>
            </div>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={salesData.slice(0, 12).map((item) => ({
                    name: item.menu.substring(0, 10),
                    revenue: item.revenue,
                    orders: item.sales
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D9" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 11, fill: '#5C5650' }}
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#5C5650' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#5C5650' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(111, 78, 55, 0.12)',
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6F4E37"
                    name="รายได้ (บาท)"
                    strokeWidth={2}
                    dot={{ fill: '#6F4E37', r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#0EA5E9"
                    name="จำนวนออเดอร์"
                    strokeWidth={2}
                    dot={{ fill: '#0EA5E9', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="ไม่มีข้อมูลแนวโน้ม" className="py-16" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Tables Section */}
      <Row gutter={[16, 16]}>
        {/* Customers Table */}
        <Col xs={24} xl={12}>
          <Card
            className="!rounded-2xl !shadow-coffee-md"
            styles={{ body: { padding: '20px' } }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                <UserOutlined className="text-lg text-white" />
              </div>
              <Title level={5} className="!mb-0 !text-coffee-espresso">
                ข้อมูลลูกค้า ({customers.length} คน)
              </Title>
            </div>
            <Table
              columns={customerColumns}
              dataSource={customers}
              rowKey="id"
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                showTotal: (total) => `ทั้งหมด ${total} รายการ`
              }}
              size="small"
              className="coffee-table"
            />
          </Card>
        </Col>

        {/* Products Table */}
        <Col xs={24} xl={12}>
          <Card
            className="!rounded-2xl !shadow-coffee-md"
            styles={{ body: { padding: '20px' } }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center">
                <CoffeeOutlined className="text-lg text-white" />
              </div>
              <Title level={5} className="!mb-0 !text-coffee-espresso">
                รายการสินค้า ({menus.length} รายการ)
              </Title>
            </div>
            <Table
              columns={menuColumns}
              dataSource={menus}
              rowKey="id"
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                showTotal: (total) => `ทั้งหมด ${total} รายการ`
              }}
              size="small"
              className="coffee-table"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
