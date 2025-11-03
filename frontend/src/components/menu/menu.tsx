import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DesktopOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  ShopOutlined,
  CoffeeOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, Avatar, Typography, ConfigProvider, Tooltip } from 'antd';
import { AuthContext } from '../../auth/AuthContext';

const { Sider } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  onClick?: () => void
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    onClick
  } as MenuItem;
}

const allMenuItems: MenuItem[] = [
  getItem(<Link to="/take-order">รับออเดอร์</Link>, '1', <CoffeeOutlined />),
  getItem(<Link to="/todays-orders">คำสั่งซื้อวันนี้</Link>, '2', <DesktopOutlined />),
  getItem(<Link to="/products">รายสินค้า</Link>, '3', <ShopOutlined />),
  getItem(<Link to="/sales-history">ประวัติการขาย</Link>, '4', <FileOutlined />),
  getItem(<Link to="/customers">รายชื่อลูกค้า</Link>, '5', <TeamOutlined />),
  getItem(<Link to="/employees">รายชื่อพนักงาน</Link>, '6', <UserOutlined />),
  getItem(<Link to="/">คุยกับAI</Link>, '7', <UserOutlined />)
];

const rolePermissions = {
  admin: ['1', '2', '3', '4', '5', '6', '7'],
  manager: ['1', '2', '3', '4', '5', '6'],
  staff: ['1', '2', '3', '6'],
};

type UserRole = keyof typeof rolePermissions;

interface MenuComponentProps {
  user: {
    name: string;
    role: UserRole;
  };
}

const MenuComponent: React.FC<MenuComponentProps> = ({ user }) => {
  const [collapsed, setCollapsed] = useState(false);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (authContext) {
      await authContext.logout();
      navigate('/login');
    }
  };

  const allowedKeys = rolePermissions[user.role] || [];
  const filteredMenuItems = allMenuItems.filter(item => item && allowedKeys.includes(String(item.key)));

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemBg: '#FFFBF5',
            itemColor: '#A1887F',
            itemHoverBg: '#FFEFE0',
            itemSelectedBg: '#FFDAB9',
            itemSelectedColor: '#FF8A65',
          },
        },
      }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="light"
        width={250}
        style={{ background: '#FFFBF5', borderRight: '1px solid #FBE9E7', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <img src="/images/logoicon.png" alt="Logo" style={{ height: '100%', maxWidth: '100%' }} />
        </div>
        <Menu
          theme="light"
          defaultSelectedKeys={['1']}
          mode="inline"
          items={filteredMenuItems}
          style={{ background: '#FFFBF5', borderRight: 0, flex: 1, overflow: 'auto' }}
        />
        <div style={{

          padding: '16px',
          borderTop: '1px solid #FBE9E7'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
            {!collapsed && <Avatar style={{ backgroundColor: '#FFDAB9' }} icon={<UserOutlined style={{ color: '#FF8A65' }} />} />}
            {!collapsed && <Text style={{ marginLeft: '8px', color: '#A1887F' }}>{user.name}</Text>}
            {collapsed ? (
              <Tooltip title={user.name} placement="right">
                <a onClick={handleLogout} style={{ color: '#A1887F' }}>
                  <LogoutOutlined style={{ fontSize: '16px' }} />
                </a>
              </Tooltip>
            ) : (
              <a onClick={handleLogout} style={{ color: '#A1887F' }}>
                <LogoutOutlined style={{ fontSize: '16px' }} />
              </a>
            )}
          </div>
        </div>
      </Sider>
    </ConfigProvider>
  );
};

export default MenuComponent;
