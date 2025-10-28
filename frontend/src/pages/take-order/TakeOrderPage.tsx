import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Tabs, Card, Button, List, Avatar, Statistic, message, Popconfirm, Select, Input, Divider, Space } from 'antd';
import { PlusOutlined, MinusOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import { getCategories, getMenus, getCustomers, createOrder, createOrderList, createCustomer } from '../../api';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;

// --- Interfaces ---
interface Category {
  id: string;
  category_name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category_id: string;
}

interface Customer {
  id: string;
  customer_name: string;
}

interface CartItem extends Product {
  quantity: number;
  notes?: string;
}

// --- Main Component ---
const TakeOrderPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | undefined>(undefined);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes, custRes] = await Promise.all([
        getCategories(),
        getMenus(),
        getCustomers(),
      ]);
      setCategories(catRes.responseObject || []);
      setProducts(prodRes.responseObject || []);
      setCustomers(custRes.responseObject || []);
    } catch (error: any) {
      message.error('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1, notes: '' }];
      }
    });
  };

  const updateQuantity = (productId: string, amount: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + amount;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName) {
        message.error('Customer name cannot be empty.');
        return;
    }
    if (!newCustomerPhone) {
        message.error('Customer phone cannot be empty.');
        return;
    }
    try {
        const response = await createCustomer({ customer_name: newCustomerName, customer_phone: newCustomerPhone });
        message.success(`Customer '${newCustomerName}' created`);
        setNewCustomerName('');
        setNewCustomerPhone('');
        // Refetch customers to get the new list with the new ID
        const custRes = await getCustomers();
        setCustomers(custRes.responseObject || []);
        // Select the newly created customer
        setSelectedCustomer(response.responseObject.id);
    } catch (error: any) {
        message.error('Failed to create customer: ' + error.message);
    }
  };

  const handleNoteChange = (productId: string, newNote: string) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, notes: newNote } : item
      )
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const clearOrder = () => {
    setCart([]);
    setSelectedCustomer(undefined);
    message.info('Order cleared');
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      message.error('Cannot place an empty order');
      return;
    }
    if (!selectedCustomer) {
      message.error('Please select a customer');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        order_status: 'pending',
        service: 'take-away',
        payment_channel: 'cash',
        customer_id: selectedCustomer,
      };
      const orderResponse = await createOrder(orderPayload);
      const orderId = orderResponse.responseObject.id;

      if (!orderId) {
        throw new Error('Failed to create order and get an order ID.');
      }

      const orderListPromises = cart.map(item => {
        const orderListPayload = {
          order_id: orderId,
          menu_id: item.id,
          price: Number(item.price),
          quantity: item.quantity,
          status: 'active',
          remark: item.notes,
        };
        return createOrderList(orderListPayload);
      });

      await Promise.all(orderListPromises);

      message.success(`Order placed successfully!`);
      clearOrder();

    } catch (error: any) {
      message.error('Failed to place order: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout style={{ background: 'transparent' }}>
      <Content>
        <Row gutter={16}>
          <Col span={16}>
            <Card loading={loading}>
              <Tabs defaultActiveKey={categories[0]?.id}>
                {categories.map(cat => (
                  <TabPane tab={cat.category_name} key={cat.id}>
                    <Row gutter={[16, 16]}>
                      {products.filter(p => p.category_id === cat.id).map(p => (
                        <Col key={p.id} xs={12} sm={8} md={6}>
                          <Card
                            hoverable
                            onClick={() => addToCart(p)}
                          >
                            <Card.Meta title={p.name} description={`${p.price} THB`} />
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </TabPane>
                ))}
              </Tabs>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="Current Order">
              <div style={{ marginBottom: 16 }}>
                <Select
                  showSearch
                  value={selectedCustomer}
                  style={{ width: '100%' }}
                  placeholder="Select or create a customer"
                  onChange={(value) => setSelectedCustomer(value)}
                  filterOption={(input, option) =>
                    (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                  }
                  dropdownRender={menu => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Space style={{ padding: '0 8px 4px' }}>
                        <Input
                          placeholder="New customer name"
                          value={newCustomerName}
                          onChange={(e) => setNewCustomerName(e.target.value)}
                        />
                        <Input
                          placeholder="New customer phone"
                          value={newCustomerPhone}
                          onChange={(e) => setNewCustomerPhone(e.target.value)}
                        />
                        <Button type="text" icon={<UserAddOutlined />} onClick={handleAddCustomer}>
                          Add
                        </Button>
                      </Space>
                    </>
                  )}
                >
                  {customers.map(c => <Option key={c.id} value={c.id}>{c.customer_name}</Option>)}
                </Select>
              </div>
              <List
                dataSource={cart}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button size="small" icon={<MinusOutlined />} onClick={() => updateQuantity(item.id, -1)} />,
                      <span style={{ margin: '0 8px' }}>{item.quantity}</span>,
                      <Button size="small" icon={<PlusOutlined />} onClick={() => updateQuantity(item.id, 1)} />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={'/images/pos/placeholder.png'} />}
                      title={item.name}
                      description={
                        <>
                          <p>{`${item.price} THB`}</p>
                          <Input.TextArea
                            placeholder="Add notes (e.g., less sweet, no ice)"
                            value={item.notes}
                            onChange={(e) => handleNoteChange(item.id, e.target.value)}
                            autoSize={{ minRows: 1, maxRows: 3 }}
                            style={{ marginTop: '8px' }}
                          />
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
              <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <Statistic title="Total" value={total} precision={2} suffix="THB" />
              </div>
              <Row gutter={8} style={{ marginTop: '16px' }}>
                <Col span={12}>
                  <Popconfirm
                    title="Are you sure you want to clear the order?"
                    onConfirm={clearOrder}
                    okText="Yes"
                    cancelText="No"
                    disabled={cart.length === 0 || isSubmitting}
                  >
                    <Button danger block icon={<DeleteOutlined />} disabled={cart.length === 0 || isSubmitting}>
                      Clear
                    </Button>
                  </Popconfirm>
                </Col>
                <Col span={12}>
                  <Button type="primary" block size="large" onClick={placeOrder} loading={isSubmitting} disabled={cart.length === 0}>
                    Place Order
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default TakeOrderPage;