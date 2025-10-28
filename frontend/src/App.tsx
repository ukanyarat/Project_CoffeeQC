import React, { useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Layout } from 'antd';
import MenuComponent from './components/menu/menu';
import { AuthContext } from './auth/AuthContext';

const { Content } = Layout;

const App: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  if (!authContext) {
    return <div>Loading...</div>; // Or some other loading state
  }

  const { user } = authContext;

  if (!user) {
    // This should not happen due to ProtectedRoute, but as a fallback
    navigate('/login');
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <MenuComponent user={user} />
      <Layout style={{ background: '#FDF5E6' }}>
        <Content style={{ margin: '16px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );

};

export default App;