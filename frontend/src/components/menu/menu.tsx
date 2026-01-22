
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import {
  DesktopOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  ShopOutlined,
  CoffeeOutlined,
  LogoutOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, Avatar, Typography, Tooltip } from 'antd';
import { AuthContext } from '../../auth/auth';

const { Sider } = Layout;
const { Text, Title } = Typography;

// Custom type for menu items with path
interface MenuItemWithPath {
  key: string;
  icon: React.ReactNode;
  label: React.ReactNode;
  path: string;
}

// รายการเมนูทั้งหมดในระบบ พร้อม path สำหรับ routing
const allMenuItems: MenuItemWithPath[] = [
  {
    key: 'take-order',
    icon: <CoffeeOutlined />,
    label: <Link to="/take-order">รับออเดอร์</Link>,
    path: '/take-order'
  },
  {
    key: 'todays-orders',
    icon: <DesktopOutlined />,
    label: <Link to="/todays-orders">คำสั่งซื้อวันนี้</Link>,
    path: '/todays-orders'
  },
  {
    key: 'products',
    icon: <ShopOutlined />,
    label: <Link to="/products">รายสินค้า</Link>,
    path: '/products'
  },
  {
    key: 'sales-history',
    icon: <FileOutlined />,
    label: <Link to="/sales-history">ประวัติการขาย</Link>,
    path: '/sales-history'
  },
  {
    key: 'customers',
    icon: <TeamOutlined />,
    label: <Link to="/customers">รายชื่อลูกค้า</Link>,
    path: '/customers'
  },
  {
    key: 'employees',
    icon: <UserOutlined />,
    label: <Link to="/employees">รายชื่อพนักงาน</Link>,
    path: '/employees'
  },
  {
    key: 'ai-chat',
    icon: <MessageOutlined />,
    label: <Link to="/ai-chat">คุยกับ AI</Link>,
    path: '/ai-chat'
  },
];

/**
 * กำหนดสิทธิ์การเข้าถึงเมนูตาม Role ของผู้ใช้
 * - admin: เข้าถึงได้ทุกเมนู
 * - manager: เข้าถึงได้ทุกเมนู
 * - staff: เข้าถึงได้เฉพาะเมนูพื้นฐาน (รับออเดอร์, ดูออเดอร์วันนี้, สินค้า)
 */
const rolePermissions: Record<string, string[]> = {
  admin: ['ai-chat', 'take-order', 'todays-orders', 'products', 'sales-history', 'customers', 'employees', 'dashboard'],
  manager: ['ai-chat', 'take-order', 'todays-orders', 'products', 'sales-history', 'customers', 'employees', 'dashboard'],
  staff: ['ai-chat', 'take-order', 'todays-orders', 'products'],
};

interface MenuComponentProps {
  user: {
    username: string;
    role: string;
  };
}

const MenuComponent: React.FC<MenuComponentProps> = ({ user }) => {
  // State สำหรับควบคุมการยุบ/ขยายเมนู
  const [collapsed, setCollapsed] = useState(false);
  // State เก็บเมนูที่กำลังเลือกอยู่
  const [current, setCurrent] = useState('home');

  // ดึง Context สำหรับการ Authentication
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * ติดตามการเปลี่ยนแปลง URL เพื่ออัพเดทเมนูที่ถูกเลือก
   * จะทำงานทุกครั้งที่ location.pathname เปลี่ยน
   */
  useEffect(() => {
    const menuItem = allMenuItems.find(item => item.path === location.pathname);
    if (menuItem) {
      setCurrent(menuItem.key as string);
    }
  }, [location]);

  /**
   * ฟังก์ชัน Logout ผู้ใช้
   * - เรียก logout จาก AuthContext
   * - นำทางไปหน้า login
   */
  const handleLogout = async () => {
    if (authContext) {
      await authContext.logout();
      navigate('/login');
    }
  };

  // กรองเมนูที่ผู้ใช้มีสิทธิ์เข้าถึงตาม Role
  const allowedKeys = rolePermissions[user.role] || [];
  const filteredMenuItems = allMenuItems.filter(item =>
    item && allowedKeys.includes(String(item.key))
  );

  return (
    <Sider
      collapsible // เปิดใช้การยุบ/ขยายเมนู
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      theme="light"
      width={260} // เพิ่มความกว้างให้ดูสบายตามากขึ้น
      style={{
        boxShadow: '4px 0 12px rgba(139, 69, 19, 0.08)', // เงาสีน้ำตาลอ่อนตามธีมกาแฟ
        borderRight: '1px solid #E8D5C4',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #FFF9F0 0%, #FFEFD5 100%)', // Gradient สีครีมอ่อน
      }}
    >
      {/* ส่วนหัวของ Sidebar - แสดงโลโก้และชื่อร้าน */}
      <div
        style={{
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #D4A574 0%, #C19A6B 100%)', // สีทองน้ำตาล
          borderBottom: '2px solid #B8956A',
          boxShadow: '0 2px 8px rgba(139, 69, 19, 0.15)',
        }}
        onClick={() => navigate('/')}
      >
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}>
          <img
            src="/images/logoicon.png"
            alt="Logo"
            style={{
              height: '36px',
              width: '36px',
              objectFit: 'contain'
            }}
          />
        </div>
        {!collapsed && (
          <Title
            level={4}
            style={{
              margin: '0 0 0 12px',
              whiteSpace: 'nowrap',
              color: '#FFFFFF',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
            }}
          >
            Coffee Shop
          </Title>
        )}
      </div>

      {/* ส่วนเมนูหลัก */}
      <Menu
        selectedKeys={[current]}
        mode="inline"
        items={filteredMenuItems as unknown as MenuProps['items']}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          borderRight: 0,
          background: 'transparent',
          padding: '8px 0',
        }}
        // สไตล์สำหรับแต่ละรายการเมนู
        className="coffee-menu"
        onClick={(e) => setCurrent(e.key)}
      />

      {/* ส่วนข้อมูลผู้ใช้และปุ่ม Logout ที่ด้านล่าง */}
      <div
        style={{
          padding: '16px',
          borderTop: '2px solid #E8D5C4',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            background: 'white',
            padding: '12px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(139, 69, 19, 0.1)',
          }}
        >
          {/* Avatar ผู้ใช้ */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <Avatar
              style={{
                backgroundColor: '#D4A574',
                border: '2px solid #B8956A',
                flexShrink: 0,
              }}
              icon={<UserOutlined />}
              size={collapsed ? 'default' : 'large'}
            />
            {/* แสดงชื่อและ Role เมื่อเมนูไม่ยุบ */}
            {!collapsed && (
              <div
                style={{
                  marginLeft: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Text
                  strong
                  style={{
                    color: '#6D4C41',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '14px',
                  }}
                >
                  {user.username}
                </Text>
                <Text
                  style={{
                    fontSize: '16px',
                    color: '#A1887F',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.role === 'admin' ? '👑 Admin' :
                    user.role === 'manager' ? '📋 Manager' :
                      '☕ Staff'}
                </Text>
              </div>
            )}
          </div>
          {/* ปุ่ม Logout */}
          <Tooltip title="ออกจากระบบ">
            <a
              onClick={handleLogout}
              style={{
                color: '#D4A574',
                fontSize: '18px',
                marginLeft: collapsed ? 0 : '8px',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FFF4EA';
                e.currentTarget.style.color = '#A0522D';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#D4A574';
              }}
            >
              <LogoutOutlined />
            </a>
          </Tooltip>
        </div>
      </div>

      {/* CSS สำหรับ custom menu styling */}
      <style>{`
        .coffee-menu .ant-menu-item {
          margin: 4px 8px;
          border-radius: 8px;
          transition: all 0.3s;
        }
        
        .coffee-menu .ant-menu-item:hover {
          background: rgba(212, 165, 116, 0.15) !important;
        }
        
        .coffee-menu .ant-menu-item-selected {
          background: linear-gradient(135deg, #D4A574 0%, #C19A6B 100%) !important;
          color: white !important;
          box-shadow: 0 2px 8px rgba(139, 69, 19, 0.2);
        }
        
        .coffee-menu .ant-menu-item-selected a {
          color: white !important;
        }
        
        .coffee-menu .ant-menu-item-selected .anticon {
          color: white !important;
        }
        
        .coffee-menu .ant-menu-item a {
          color: #6D4C41;
          font-weight: 500;
        }
        
        .coffee-menu .ant-menu-item .anticon {
          color: #A1887F;
          font-size: 16px;
        }
      `}</style>
    </Sider>
  );
};

export default MenuComponent;
