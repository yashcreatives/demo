import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, Order, Customer, RestaurantStats, RestaurantSettings, OrderItem, OrderStatus } from './types';
import { INITIAL_MENU_ITEMS } from './data/initialMenu';
import { INITIAL_ORDERS, DEMO_CUSTOMERS } from './data/initialOrders';
import {
  fetchMenu,
  fetchOrders,
  fetchStats,
  fetchSettings,
  createOrder,
  updateOrderStatusApi,
  customerLoginApi,
  createMenuItemApi,
  updateMenuItemApi,
  deleteMenuItemApi,
  updateSettingsApi,
} from './services/api';
import { getSocket, disconnectSocket } from './services/socket';
import { playAdminLoudOrderChime, playOrderReceivedChime, playStatusUpdateChime } from './utils/audio';
import { ChefHat, X, LogOut } from 'lucide-react';

// Components
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { FoodDetailModal } from './components/FoodDetailModal';
import { LiveOrderTracker } from './components/LiveOrderTracker';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { WelcomePortal } from './components/WelcomePortal';

export default function App() {
  // Navigation View: 'portal' | 'customer' | 'admin'
  const [currentView, setCurrentView] = useState<'portal' | 'customer' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      if (search.includes('view=admin') || search.includes('role=admin') || window.location.hash === '#admin') {
        return 'admin';
      }
      if (localStorage.getItem('ag_customer')) {
        return 'customer';
      }
    }
    return 'portal';
  });

  // Core Datasets - Initialized empty (persisting and displaying only real user interactions)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<RestaurantStats>({
    totalOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    completedOrders: 0,
    todayRevenue: 0,
    totalCustomers: 0,
    popularItems: [],
  });

  const [settings, setSettings] = useState<RestaurantSettings>({
    restaurantName: 'AURELIA GRAND',
    tagline: 'Where Culinary Art Meets Luxury',
    currency: '₹',
    gstRate: 0.05,
    isOnlineOrderingOpen: true,
    openingHours: '12:00 PM – 11:30 PM',
    contactNumber: '+91 63834 41561',
    address: 'Level 24, The Grand Pavilion, Vittal Mallya Road, Bengaluru 560001',
  });

  // Customer State & Cart
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(() => {
    const saved = localStorage.getItem('ag_customer');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [cart, setCart] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('ag_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('ag_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return ['item-1', 'item-4', 'item-8'];
  });

  // Admin Auth State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('ag_admin_token') || null;
  });

  // UI Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [selectedFoodDetail, setSelectedFoodDetail] = useState<MenuItem | null>(null);
  const [liveTrackerOrder, setLiveTrackerOrder] = useState<Order | null>(null);
  const [confirmationOrder, setConfirmationOrder] = useState<Order | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
  const [customerStatusToast, setCustomerStatusToast] = useState<{
    orderNumber: string;
    status: OrderStatus;
  } | null>(null);

  // Cart Quantities Lookup Map
  const cartQuantities = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((it) => {
      map[it.menuItemId] = it.quantity;
    });
    return map;
  }, [cart]);

  // Cart Totals
  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, it) => sum + it.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, it) => sum + it.price * it.quantity, 0);
  }, [cart]);

  // Sync Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('ag_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync Favorites to LocalStorage
  useEffect(() => {
    localStorage.setItem('ag_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Sync Customer to LocalStorage
  useEffect(() => {
    if (currentCustomer) {
      localStorage.setItem('ag_customer', JSON.stringify(currentCustomer));
    } else {
      localStorage.removeItem('ag_customer');
    }
  }, [currentCustomer]);

  // Data Loading from Backend
  const loadInitialData = useCallback(async () => {
    try {
      const [fetchedMenu, fetchedOrders, fetchedStats, fetchedSettings] = await Promise.all([
        fetchMenu(),
        fetchOrders(),
        fetchStats(),
        fetchSettings(),
      ]);
      if (fetchedMenu && fetchedMenu.length > 0) setMenuItems(fetchedMenu);
      if (Array.isArray(fetchedOrders)) setOrders(fetchedOrders);
      if (fetchedStats) setStats(fetchedStats);
      if (fetchedSettings) setSettings(fetchedSettings);
    } catch (err) {
      console.warn('Backend initial fetch notice:', err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Continuous High-Speed 2-Second Polling (Guarantees fresh auto-refresh every 2 seconds)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [freshOrders, freshStats] = await Promise.all([
          fetchOrders(),
          fetchStats().catch(() => null),
        ]);

        if (Array.isArray(freshOrders)) {
          setOrders((prev) => {
            const prevSig = prev.map((o) => `${o.id}:${o.status}`).join('|');
            const newSig = freshOrders.map((o) => `${o.id}:${o.status}`).join('|');

            if (prevSig !== newSig) {
              // If new order arrived on admin view, trigger high-volume loud chime
              if (freshOrders.length > prev.length && currentView === 'admin') {
                playAdminLoudOrderChime();
                setNewOrderAlert(freshOrders[0]);
              }

              // Update customer live tracker order if changed
              setLiveTrackerOrder((tracked) => {
                if (!tracked) return null;
                const match = freshOrders.find((o) => o.id === tracked.id);
                if (match && match.status !== tracked.status) {
                  playStatusUpdateChime();
                  setCustomerStatusToast({
                    orderNumber: match.orderNumber,
                    status: match.status,
                  });
                  return match;
                }
                return match || tracked;
              });

              return freshOrders;
            }
            return prev;
          });
        }

        if (freshStats) {
          setStats(freshStats);
        }
      } catch {
        // Handled silently
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentView]);

  // Instant Cross-Tab Sync via BroadcastChannel (0ms real-time latency across tabs)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const channel = new BroadcastChannel('restaurant_orders_channel');
      channel.onmessage = (event) => {
        const data = event.data;
        if (data?.type === 'NEW_ORDER' && data.order) {
          setOrders((prev) => [data.order, ...prev.filter((o) => o.id !== data.order.id)]);
          if (currentView === 'admin') {
            playAdminLoudOrderChime();
            setNewOrderAlert(data.order);
          }
          fetchStats().then((s) => s && setStats(s)).catch(() => {});
        } else if (data?.type === 'ORDER_STATUS_CHANGED') {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === data.orderId ? { ...o, status: data.status, updatedAt: new Date().toISOString() } : o
            )
          );
          setLiveTrackerOrder((prev) => {
            if (prev && (prev.id === data.orderId || prev.orderNumber === data.orderId)) {
              playStatusUpdateChime();
              setCustomerStatusToast({
                orderNumber: prev.orderNumber,
                status: data.status,
              });
              return { ...prev, status: data.status, updatedAt: new Date().toISOString() };
            }
            return prev;
          });
          fetchStats().then((s) => s && setStats(s)).catch(() => {});
        }
      };
      return () => channel.close();
    } catch {
      // Graceful fallback
    }
  }, [currentView]);

  // Socket.IO Real-Time Handlers
  useEffect(() => {
    const socket = getSocket();

    const handleNewOrder = (newOrder: Order) => {
      setOrders((prev) => {
        if (prev.some((o) => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });

      if (currentView === 'admin') {
        playAdminLoudOrderChime();
        setNewOrderAlert(newOrder);
      }

      fetchStats().then((s) => s && setStats(s)).catch(() => {});
    };

    const handleUpdateOrder = (updatedOrder: Order) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );

      setLiveTrackerOrder((prev) => {
        if (prev && prev.id === updatedOrder.id) {
          playStatusUpdateChime();
          setCustomerStatusToast({
            orderNumber: updatedOrder.orderNumber,
            status: updatedOrder.status,
          });
          return updatedOrder;
        }
        return prev;
      });

      fetchStats().then((s) => s && setStats(s)).catch(() => {});
    };

    socket.on('order:new', handleNewOrder);
    socket.on('new_order', handleNewOrder);
    socket.on('order:updated', handleUpdateOrder);
    socket.on('order_status_updated', handleUpdateOrder);

    socket.on('menu:updated', (updatedMenu: MenuItem[]) => {
      if (updatedMenu && updatedMenu.length > 0) {
        setMenuItems(updatedMenu);
      }
    });

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('new_order', handleNewOrder);
      socket.off('order:updated', handleUpdateOrder);
      socket.off('order_status_updated', handleUpdateOrder);
      socket.off('menu:updated');
    };
  }, [currentView]);

  // Filter customer's own active and past orders
  const customerOrders = useMemo(() => {
    if (!currentCustomer) return [];
    return orders.filter(
      (o) =>
        o.customer.mobile === currentCustomer.mobile ||
        o.customer.id === currentCustomer.id
    );
  }, [orders, currentCustomer]);

  const activeCustomerOrders = useMemo(() => {
    return customerOrders.filter(
      (o) => o.status !== 'Completed' && o.status !== 'Cancelled'
    );
  }, [customerOrders]);

  // --- Cart Actions ---
  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((it) => it.menuItemId === item.id);
      if (existing) {
        return prev.map((it) =>
          it.menuItemId === item.id ? { ...it, quantity: it.quantity + 1 } : it
        );
      }
      const newItem: OrderItem = {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        dietType: item.dietType,
        imageUrl: item.imageUrl,
      };
      return [...prev, newItem];
    });
  };

  const handleUpdateQuantity = (item: MenuItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((it) => it.menuItemId !== item.id));
    } else {
      setCart((prev) => {
        const existing = prev.find((it) => it.menuItemId === item.id);
        if (existing) {
          return prev.map((it) =>
            it.menuItemId === item.id ? { ...it, quantity: newQuantity } : it
          );
        }
        return [
          ...prev,
          {
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: newQuantity,
            dietType: item.dietType,
            imageUrl: item.imageUrl,
          },
        ];
      });
    }
  };

  const handleUpdateCartItemQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((it) => it.menuItemId !== menuItemId));
    } else {
      setCart((prev) =>
        prev.map((it) => (it.menuItemId === menuItemId ? { ...it, quantity } : it))
      );
    }
  };

  const handleRemoveFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((it) => it.menuItemId !== menuItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleToggleFavorite = (itemId: string) => {
    setFavorites((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // --- Place Order Action ---
  const handlePlaceOrder = async (details: {
    tableNumber: string;
    specialInstructions: string;
  }) => {
    if (cart.length === 0) return;

    const guestCustomer: Customer = currentCustomer || {
      id: `cust-${Date.now()}`,
      name: 'Guest Connoisseur',
      mobile: '9876543210',
      totalOrders: 1,
      totalSpent: cartSubtotal,
      tableNumber: details.tableNumber,
    };

    const subtotal = cartSubtotal;
    const tax = Math.round(subtotal * (settings.gstRate || 0.05));
    const grandTotal = subtotal + tax;

    try {
      const placedOrder = await createOrder({
        customer: {
          ...guestCustomer,
          tableNumber: details.tableNumber,
        },
        items: cart,
        subtotal,
        tax,
        grandTotal,
        specialInstructions: details.specialInstructions,
      });

      // Update local state instantly
      setOrders((prev) => [placedOrder, ...prev]);
      setCart([]);
      setConfirmationOrder(placedOrder);
      setLiveTrackerOrder(placedOrder);

      // Broadcast immediately across all open tabs/windows in 0ms
      try {
        const channel = new BroadcastChannel('restaurant_orders_channel');
        channel.postMessage({ type: 'NEW_ORDER', order: placedOrder });
        channel.close();
      } catch {}
    } catch (err) {
      console.error('Failed to create order:', err);
      // Fallback local creation in case of transient offline
      const fallbackOrder: Order = {
        id: `order-${Date.now()}`,
        orderNumber: `#AG${Math.floor(1000 + Math.random() * 9000)}`,
        customer: {
          ...guestCustomer,
          tableNumber: details.tableNumber,
        },
        items: cart,
        subtotal,
        tax,
        grandTotal,
        status: 'Confirmed',
        specialInstructions: details.specialInstructions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedTimeMinutes: 25,
      };
      setOrders((prev) => [fallbackOrder, ...prev]);
      setCart([]);
      setConfirmationOrder(fallbackOrder);
      setLiveTrackerOrder(fallbackOrder);

      try {
        const channel = new BroadcastChannel('restaurant_orders_channel');
        channel.postMessage({ type: 'NEW_ORDER', order: fallbackOrder });
        channel.close();
      } catch {}
    }
  };

  // --- Customer Login / Logout ---
  const handleCustomerLogin = async (mobile: string, name?: string, address?: string) => {
    try {
      const cust = await customerLoginApi({ mobile, name: name || '', address: address || '' });
      setCurrentCustomer(cust);
    } catch {
      // Fallback local match
      const existing = customers.find((c) => c.mobile === mobile);
      if (existing) {
        setCurrentCustomer(existing);
      } else {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          name: name || 'Valued Guest',
          mobile,
          address: address || '',
          totalOrders: 0,
          totalSpent: 0,
        };
        setCurrentCustomer(newCust);
      }
    }
  };

  const handleCustomerLogout = () => {
    setCurrentCustomer(null);
    localStorage.removeItem('ag_customer');
    setCurrentView('portal');
  };

  const handlePortalCustomerEnter = (customer: Customer) => {
    setCurrentCustomer(customer);
    localStorage.setItem('ag_customer', JSON.stringify(customer));
    setCurrentView('customer');
  };

  const handlePortalAdminEnter = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('ag_admin_token', token);
    setCurrentView('admin');
  };

  // --- Admin Login & Order Status Management ---
  const handleAdminLoginSuccess = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('ag_admin_token', token);
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('ag_admin_token');
    setCurrentView('portal');
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updated = await updateOrderStatusApi(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (liveTrackerOrder?.id === orderId) {
        setLiveTrackerOrder(updated);
        playStatusUpdateChime();
      }
      try {
        const channel = new BroadcastChannel('restaurant_orders_channel');
        channel.postMessage({ type: 'ORDER_STATUS_CHANGED', orderId, status, order: updated });
        channel.close();
      } catch {}
    } catch (err) {
      console.error('Failed to update status on server:', err);
      // Local optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o))
      );
      if (liveTrackerOrder?.id === orderId) {
        setLiveTrackerOrder((prev) => (prev ? { ...prev, status, updatedAt: new Date().toISOString() } : null));
        playStatusUpdateChime();
      }
      try {
        const channel = new BroadcastChannel('restaurant_orders_channel');
        channel.postMessage({ type: 'ORDER_STATUS_CHANGED', orderId, status });
        channel.close();
      } catch {}
    }
  };

  // --- Admin Menu CRUD ---
  const handleAddMenuItem = async (itemData: Omit<MenuItem, 'id'>) => {
    try {
      const created = await createMenuItemApi(itemData);
      setMenuItems((prev) => [...prev, created]);
    } catch (err) {
      const fallback: MenuItem = {
        ...itemData,
        id: `item-${Date.now()}`,
      };
      setMenuItems((prev) => [...prev, fallback]);
    }
  };

  const handleUpdateMenuItem = async (item: MenuItem) => {
    try {
      const updated = await updateMenuItemApi(item);
      setMenuItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
    } catch (err) {
      setMenuItems((prev) => prev.map((it) => (it.id === item.id ? item : it)));
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      await deleteMenuItemApi(id);
      setMenuItems((prev) => prev.filter((it) => it.id !== id));
    } catch (err) {
      setMenuItems((prev) => prev.filter((it) => it.id !== id));
    }
  };

  const handleUpdateSettings = async (partial: Partial<RestaurantSettings>) => {
    try {
      const updated = await updateSettingsApi(partial);
      setSettings(updated);
    } catch {
      setSettings((prev) => ({ ...prev, ...partial }));
    }
  };

  const scrollToSection = (sectionId: string) => {
    if (currentView === 'admin') {
      setCurrentView('customer');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-[#f5f0eb] font-sans antialiased selection:bg-[#d4af37]/30 selection:text-[#f7d678]">
      {/* 1. WELCOME TO YASH CREATION DEMO PORTAL (Initial Landing View) */}
      {currentView === 'portal' ? (
        <WelcomePortal
          onCustomerEnter={handlePortalCustomerEnter}
          onAdminEnter={handlePortalAdminEnter}
        />
      ) : currentView === 'admin' ? (
        /* 2. ADMIN COMMAND DASHBOARD (Independent, No Customer Navbar, Exit to Portal only) */
        <AdminDashboard
          orders={orders}
          menuItems={menuItems}
          customers={customers}
          stats={stats}
          settings={settings}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onAddMenuItem={handleAddMenuItem}
          onUpdateMenuItem={handleUpdateMenuItem}
          onDeleteMenuItem={handleDeleteMenuItem}
          onUpdateSettings={handleUpdateSettings}
          onLogout={handleAdminLogout}
          newOrderAlert={newOrderAlert}
          onDismissAlert={() => setNewOrderAlert(null)}
          onRefreshData={loadInitialData}
          onBackToPortal={() => setCurrentView('portal')}
        />
      ) : (
        /* 3. CUSTOMER DINING EXPERIENCE (Pure Customer view with Navbar, Menu & Tracker) */
        <>
          {/* Top Navbar */}
          <Navbar
            cartCount={cartItemCount}
            cartTotal={cartSubtotal}
            onOpenCart={() => setIsCartOpen(true)}
            currentCustomer={currentCustomer}
            activeOrderCount={activeCustomerOrders.length}
            onOpenLiveTracker={() => {
              if (activeCustomerOrders.length > 0) {
                setLiveTrackerOrder(activeCustomerOrders[0]);
              } else if (customerOrders.length > 0) {
                setLiveTrackerOrder(customerOrders[0]);
              } else {
                setIsCartOpen(true);
              }
            }}
            onScrollToSection={scrollToSection}
            onCustomerLogout={handleCustomerLogout}
          />

          {/* Floating Side Quick Logout / Exit Table Widget */}
          {currentCustomer && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-6 left-6 z-30 hidden md:flex items-center gap-2 p-1.5 pl-3 pr-2 rounded-full bg-[#10121a]/95 border border-[#d4af37]/40 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl"
            >
              <div className="flex items-center gap-1.5 text-xs text-[#e8e4dc]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-cinzel font-bold text-[#f7d678]">
                  {currentCustomer.tableNumber || 'Table'}
                </span>
                <span className="text-[#62677d]">•</span>
                <span className="text-stone-300 font-medium max-w-[90px] truncate">
                  {currentCustomer.name.split(' ')[0]}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCustomerLogout}
                title="Logout / Leave Table"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-950/70 hover:bg-rose-900/90 border border-rose-500/40 text-rose-300 hover:text-white text-[11px] font-cinzel font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer ml-1"
              >
                <LogOut className="w-3 h-3 text-rose-400" />
                <span>Logout</span>
              </button>
            </motion.div>
          )}

          {/* Floating Live Kitchen Update Toast for Customer */}
          <AnimatePresence>
            {customerStatusToast && (
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
              >
                <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[#0e111a] border border-[#d4af37]/70 text-white shadow-[0_10px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d4af37]" />
                    </span>
                    <div>
                      <p className="text-xs font-cinzel font-bold text-[#f7d678] uppercase tracking-wider">
                        Kitchen Update • {customerStatusToast.orderNumber}
                      </p>
                      <p className="text-xs text-stone-200">
                        Status changed to{' '}
                        <span className="font-bold text-[#d4af37]">
                          {customerStatusToast.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomerStatusToast(null)}
                    className="p-1 rounded-lg text-stone-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="relative">
            {/* Cinematic Hero */}
            <Hero
              onExploreMenu={() => scrollToSection('menu-section')}
              onOpenLiveTracking={() => {
                if (activeCustomerOrders.length > 0) {
                  setLiveTrackerOrder(activeCustomerOrders[0]);
                }
              }}
              hasActiveOrder={activeCustomerOrders.length > 0}
            />

            {/* Grand Menu Section with Search, Filter & Cart Controls */}
            <MenuSection
              menuItems={menuItems}
              cartQuantities={cartQuantities}
              favorites={favorites}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              onToggleFavorite={handleToggleFavorite}
              onOpenDetails={(item) => setSelectedFoodDetail(item)}
            />

            {/* Heritage, Craftsmanship & The Aurelia Experience */}
            <AboutSection />

            {/* Global Footer & Concierge Coordinates */}
            <Footer />
          </main>

          {/* Floating Bottom Quick Tracker Pill (when active order exists and tracker not open) */}
          {activeCustomerOrders.length > 0 && !liveTrackerOrder && currentView === 'customer' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-6 right-6 z-40"
            >
              <button
                onClick={() => setLiveTrackerOrder(activeCustomerOrders[0])}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#181b24] to-[#12141c] border border-[#d4af37]/50 shadow-[0_10px_35px_rgba(0,0,0,0.8)] text-xs font-semibold text-[#f7d678] hover:border-[#d4af37] transition-all group"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>
                  {activeCustomerOrders[0].orderNumber} • {activeCustomerOrders[0].status}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#d4af37] text-black font-cinzel text-[10px] font-bold">
                  Track Live
                </span>
              </button>
            </motion.div>
          )}

          {/* Cart Drawer */}
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cart}
            onUpdateQuantity={handleUpdateCartItemQuantity}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            onPlaceOrder={handlePlaceOrder}
            customerName={currentCustomer?.name}
            customerMobile={currentCustomer?.mobile}
            onOpenCustomerLogin={() => setIsCustomerAuthOpen(true)}
            gstRate={settings.gstRate}
          />

          {/* Food Detail Modal */}
          <FoodDetailModal
            item={selectedFoodDetail}
            onClose={() => setSelectedFoodDetail(null)}
            inCartQuantity={selectedFoodDetail ? cartQuantities[selectedFoodDetail.id] || 0 : 0}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
          />

          {/* Live Order Progress Tracker Modal */}
          <LiveOrderTracker
            order={liveTrackerOrder}
            onClose={() => setLiveTrackerOrder(null)}
            allCustomerOrders={customerOrders}
            onSelectOrder={(o) => setLiveTrackerOrder(o)}
            onCancelOrder={(orderId) => handleUpdateOrderStatus(orderId, 'Cancelled')}
          />

          {/* Order Placed Confirmation & Confetti Modal */}
          <OrderConfirmationModal
            order={confirmationOrder}
            onClose={() => setConfirmationOrder(null)}
            onOpenLiveTracker={() => {
              if (confirmationOrder) {
                setLiveTrackerOrder(confirmationOrder);
              }
            }}
          />

          {/* Customer Mobile Authentication Modal */}
          <CustomerAuthModal
            isOpen={isCustomerAuthOpen}
            onClose={() => setIsCustomerAuthOpen(false)}
            currentCustomer={currentCustomer}
            onLogin={handleCustomerLogin}
            onLogout={handleCustomerLogout}
          />

          {/* Executive Admin Login Modal */}
          <AdminLoginModal
            isOpen={isAdminAuthOpen}
            onClose={() => setIsAdminAuthOpen(false)}
            onLoginSuccess={handleAdminLoginSuccess}
          />
        </>
      )}
    </div>
  );

}
