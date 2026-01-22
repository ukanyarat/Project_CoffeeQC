import React, { useState, useEffect, useMemo } from "react";
import {
  Layout,
  Tabs,
  Select,
  Input,
  Button,
  Popconfirm,
  message,
  Divider,
  Card,
  Badge,
  Typography,
  Empty,
  Spin,
} from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  UserAddOutlined,
  DeleteOutlined,
  SearchOutlined,
  CoffeeOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
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
const { Option } = Select;
const { Title, Text } = Typography;

interface Category {
  id: string;
  category_name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category_id: string;
  image_url?: string;
  type?: string;
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
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qr_promptpay">("cash");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

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

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (activeCategory !== "all") {
      filtered = filtered.filter((p) => p.category_id === activeCategory);
    }
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(search));
    }
    return filtered;
  }, [products, activeCategory, searchTerm]);

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
          i.id === id ? { ...i, quantity: Math.max(0, i.quantity + change) } : i
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
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const clearOrder = () => {
    setCart([]);
    setSelectedCustomer(undefined);
    message.info("ล้างออเดอร์แล้ว");
  };

  const finalizeOrder = async (paymentChannel: "cash" | "qr_promptpay") => {
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
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsQrPopupVisible(true);
      }, 500);
    } else {
      finalizeOrder("cash");
    }
  };

  return (
    <Layout className="bg-coffee-cream min-h-screen p-4 md:p-6">
      <Content>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: MENU */}
          <div className="lg:col-span-2">
            <Card
              className="!rounded-2xl !shadow-coffee-md"
              styles={{ body: { padding: '24px' } }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-coffee-gradient flex items-center justify-center">
                    <CoffeeOutlined className="text-xl text-white" />
                  </div>
                  <div>
                    <Title level={4} className="!mb-0 !text-coffee-espresso">
                      เมนูทั้งหมด
                    </Title>
                    <Text className="text-brand-text-secondary text-sm">
                      เลือกเมนูเพื่อเพิ่มในออเดอร์
                    </Text>
                  </div>
                </div>
                <Badge
                  count={filteredProducts.length}
                  showZero
                  style={{ backgroundColor: '#6F4E37' }}
                />
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <Input
                  size="large"
                  placeholder="ค้นหาเมนู..."
                  prefix={<SearchOutlined className="text-coffee-light-roast" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="!rounded-xl !h-12"
                  allowClear
                />
              </div>

              {/* Category Tabs */}
              <Tabs
                activeKey={activeCategory}
                onChange={setActiveCategory}
                className="coffee-tabs"
                items={[
                  {
                    key: "all",
                    label: (
                      <span className="flex items-center gap-2 font-medium">
                        <CoffeeOutlined />
                        ทั้งหมด
                      </span>
                    ),
                  },
                  ...categories.map((c) => ({
                    key: c.id,
                    label: <span className="font-medium">{c.category_name}</span>,
                  })),
                ]}
              />

              {/* Products Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Spin size="large" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <Empty
                  description="ไม่พบเมนูที่ค้นหา"
                  className="py-20"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                  {filteredProducts.map((p) => {
                    const cartItem = cart.find((i) => i.id === p.id);
                    return (
                      <div
                        key={p.id}
                        className={`product-card cursor-pointer relative ${
                          cartItem ? '!border-coffee-medium-roast' : ''
                        }`}
                        onClick={() => addToCart(p)}
                      >
                        {/* Quantity Badge */}
                        {cartItem && (
                          <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-coffee-medium-roast text-white flex items-center justify-center font-bold text-sm shadow-md">
                            {cartItem.quantity}
                          </div>
                        )}

                        {/* Image */}
                        <div className="product-card-image">
                          <img
                            alt={p.name}
                            src={p.image_url || `https://coffee.alexflipnote.dev/random?t=${p.id}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (target.nextElementSibling) {
                                (target.nextElementSibling as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                          <div className="hidden flex-col items-center justify-center absolute inset-0 bg-coffee-gradient-light">
                            <CoffeeOutlined className="text-5xl text-coffee-crema" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="product-card-content">
                          <h3 className="text-sm font-semibold text-coffee-espresso mb-2 line-clamp-2 min-h-[40px]">
                            {p.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="product-card-price">
                              ฿{p.price}
                            </span>
                            <Button
                              type="primary"
                              size="small"
                              icon={<PlusOutlined />}
                              className="!rounded-lg !h-8"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div>
            <Card
              className="!rounded-2xl !shadow-coffee-lg sticky top-6"
              styles={{ body: { padding: '20px' } }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                    <ShoppingCartOutlined className="text-lg text-white" />
                  </div>
                  <div>
                    <Title level={5} className="!mb-0 !text-coffee-espresso">
                      ออเดอร์ปัจจุบัน
                    </Title>
                  </div>
                </div>
                <Badge
                  count={totalItems}
                  showZero
                  style={{ backgroundColor: '#0EA5E9' }}
                />
              </div>

              {/* Customer Select */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-coffee-dark-roast mb-2">
                  ลูกค้า
                </label>
                <Select
                  showSearch
                  placeholder="เลือกลูกค้า"
                  value={selectedCustomer}
                  onChange={setSelectedCustomer}
                  className="w-full"
                  size="large"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider className="!my-2" />
                      <div className="px-3 pb-3">
                        <div className="text-sm font-semibold mb-2 text-coffee-dark-roast">
                          เพิ่มลูกค้าใหม่
                        </div>
                        <Input
                          placeholder="ชื่อลูกค้าใหม่"
                          className="mb-2 !rounded-lg"
                          value={newCustomerName}
                          onChange={(e) => setNewCustomerName(e.target.value)}
                        />
                        <Input
                          placeholder="เบอร์โทร"
                          className="mb-2 !rounded-lg"
                          type="number"
                          maxLength={10}
                          value={newCustomerPhone}
                          onChange={(e) => setNewCustomerPhone(e.target.value)}
                        />
                        <Button
                          icon={<UserAddOutlined />}
                          type="primary"
                          onClick={handleAddCustomer}
                          block
                          className="!rounded-lg"
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
              </div>

              <Divider className="!my-4" />

              {/* Order List */}
              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 mx-auto rounded-full bg-coffee-latte flex items-center justify-center mb-4">
                    <CoffeeOutlined className="text-3xl text-coffee-crema" />
                  </div>
                  <Text className="text-brand-text-muted">
                    ยังไม่มีรายการในตะกร้า
                  </Text>
                </div>
              ) : (
                <div className="space-y-3 max-h-[320px] overflow-auto pr-1 mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="order-item">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-semibold text-coffee-espresso text-sm truncate">
                            {item.name}
                          </div>
                          <div className="text-xs text-brand-text-secondary mt-1">
                            ฿{item.price} x {item.quantity} = <span className="font-semibold text-coffee-medium-roast">฿{item.price * item.quantity}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            className="w-7 h-7 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            onClick={() => updateQty(item.id, -1)}
                          >
                            <MinusOutlined className="text-xs" />
                          </button>
                          <span className="w-8 text-center font-bold text-coffee-espresso text-sm">
                            {item.quantity}
                          </span>
                          <button
                            className="w-7 h-7 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            onClick={() => updateQty(item.id, 1)}
                          >
                            <PlusOutlined className="text-xs" />
                          </button>
                        </div>
                      </div>

                      <Input.TextArea
                        className="!mt-2 !rounded-lg !text-xs"
                        autoSize={{ minRows: 1, maxRows: 2 }}
                        placeholder="หมายเหตุ เช่น หวานน้อย"
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
              )}

              <Divider className="!my-4" />

              {/* Total */}
              <div className="order-total mb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarOutlined className="text-xl" />
                    <span className="text-base font-medium">ยอดรวมทั้งหมด</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ฿{total.toFixed(2)}
                    </div>
                    {cart.length > 0 && (
                      <div className="text-xs opacity-80">{totalItems} รายการ</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold mb-3 text-coffee-dark-roast">
                  วิธีชำระเงิน
                </h3>
                <div className="payment-toggle">
                  <div
                    className={`payment-toggle-slider ${
                      paymentMethod === "qr_promptpay" ? "translate-x-full" : ""
                    }`}
                    style={{ left: '4px' }}
                  />
                  <div
                    className={`payment-toggle-option ${
                      paymentMethod === "cash" ? "active" : ""
                    }`}
                    onClick={() => setPaymentMethod("cash")}
                  >
                    <span className="text-sm">เงินสด</span>
                  </div>
                  <div
                    className={`payment-toggle-option ${
                      paymentMethod === "qr_promptpay" ? "active" : ""
                    }`}
                    onClick={() => setPaymentMethod("qr_promptpay")}
                  >
                    <span className="text-sm">สแกนจ่าย</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Popconfirm
                  title="ล้างออเดอร์?"
                  description="คุณแน่ใจหรือว่าต้องการล้างรายการทั้งหมด?"
                  onConfirm={clearOrder}
                  okText="ใช่"
                  cancelText="ไม่"
                  disabled={cart.length === 0 || isSubmitting}
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    className="!h-12 !text-sm !font-semibold !rounded-xl"
                    disabled={cart.length === 0 || isSubmitting}
                    size="large"
                  >
                    ล้าง
                  </Button>
                </Popconfirm>

                <Button
                  type="primary"
                  className="!h-12 !text-sm !font-semibold !rounded-xl"
                  style={{
                    background: cart.length === 0 ? undefined : 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                    border: 'none',
                  }}
                  onClick={handlePlaceOrder}
                  loading={isSubmitting}
                  disabled={cart.length === 0 || isSubmitting}
                  size="large"
                >
                  บันทึกออเดอร์
                </Button>
              </div>
            </Card>
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
