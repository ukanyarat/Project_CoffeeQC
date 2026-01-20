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
  Statistic,
  Card,
  Badge,
} from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  UserAddOutlined,
  DeleteOutlined,
  SearchOutlined,
  CoffeeOutlined,
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
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qr_promptpay">(
    "cash"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

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

  // Filter products based on search term and active category
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter((p) => p.category_id === activeCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search)
      );
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
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  เมนูทั้งหมด
                </h2>
                <Badge
                  count={filteredProducts.length}
                  showZero
                  style={{ backgroundColor: "#52c41a" }}
                />
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <Input
                  size="large"
                  placeholder="ค้นหาเมนู..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl"
                  allowClear
                />
              </div>

              {/* Category Tabs */}
              <Tabs
                activeKey={activeCategory}
                onChange={setActiveCategory}
                className="menu-tabs"
                items={[
                  {
                    key: "all",
                    label: (
                      <span className="flex items-center gap-2">
                        <CoffeeOutlined />
                        ทั้งหมด
                      </span>
                    ),
                  },
                  ...categories.map((c) => ({
                    key: c.id,
                    label: c.category_name,
                  })),
                ]}
              />

              {/* Products Grid */}
              {loading ? (
                <div className="text-center py-20 text-gray-500">
                  กำลังโหลด...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  ไม่พบเมนูที่ค้นหา
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {filteredProducts.map((p) => (
                    <Card
                      key={p.id}
                      hoverable
                      className="rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-400 transition-all duration-300"
                      onClick={() => addToCart(p)}
                      cover={
                        <div className="h-40 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative overflow-hidden">
                          <img
                            alt={p.name}
                            src={p.image_url || `https://coffee.alexflipnote.dev/random?t=${p.id}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to coffee icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (target.nextElementSibling) {
                                (target.nextElementSibling as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                          <div className="hidden flex-col items-center justify-center absolute inset-0 bg-gradient-to-br from-orange-100 to-amber-100">
                            <CoffeeOutlined className="text-6xl text-amber-600 opacity-50" />
                            <span className="text-xs text-gray-400 mt-2">
                              ไม่สามารถโหลดรูปได้
                            </span>
                          </div>
                        </div>
                      }
                    >
                      <div className="p-2">
                        <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-1">
                          {p.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">
                            ฿{p.price}
                          </span>
                          <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            className="bg-blue-500 hover:bg-blue-600 rounded-lg"
                          >
                            เพิ่ม
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-5 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  ออเดอร์ปัจจุบัน
                </h2>
                <Badge
                  count={cart.reduce((sum, item) => sum + item.quantity, 0)}
                  showZero
                  style={{ backgroundColor: "#1890ff" }}
                />
              </div>

              {/* Customer */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ลูกค้า
                </label>
                <Select
                  showSearch
                  placeholder="เลือกลูกค้า"
                  value={selectedCustomer}
                  onChange={setSelectedCustomer}
                  className="w-full"
                  size="large"
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider className="my-2" />
                      <div className="px-3 pb-2">
                        <div className="text-sm font-semibold mb-2 text-gray-700">
                          เพิ่มลูกค้าใหม่
                        </div>
                        <Input
                          placeholder="ชื่อลูกค้าใหม่"
                          className="mb-2"
                          value={newCustomerName}
                          onChange={(e) => setNewCustomerName(e.target.value)}
                        />
                        <Input
                          placeholder="เบอร์โทร"
                          className="mb-2"
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
                          className="bg-blue-500"
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

              <Divider className="my-4" />

              {/* Order List */}
              {cart.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <CoffeeOutlined className="text-5xl mb-3 opacity-30" />
                  <p>ยังไม่มีรายการในตะกร้า</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-auto pr-2 mb-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl px-4 py-3 shadow-sm border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            ฿{item.price} × {item.quantity} = ฿
                            {item.price * item.quantity}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          <button
                            className="w-7 h-7 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            onClick={() => updateQty(item.id, -1)}
                          >
                            <MinusOutlined className="text-xs" />
                          </button>
                          <span className="w-8 text-center font-bold text-gray-700">
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
                        className="mt-2 rounded-lg text-sm"
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
              )}

              <Divider className="my-4" />

              {/* Total */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-700">
                    ยอดรวมทั้งหมด
                  </span>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      ฿{total.toFixed(2)}
                    </div>
                    {cart.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                        รายการ
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-5">
                <h3 className="text-sm font-semibold mb-3 text-gray-700">
                  วิธีชำระเงิน
                </h3>
                <div className="relative w-full h-12 bg-gray-200 rounded-full flex items-center cursor-pointer shadow-inner">
                  {/* Sliding background */}
                  <div
                    className={`absolute top-0 left-0 w-1/2 h-full p-1 transition-transform duration-300 ease-in-out ${paymentMethod === "qr_promptpay"
                      ? "translate-x-full"
                      : "translate-x-0"
                      }`}
                  >
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg"></div>
                  </div>

                  {/* Cash Option */}
                  <div
                    className="w-1/2 h-full relative z-10 flex items-center justify-center"
                    onClick={() => setPaymentMethod("cash")}
                  >
                    <span
                      className={`font-semibold transition-colors duration-300 ${paymentMethod === "cash"
                        ? "text-white"
                        : "text-gray-600"
                        }`}
                    >
                      💵 เงินสด
                    </span>
                  </div>

                  {/* Scan to Pay Option */}
                  <div
                    className="w-1/2 h-full relative z-10 flex items-center justify-center"
                    onClick={() => setPaymentMethod("qr_promptpay")}
                  >
                    <span
                      className={`font-semibold transition-colors duration-300 ${paymentMethod === "qr_promptpay"
                        ? "text-white"
                        : "text-gray-600"
                        }`}
                    >
                      📱 สแกนจ่าย
                    </span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Popconfirm
                  title="ล้างออเดอร์?"
                  description="คุณแน่ใจหรือว่าต้องการล้างรายการทั้งหมด?"
                  onConfirm={clearOrder}
                  okText="ใช่"
                  cancelText="ไม่"
                  disabled={cart.length === 0 || isSubmitting}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    className="h-14 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                    disabled={cart.length === 0 || isSubmitting}
                    size="large"
                  >
                    ล้าง
                  </Button>
                </Popconfirm>

                <Button
                  type="primary"
                  className="h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all border-0"
                  onClick={handlePlaceOrder}
                  loading={isSubmitting}
                  disabled={cart.length === 0 || isSubmitting}
                  size="large"
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

