import React, { useContext } from 'react';
import { Typography, Row, Col, Card, Statistic } from 'antd';
import { ArrowUpOutlined, CoffeeOutlined, TeamOutlined, DollarCircleOutlined } from '@ant-design/icons';
import { AuthContext } from '../../../auth/auth';

const { Title, Text } = Typography;

const HomePage: React.FC = () => {
  const { user } = useContext(AuthContext)!;

  return (
    <div>
      <Title level={2} style={{ marginBottom: '24px' }}>
        Welcome back, {user?.name || 'User'}!
      </Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Revenue"
              value={11289.45}
              precision={2}
              valueStyle={{ color: '#66BB6A' }}
              prefix={<DollarCircleOutlined />}
              suffix="THB"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Orders"
              value={93}
              valueStyle={{ color: '#8D6E63' }}
              prefix={<CoffeeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="New Customers"
              value={12}
              valueStyle={{ color: '#29B6F6' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Growth"
              value={9.3}
              precision={1}
              valueStyle={{ color: '#66BB6A' }}
              prefix={<ArrowUpOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>
      {/* Can add more components like recent orders or charts here in the future */}
      <Row style={{marginTop: 24}}>
        <Col span={24}>
          <Card title="Quick Actions">
             <Text>Quick actions can be added here.</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
