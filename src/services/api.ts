import { MenuItem, Order, Customer, RestaurantStats, RestaurantSettings, OrderStatus } from '../types';
import { INITIAL_MENU_ITEMS } from '../data/initialMenu';
import { DEMO_ORDERS, DEMO_CUSTOMERS } from '../data/initialOrders';

const API_BASE = '/api';

export const api = {
  // --- MENU ---
  async getMenu(): Promise<MenuItem[]> {
    try {
      const res = await fetch(`${API_BASE}/menu`);
      if (!res.ok) throw new Error('Failed to fetch menu');
      return await res.json();
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  },

  async addMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const res = await fetch(`${API_BASE}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to create menu item');
    return await res.json();
  },

  async updateMenuItem(item: MenuItem): Promise<MenuItem> {
    const res = await fetch(`${API_BASE}/menu/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update menu item');
    return await res.json();
  },

  async deleteMenuItem(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return await res.json();
    } catch {
      return DEMO_ORDERS;
    }
  },

  async createOrder(payload: {
    customer: { id?: string; name: string; mobile: string; tableNumber?: string };
    items: Order['items'];
    subtotal: number;
    tax: number;
    grandTotal: number;
    specialInstructions?: string;
  }): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Order submission failed' }));
      throw new Error(err.error || 'Failed to place order');
    }
    return await res.json();
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return await res.json();
  },

  // --- AUTH ---
  async customerLogin(payload: {
    name: string;
    address: string;
    mobile: string;
    tableNumber?: string;
  }): Promise<{ customer: Customer; token: string }> {
    const res = await fetch(`${API_BASE}/auth/customer-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Customer login failed');
    }
    return await res.json();
  },

  async adminLogin(username: string, password: string): Promise<{ token: string; user: { role: string; name: string } }> {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Invalid admin credentials' }));
      throw new Error(err.error || 'Admin authentication failed');
    }
    return await res.json();
  },

  // --- ADMIN DATA ---
  async getAdminStats(): Promise<RestaurantStats> {
    try {
      const res = await fetch(`${API_BASE}/admin/statistics`);
      if (!res.ok) throw new Error('Failed to fetch statistics');
      return await res.json();
    } catch {
      return {
        totalOrders: 28,
        pendingOrders: 1,
        preparingOrders: 1,
        readyOrders: 1,
        completedOrders: 25,
        todayRevenue: 48650,
        totalCustomers: 142,
        popularItems: [
          { name: 'Butter Chicken', count: 46, revenue: 23920 },
          { name: 'Hyderabadi Chicken Biryani', count: 38, revenue: 18240 },
          { name: 'Ghee Roast Dosa', count: 32, revenue: 8960 },
          { name: 'Garlic Naan', count: 78, revenue: 10920 }
        ]
      };
    }
  },

  async getAdminCustomers(): Promise<Customer[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/customers`);
      if (!res.ok) throw new Error('Failed to fetch customers');
      return await res.json();
    } catch {
      return DEMO_CUSTOMERS;
    }
  },

  async getSettings(): Promise<RestaurantSettings> {
    try {
      const res = await fetch(`${API_BASE}/admin/settings`);
      if (!res.ok) throw new Error('Failed to fetch settings');
      return await res.json();
    } catch {
      return {
        restaurantName: 'AURELIA GRAND',
        tagline: 'Where Culinary Art Meets Luxury',
        gstRate: 0.05,
        openingHours: '12:00 PM – 11:30 PM (Daily)',
        contactNumber: '+91 63834 41561',
        contactEmail: 'concierge@aureliagrand.com',
        address: 'Level 24, The Grand Pavilion, Vittal Mallya Road, Bengaluru 560001',
        isOnlineOrderingOpen: true,
        soundAlertsEnabled: true,
      };
    }
  },

  async updateSettings(settings: Partial<RestaurantSettings>): Promise<RestaurantSettings> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return await res.json();
  }
};

export const fetchMenu = () => api.getMenu();
export const fetchOrders = () => api.getOrders();
export const fetchStats = () => api.getAdminStats();
export const fetchSettings = () => api.getSettings();
export const createOrder = (payload: Parameters<typeof api.createOrder>[0]) => api.createOrder(payload);
export const updateOrderStatusApi = (orderId: string, status: OrderStatus) => api.updateOrderStatus(orderId, status);
export const customerLoginApi = async (payload: {
  name: string;
  address: string;
  mobile: string;
  tableNumber?: string;
} | string, name?: string, address?: string) => {
  const reqPayload = typeof payload === 'string'
    ? { mobile: payload, name: name || '', address: address || '' }
    : payload;
  const res = await api.customerLogin(reqPayload);
  return res.customer;
};
export const createMenuItemApi = (item: Omit<MenuItem, 'id'>) => api.addMenuItem(item);
export const updateMenuItemApi = (item: MenuItem) => api.updateMenuItem(item);
export const deleteMenuItemApi = (id: string) => api.deleteMenuItem(id);
export const updateSettingsApi = (settings: Partial<RestaurantSettings>) => api.updateSettings(settings);
