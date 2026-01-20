import { Card, Col, Row, Table, Typography, Spin, Alert, Empty, Statistic, Select } from "antd";
import {
  BarChartOutlined,
  LineChartOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { getSalesAnalytics } from "../../api";

const { Title } = Typography;

interface SalesData {
  menu: string;
  sales: number;
  revenue: number;
}

const DashboardPage = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(); // Use 'any' since Chart type is not imported
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('monthly'); // New state for period

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getSalesAnalytics(period); // Pass period to API call

        // Handle the response data properly
        if (response && response.data && Array.isArray(response.data)) {
          setData(response.data);
        } else {
          setData([]);
          setError("No sales data available");
        }
      } catch (error) {
        console.error("Failed to fetch sales analytics:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch sales analytics");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]); // Re-fetch data when period changes

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      const context = chartRef.current.getContext("2d");
      if (context) {
        const avgRevenue =
          data.reduce((acc, item) => acc + item.revenue, 0) / data.length;

        chartInstance.current = new window.Chart(context, {
          type: "bar",
          data: {
            labels: data.map((d) => d.menu),
            datasets: [
              {
                type: "line",
                label: "Average Revenue (฿)",
                data: data.map(() => avgRevenue),
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.1)",
                borderWidth: 2,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.4,
              },
              {
                type: "bar",
                label: "Sales Quantity",
                data: data.map((d) => d.sales),
                backgroundColor: "rgba(54, 162, 235, 0.7)",
                borderColor: "rgb(54, 162, 235)",
                borderWidth: 1,
                yAxisID: "y",
              },
              {
                type: "bar",
                label: "Revenue (฿)",
                data: data.map((d) => d.revenue),
                backgroundColor: "rgba(75, 192, 192, 0.7)",
                borderColor: "rgb(75, 192, 192)",
                borderWidth: 1,
                yAxisID: "y1",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: "index",
              intersect: false,
            },
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
              tooltip: {
                callbacks: {
                  label: function (context: any) {
                    let label = context.dataset.label || "";
                    if (label) {
                      label += ": ";
                    }
                    if (label.includes("฿")) {
                      label += "฿" + context.parsed.y.toLocaleString();
                    } else {
                      label += context.parsed.y.toLocaleString();
                    }
                    return label;
                  },
                },
              },
            },
            scales: {
              y: {
                type: "linear",
                display: true,
                position: "left",
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Sales Quantity",
                },
              },
              y1: {
                type: "linear",
                display: true,
                position: "right",
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Revenue (฿)",
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
            },
          },
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  // Calculate summary statistics
  const totalSales = data.reduce((acc, item) => acc + item.sales, 0);
  const totalRevenue = data.reduce((acc, item) => acc + item.revenue, 0);
  const averageRevenue = data.length > 0 ? totalRevenue / data.length : 0;
  const topSellingMenu = data.length > 0
    ? data.reduce((prev, current) => (prev.sales > current.sales ? prev : current))
    : null;

  const columns = [
    {
      title: "Menu",
      dataIndex: "menu",
      key: "menu",
    },
    {
      title: "Total Sales",
      dataIndex: "sales",
      key: "sales",
      sorter: (a: any, b: any) => a.sales - b.sales,
    },
    {
      title: "Total Revenue",
      dataIndex: "revenue",
      key: "revenue",
      sorter: (a: any, b: any) => a.revenue - b.revenue,
      render: (text: number) => `฿${text.toLocaleString()}`,
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Title level={2}>
        <DashboardOutlined /> Sales Analytics Dashboard
      </Title>

      <div style={{ marginBottom: '16px' }}>
        <Select
          defaultValue="monthly"
          style={{ width: 120 }}
          onChange={(value) => setPeriod(value)}
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' },
          ]}
        />
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          onClose={() => setError(null)}
        />
      )}

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {/* Summary Statistics Cards */}
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Total Sales"
                value={totalSales}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Total Revenue"
                value={totalRevenue}
                prefix={<DollarOutlined />}
                suffix="฿"
                precision={2}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Average Revenue"
                value={averageRevenue}
                prefix={<RiseOutlined />}
                suffix="฿"
                precision={2}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Top Selling Menu"
                value={topSellingMenu?.menu || "N/A"}
                valueStyle={{ fontSize: "18px", color: "#722ed1" }}
              />
              {topSellingMenu && (
                <div style={{ marginTop: 8, fontSize: "14px", color: "#8c8c8c" }}>
                  {topSellingMenu.sales} items sold
                </div>
              )}
            </Card>
          </Col>

          {/* Chart */}
          <Col span={24}>
            <Card
              title={
                <>
                  <BarChartOutlined /> <LineChartOutlined /> Sales Overview Chart
                </>
              }
              bordered={false}
            >
              {data.length > 0 ? (
                <div style={{ height: 400 }}>
                  <canvas ref={chartRef} />
                </div>
              ) : (
                !loading && (
                  <Empty
                    description="No sales data available"
                    style={{ padding: "60px 0" }}
                  />
                )
              )}
            </Card>
          </Col>

          {/* Table */}
          <Col span={24}>
            <Card title="Sales Data Table" bordered={false}>
              <Table
                dataSource={data}
                columns={columns}
                rowKey="menu"
                pagination={data.length > 10 ? { pageSize: 10 } : false}
                locale={{
                  emptyText: <Empty description="No sales data available" />,
                }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default DashboardPage;
