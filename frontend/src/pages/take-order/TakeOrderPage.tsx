// import React, { useState, useEffect } from 'react';
// import { Layout, Row, Col, Tabs, Card, Button, List, Avatar, Statistic, message, Popconfirm, Select, Input, Divider, Space } from 'antd';
// import { PlusOutlined, MinusOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
// import { getCategories, getMenus, getCustomers, createOrder, createOrderList, createCustomer } from '../../api';
// import QRCodePopup from '../../components/common/QRCodePopup';
//
// const { Content } = Layout;
// const { TabPane } = Tabs;
// const { Option } = Select;
//
// // --- Interfaces ---
// interface Category {
//   id: string;
//   category_name: string;
// }
//
// interface Product {
//   id: string;
//   name: string;
//   price: number;
//   category_id: string;
// }
//
// interface Customer {
//   id: string;
//   customer_name: string;
// }
//
// interface CartItem extends Product {
//   quantity: number;
//   notes?: string;
// }
//
// // --- Main Component ---
// const TakeOrderPage: React.FC = () => {
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [selectedCustomer, setSelectedCustomer] = useState<string | undefined>(undefined);
//   const [newCustomerName, setNewCustomerName] = useState('');
//   const [newCustomerPhone, setNewCustomerPhone] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isQrPopupVisible, setIsQrPopupVisible] = useState(false);
//
//   const fetchAllData = async () => {
//     try {
//       setLoading(true);
//       const [catRes, prodRes, custRes] = await Promise.all([
//         getCategories(),
//         getMenus(),
//         getCustomers(),
//       ]);
//       setCategories(catRes.responseObject || []);
//       setProducts(prodRes.responseObject || []);
//       setCustomers(custRes.responseObject || []);
//     } catch (error: any) {
//       message.error('Failed to load data: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   useEffect(() => {
//     fetchAllData();
//   }, []);
//
//   const addToCart = (product: Product) => {
//     setCart(prevCart => {
//       const existingItem = prevCart.find(item => item.id === product.id);
//       if (existingItem) {
//         return prevCart.map(item =>
//           item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
//         );
//       } else {
//         return [...prevCart, { ...product, quantity: 1, notes: '' }];
//       }
//     });
//   };
//
//   const updateQuantity = (productId: string, amount: number) => {
//     setCart(prevCart => {
//       return prevCart.map(item => {
//         if (item.id === productId) {
//           const newQuantity = item.quantity + amount;
//           return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
//         }
//         return item;
//       }).filter(Boolean) as CartItem[];
//     });
//   };
//
//   const handleAddCustomer = async () => {
//     if (!newCustomerName) {
//       message.error('Customer name cannot be empty.');
//       return;
//     }
//     if (!newCustomerPhone) {
//       message.error('Customer phone cannot be empty.');
//       return;
//     }
//     try {
//       const response = await createCustomer({ customer_name: newCustomerName, customer_phone: newCustomerPhone });
//       message.success(`Customer '${newCustomerName}' created`);
//       setNewCustomerName('');
//       setNewCustomerPhone('');
//       // Refetch customers to get the new list with the new ID
//       const custRes = await getCustomers();
//       setCustomers(custRes.responseObject || []);
//       // Select the newly created customer
//       setSelectedCustomer(response.responseObject.id);
//     } catch (error: any) {
//       message.error('Failed to create customer: ' + error.message);
//     }
//   };
//
//   const handleNoteChange = (productId: string, newNote: string) => {
//     setCart(prevCart =>
//       prevCart.map(item =>
//         item.id === productId ? { ...item, notes: newNote } : item
//       )
//     );
//   };
//
//   const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
//
//   const clearOrder = () => {
//     setCart([]);
//     setSelectedCustomer(undefined);
//     message.info('Order cleared');
//   };
//
//   const handlePlaceOrderClick = () => {
//     if (cart.length === 0) {
//       message.error('Cannot place an empty order');
//       return;
//     }
//     if (!selectedCustomer) {
//       message.error('Please select a customer');
//       return;
//     }
//     setIsQrPopupVisible(true);
//   };
//
//   const finalizeOrder = async () => {
//     if (cart.length === 0 || !selectedCustomer) return;
//
//     setIsSubmitting(true);
//     try {
//       const orderPayload = {
//         order_status: 'pending',
//         service: 'take-away',
//         payment_channel: 'qr_promptpay',
//         customer_id: selectedCustomer,
//       };
//       const orderResponse = await createOrder(orderPayload);
//       const orderId = orderResponse.responseObject.id;
//
//       if (!orderId) {
//         throw new Error('Failed to create order and get an order ID.');
//       }
//
//       const orderListPromises = cart.map(item => {
//         const orderListPayload = {
//           order_id: orderId,
//           menu_id: item.id,
//           price: Number(item.price),
//           quantity: item.quantity,
//           status: 'active',
//           remark: item.notes,
//         };
//         return createOrderList(orderListPayload);
//       });
//
//       await Promise.all(orderListPromises);
//
//       message.success(`Order placed successfully!`);
//       clearOrder();
//
//     } catch (error: any) {
//       message.error('Failed to place order: ' + error.message);
//     } finally {
//       setIsSubmitting(false);
//       setIsQrPopupVisible(false);
//     }
//   };
//
//   return (
//     <Layout style={{ background: 'transparent' }}>
//       <Content>
//         <Row gutter={16}>
//           <Col span={16}>
//             <Card loading={loading}>
//               <Tabs defaultActiveKey={categories[0]?.id}>
//                 {categories.map(cat => (
//                   <TabPane tab={cat.category_name} key={cat.id}>
//                     <Row gutter={[16, 16]}>
//                       {products.filter(p => p.category_id === cat.id).map(p => (
//                         <Col key={p.id} xs={12} sm={8} md={6}>
//                           <Card
//                             hoverable
//                             onClick={() => addToCart(p)}
//                           >
//                             <Card.Meta title={p.name} description={`${p.price} THB`} />
//                           </Card>
//                         </Col>
//                       ))}
//                     </Row>
//                   </TabPane>
//                 ))}
//               </Tabs>
//             </Card>
//           </Col>
//
//           <Col span={8}>
//             <Card title="Current Order">
//               <div style={{ marginBottom: 16 }}>
//                 <Select
//                   showSearch
//                   value={selectedCustomer}
//                   style={{ width: '100%' }}
//                   placeholder="Select or create a customer"
//                   onChange={(value) => setSelectedCustomer(value)}
//                   filterOption={(input, option) =>
//                     (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
//                   }
//                   dropdownRender={menu => (
//                     <>
//                       {menu}
//                       <Divider style={{ margin: '8px 0' }} />
//                       <Space style={{ padding: '0 8px 4px' }}>
//                         <Input
//                           placeholder="New customer name"
//                           value={newCustomerName}
//                           onChange={(e) => setNewCustomerName(e.target.value)}
//                         />
//                         <Input
//                           placeholder="New customer phone"
//                           value={newCustomerPhone}
//                           onChange={(e) => setNewCustomerPhone(e.target.value)}
//                         />
//                         <Button type="text" icon={<UserAddOutlined />} onClick={handleAddCustomer}>
//                           Add
//                         </Button>
//                       </Space>
//                     </>
//                   )}
//                 >
//                   {customers.map(c => <Option key={c.id} value={c.id}>{c.customer_name}</Option>)}
//                 </Select>
//               </div>
//               <List
//                 dataSource={cart}
//                 renderItem={item => (
//                   <List.Item
//                     actions={[
//                       <Button size="small" icon={<MinusOutlined />} onClick={() => updateQuantity(item.id, -1)} />,
//                       <span style={{ margin: '0 8px' }}>{item.quantity}</span>,
//                       <Button size="small" icon={<PlusOutlined />} onClick={() => updateQuantity(item.id, 1)} />
//                     ]}
//                   >
//                     <List.Item.Meta
//                       avatar={<Avatar src={'/images/pos/placeholder.png'} />}
//                       title={item.name}
//                       description={
//                         <>
//                           <p>{`${item.price} THB`}</p>
//                           <Input.TextArea
//                             placeholder="Add notes (e.g., less sweet, no ice)"
//                             value={item.notes}
//                             onChange={(e) => handleNoteChange(item.id, e.target.value)}
//                             autoSize={{ minRows: 1, maxRows: 3 }}
//                             style={{ marginTop: '8px' }}
//                           />
//                         </>
//                       }
//                     />
//                   </List.Item>
//                 )}
//               />
//               <div style={{ marginTop: '16px', textAlign: 'right' }}>
//                 <Statistic title="Total" value={total} precision={2} suffix="THB" />
//               </div>
//               <Row gutter={8} style={{ marginTop: '16px' }}>
//                 <Col span={12}>
//                   <Popconfirm
//                     title="Are you sure you want to clear the order?"
//                     onConfirm={clearOrder}
//                     okText="Yes"
//                     cancelText="No"
//                     disabled={cart.length === 0 || isSubmitting}
//                   >
//                     <Button danger block icon={<DeleteOutlined />} disabled={cart.length === 0 || isSubmitting}>
//                       Clear
//                     </Button>
//                   </Popconfirm>
//                 </Col>
//                 <Col span={12}>
//                   <Button type="primary" block size="large" onClick={handlePlaceOrderClick} loading={isSubmitting} disabled={cart.length === 0}>
//                     Place Order
//                   </Button>
//                 </Col>
//               </Row>
//             </Card>
//           </Col>
//         </Row>
//       </Content>
//       {isQrPopupVisible && (
//         <QRCodePopup
//           amount={total}
//           onClose={() => setIsQrPopupVisible(false)}
//           onPaymentSuccess={finalizeOrder}
//         />
//       )}
//     </Layout>
//   );
// };
//
// export default TakeOrderPage;
import React, { useState, useEffect } from "react";
import {
  Layout,
  Collapse,
  Select,
  Input,
  Button,
  Popconfirm,
  message,
  Divider,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  UserAddOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import {
  getCategories,
  getMenus,
  getCustomers,
  createOrder,
  createOrderList,
  createCustomer,
} from "../../api";
import QRCodePopup from "../../components/common/QRCodePopup";

const { Content } = Layout;
const { Panel } = Collapse;
const { Option } = Select;

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

const TakeOrderPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>();
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQrPopupVisible, setIsQrPopupVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qr_promptpay">(
    "cash"
  );

  // Fetch data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [cat, prod, cust] = await Promise.all([
        getCategories(),
        getMenus(),
        getCustomers(),
      ]);
      setCategories(cat.responseObject || []);
      setProducts(prod.responseObject || []);
      setCustomers(cust.responseObject || []);
      setLoading(false);
    };
    load();
  }, []);

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.id === p.id);
      if (exist)
        return prev.map((i) =>
          i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const updateQty = (id: string, change: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === id
            ? { ...i, quantity: Math.max(0, i.quantity + change) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName || !newCustomerPhone)
      return message.error("กรุณากรอกข้อมูลลูกค้า");

    try {
      const res = await createCustomer({
        customer_name: newCustomerName,
        customer_phone: newCustomerPhone,
      });

      message.success("เพิ่มลูกค้าเรียบร้อย");
      const cust = await getCustomers();
      setCustomers(cust.responseObject || []);
      setSelectedCustomer(res.responseObject.id);

      setNewCustomerName("");
      setNewCustomerPhone("");
    } catch (error: any) {
      message.error("Failed to create customer: " + error.message);
    }
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const clearOrder = () => {
    setCart([]);
    setSelectedCustomer(undefined);
    message.info("ล้างออเดอร์แล้ว");
  };

  const finalizeOrder = async (
    paymentChannel: "cash" | "qr_promptpay"
  ) => {
    if (cart.length === 0 || !selectedCustomer) return;

    setIsSubmitting(true);
    try {
      const orderPayload = {
        order_status: "pending",
        service: "take-away",
        payment_channel: paymentChannel,
        customer_id: selectedCustomer,
      };
      const orderResponse = await createOrder(orderPayload);
      const orderId = orderResponse.responseObject.id;

      if (!orderId) {
        throw new Error("Failed to create order and get an order ID.");
      }

      const orderListPromises = cart.map((item) => {
        const orderListPayload = {
          order_id: orderId,
          menu_id: item.id,
          price: Number(item.price),
          quantity: item.quantity,
          status: "active",
          remark: item.notes,
        };
        return createOrderList(orderListPayload);
      });

      await Promise.all(orderListPromises);

      message.success(`บันทึกออเดอร์เรียบร้อยแล้ว!`);
      clearOrder();
    } catch (error: any) {
      message.error("เกิดข้อผิดพลาดในการบันทึกออเดอร์: " + error.message);
    } finally {
      setIsSubmitting(false);
      setIsQrPopupVisible(false);
    }
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      message.error("ไม่สามารถสร้างออเดอร์ที่ว่างเปล่าได้");
      return;
    }
    if (!selectedCustomer) {
      message.error("กรุณาเลือกลูกค้า");
      return;
    }

    if (paymentMethod === "qr_promptpay") {
      setIsSubmitting(true); // Start loading
      setTimeout(() => {
        setIsSubmitting(false); // Stop loading after a delay
        setIsQrPopupVisible(true); // Then show the popup
      }, 500); // 0.5-second delay to simulate processing
    } else {
      finalizeOrder("cash");
    }
  };

  return (
    <Layout className="bg-[#F8F5EE] min-h-screen p-6 font-[Kanit]">
      <Content>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT: MENU */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="text-xl font-semibold mb-4">รายการสินค้า</h2>

              <Collapse accordion className="bg-transparent" loading={loading}>
                {categories.map((c) => (
                  <Panel
                    header={
                      <span className="text-lg font-medium text-brown-700">
                        {c.category_name}
                      </span>
                    }
                    key={c.id}
                    className="bg-[#E7DCC8] rounded-lg mb-2 border-none"
                  >
                    <div className="space-y-3 mt-3">
                      {products
                        .filter((p) => p.category_id === c.id)
                        .map((p) => (
                          <div
                            key={p.id}
                            className="flex justify-between items-center bg-white shadow-sm p-3 rounded-xl hover:shadow-md transition cursor-pointer"
                            onClick={() => addToCart(p)}
                          >
                            <div>
                              <div className="text-base font-medium">
                                {p.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {p.price} THB
                              </div>
                            </div>

                            <Button
                              type="primary"
                              className="bg-blue-600 rounded-lg px-3"
                            >
                              เพิ่มรายการ
                            </Button>
                          </div>
                        ))}
                    </div>
                  </Panel>
                ))}
              </Collapse>
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div>
            <div className="bg-white rounded-2xl shadow p-5">
              <h2 className="text-xl font-semibold mb-3">ออเดอร์ปัจจุบัน</h2>

              {/* Customer */}
              <Select
                showSearch
                placeholder="เลือกลูกค้า"
                value={selectedCustomer}
                onChange={setSelectedCustomer}
                className="w-full mb-4"
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider />
                    <div className="px-3 pb-2">
                      <Input
                        placeholder="ชื่อลูกค้าใหม่"
                        className="mb-2"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                      />
                      <Input
                        placeholder="เบอร์โทร"
                        className="mb-2"
                        value={newCustomerPhone}
                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                      />
                      <Button
                        icon={<UserAddOutlined />}
                        type="primary"
                        onClick={handleAddCustomer}
                        block
                      >
                        เพิ่มลูกค้า
                      </Button>
                    </div>
                  </>
                )}
              >
                {customers.map((c) => (
                  <Option key={c.id} value={c.id}>
                    {c.customer_name}
                  </Option>
                ))}
              </Select>

              {/* Order List */}
              <div className="space-y-3 max-h-[400px] overflow-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#FAFAFA] rounded-xl px-3 py-2 shadow-sm"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{item.name}</div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full"
                          onClick={() => updateQty(item.id, -1)}
                        >
                          <MinusOutlined />
                        </button>
                        <span className="w-6 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          className="w-8 h-8 flex items-center justify-center bg-green-600 text-white rounded-full"
                          onClick={() => updateQty(item.id, 1)}
                        >
                          <PlusOutlined />
                        </button>
                      </div>
                    </div>

                    <div className="mt-1 text-sm text-gray-500">
                      {item.price * item.quantity} THB
                    </div>

                    <Input.TextArea
                      className="mt-2 rounded-lg"
                      autoSize={{ minRows: 1, maxRows: 2 }}
                      placeholder="หมายเหตุ เช่น หวานน้อย ไม่ใส่น้ำแข็ง"
                      value={item.notes}
                      onChange={(e) =>
                        setCart((prev) =>
                          prev.map((i) =>
                            i.id === item.id
                              ? { ...i, notes: e.target.value }
                              : i
                          )
                        )
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-5">
                <Statistic
                  title={<span className="text-lg">รวมทั้งหมด</span>}
                  value={total}
                  precision={2}
                  suffix="THB"
                  valueStyle={{ fontSize: 24, fontWeight: 600 }}
                />
              </div>

              {/* Payment Method */}
              <div className="mt-4">
                <h3 className="text-base font-medium mb-2">วิธีชำระเงิน</h3>
                <div className="relative w-full h-12 bg-gray-200 rounded-full flex items-center cursor-pointer">
                  {/* Sliding background */}
                  <div
                    className={`absolute top-0 left-0 w-1/2 h-full p-1 transition-transform duration-300 ease-in-out ${
                      paymentMethod === "qr_promptpay"
                        ? "translate-x-full"
                        : "translate-x-0"
                    }`}
                  >
                    <div className="w-full h-full bg-white rounded-full shadow-md"></div>
                  </div>

                  {/* Cash Option */}
                  <div
                    className="w-1/2 h-full relative z-10 flex items-center justify-center"
                    onClick={() => setPaymentMethod("cash")}
                  >
                    <span
                      className={`font-semibold transition-colors duration-300 ${
                        paymentMethod === "cash"
                          ? "text-gray-800"
                          : "text-gray-500"
                      }`}
                    >
                      เงินสด
                    </span>
                  </div>

                  {/* Scan to Pay Option */}
                  <div
                    className="w-1/2 h-full relative z-10 flex items-center justify-center"
                    onClick={() => setPaymentMethod("qr_promptpay")}
                  >
                    <span
                      className={`font-semibold transition-colors duration-300 ${
                        paymentMethod === "qr_promptpay"
                          ? "text-gray-800"
                          : "text-gray-500"
                      }`}
                    >
                      สแกนจ่าย
                    </span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Popconfirm
                  title="ล้างออเดอร์?"
                  onConfirm={clearOrder}
                  okText="ใช่"
                  cancelText="ไม่"
                  disabled={cart.length === 0 || isSubmitting}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    className="h-12 text-base"
                    disabled={cart.length === 0 || isSubmitting}
                  >
                    ล้าง
                  </Button>
                </Popconfirm>

                <Button
                  type="primary"
                  className="h-12 bg-green-600 text-base"
                  onClick={handlePlaceOrder}
                  loading={isSubmitting}
                  disabled={cart.length === 0 || isSubmitting}
                >
                  บันทึกออเดอร์
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Content>
      {isQrPopupVisible && (
        <QRCodePopup
          amount={total}
          onClose={() => setIsQrPopupVisible(false)}
          onPaymentSuccess={() => finalizeOrder("qr_promptpay")}
        />
      )}
    </Layout>
  );
};

export default TakeOrderPage;

