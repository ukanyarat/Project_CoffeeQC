import React from 'react';
import { Typography, Row, Col } from 'antd';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: 'calc(100vh - 64px)', 
      background: '#FFFBF5' 
    }}>
      <Row justify="center" align="middle" style={{ textAlign: 'center' }}>
        <Col span={24}>
          <img 
            src="/images/logofront.jpg" 
            alt="Coffee QC Logo" 
            style={{ 
              width: '200px', 
              height: '200px',
              borderRadius: '50%',
              marginBottom: '24px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
            }} 
          />
        </Col>
        <Col span={24}>
          <Title style={{ color: '#6D4C41' }}>
            Welcome to CoffeeQC
          </Title>
          <Paragraph style={{ color: '#A1887F', fontSize: '18px' }}>
            Your daily dose of quality coffee, managed with ease.
          </Paragraph>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
