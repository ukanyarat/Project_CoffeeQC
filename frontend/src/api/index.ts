const API_BASE_URL = 'http://localhost:3000/v1';

const api = {
  async post(endpoint: string, body: any) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include', // Send cookies with the request
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    }
    return response.json();
  },

  async get(endpoint: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
      credentials: 'include', // Send cookies with the request
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    }
    return response.json();
  },

  async patch(endpoint: string, body: any) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
      credentials: 'include', // Send cookies with the request
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    }
    return response.json();
  },

  async delete(endpoint: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
      credentials: 'include', // Send cookies with the request
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    }
    return response.json();
  },
};

// --- API Functions ---

// Auth
export const login = (credentials: any) => api.post('/user/login', credentials);
export const logout = () => api.get('/user/logout');

// Data Fetching
export const getCategories = () => api.get('/category/getNoPaginate');
export const getMenus = () => api.get('/menu/getNoPaginate');
export const getCustomers = () => api.get('/customer/getNoPaginate');
export const getOrders = (params?: { date?: string }) => {
  const query = params?.date ? `?date=${params.date}` : '';
  return api.get(`/order/get${query}`);
};
export const getOrderLists = (params?: { orderId?: string }) => {
  const query = params?.orderId ? `?orderId=${params.orderId}` : '';
  return api.get(`/orderList/get${query}`);
};

// Data Creation
export const createOrder = (orderData: any) => api.post('/order/create', orderData);
export const createOrderList = (orderListData: any) => api.post('/orderList/create', orderListData);
export const createCustomer = (customerData: any) => api.post('/customer/create', customerData);
export const updateCustomer = (customerData: any) => api.patch('/customer/update', customerData);
export const deleteCustomer = (id: string) => api.delete(`/customer/delete/${id}`);
export const createMenu = (menuData: any) => api.post('/menu/create', { ...menuData, status: menuData.status || 'available' });
export const updateMenu = (menuData: any) => api.patch('/menu/update', menuData);
export const deleteMenu = (id: string) => api.delete(`/menu/delete/${id}`);

// User/Employee APIs
export const getUsers = () => api.get('/user/getNoPaginate');
export const createUser = (userData: any) => api.post('/user/register', userData);
export const updateUser = (userData: any) => api.patch('/user/update', userData);
export const deleteUser = (id: string) => api.delete(`/user/delete/${id}`);

// Role APIs
export const getRoles = () => api.get('/role/getNoPaginate');
