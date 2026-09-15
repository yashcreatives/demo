import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  Bell,
  CheckCircle2,
  Clock,
  ChefHat,
  XCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  TrendingUp,
  Users,
  DollarSign,
  Utensils,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  LogOut,
  ChevronRight,
  Sparkles,
  Search,
  ExternalLink,
  ShieldAlert,
  Sliders,
  PieChart as PieIcon,
  Store,
} from 'lucide-react';
import { Order, MenuItem, Customer, RestaurantStats, OrderStatus, FoodCategory, RestaurantSettings } from '../types';
import { playAdminLoudOrderChime, playOrderReceivedChime } from '../utils/audio';

interface AdminDashboardProps {
  orders: Order[];
  menuItems: MenuItem[];
  customers: Customer[];
  stats: RestaurantStats;
  settings: RestaurantSettings;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  onUpdateMenuItem: (item: MenuItem) => Promise<void>;
  onDeleteMenuItem: (id: string) => Promise<void>;
  onUpdateSettings: (settings: Partial<RestaurantSettings>) => Promise<void>;
  onLogout: () => void;
  newOrderAlert: Order | null;
  onDismissAlert: () => void;
  onRefreshData: () => void;
  onBackToPortal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  menuItems,
  customers,
  stats,
  settings,
  onUpdateOrderStatus,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  onUpdateSettings,
  onLogout,
  newOrderAlert,
  onDismissAlert,
  onRefreshData,
  onBackToPortal,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'analytics' | 'customers' | 'settings'>('orders');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [clockTime, setClockTime] = useState(new Date().toLocaleTimeString());

  // Auto-Refresh States (Set to 2 seconds for high-frequency live kitchen sync)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(2);
  const [isRefreshingPulse, setIsRefreshingPulse] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toLocaleTimeString());

  // Real-time clock for kitchen precision
  useEffect(() => {
    const timer = setInterval(() => {
      setClockTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Continuous Auto-Refresh Timer (Every 2 seconds automatically polls fresh orders and stats)
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          // Trigger refresh
          setIsRefreshingPulse(true);
          onRefreshData();
          setLastRefreshedAt(new Date().toLocaleTimeString());
          setTimeout(() => setIsRefreshingPulse(false), 600);
          return 2;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, onRefreshData]);

  // Instant cross-tab real-time sync via BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const channel = new BroadcastChannel('restaurant_orders_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'NEW_ORDER') {
          onRefreshData();
          if (soundEnabled) {
            playAdminLoudOrderChime();
          }
        } else if (event.data?.type === 'ORDER_STATUS_CHANGED') {
          onRefreshData();
        }
      };
      return () => {
        channel.close();
      };
    } catch {
      // Graceful fallback
    }
  }, [onRefreshData, soundEnabled]);

  // Manual Instant Refresh
  const handleManualRefresh = () => {
    setIsRefreshingPulse(true);
    onRefreshData();
    setRefreshCountdown(2);
    setLastRefreshedAt(new Date().toLocaleTimeString());
    setTimeout(() => setIsRefreshingPulse(false), 600);
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'pending') return o.status === 'Confirmed' || o.status === 'Accepted';
    if (orderFilter === 'preparing') return o.status === 'Preparing';
    if (orderFilter === 'ready') return o.status === 'Ready';
    if (orderFilter === 'completed') return o.status === 'Completed';
    if (orderFilter === 'cancelled') return o.status === 'Cancelled';
    return true;
  });

  // Filter menu items for menu management
  const filteredMenuItems = menuItems.filter((item) => {
    if (!menuSearch.trim()) return true;
    const q = menuSearch.toLowerCase().trim();
    return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  // Analytics Sample Datasets for Recharts
  const revenueTrendData = [
    { time: '12 PM', orders: 4, revenue: 6800 },
    { time: '2 PM', orders: 9, revenue: 14200 },
    { time: '4 PM', orders: 5, revenue: 7900 },
    { time: '6 PM', orders: 12, revenue: 21500 },
    { time: '8 PM', orders: 18, revenue: 34800 },
    { time: '10 PM', orders: 14, revenue: 26400 },
  ];

  const categoryBreakdownData = [
    { name: 'North Indian', value: 38, color: '#d4af37' },
    { name: 'Biryani', value: 24, color: '#f7d678' },
    { name: 'Starters', value: 16, color: '#c59b27' },
    { name: 'South Indian', value: 12, color: '#aa820a' },
    { name: 'Seafood', value: 6, color: '#e5c05b' },
    { name: 'Continental', value: 4, color: '#8c6b12' },
  ];

  const handleTestSound = () => {
    playAdminLoudOrderChime();
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    await onUpdateOrderStatus(orderId, status);
    try {
      const channel = new BroadcastChannel('restaurant_orders_channel');
      channel.postMessage({ type: 'ORDER_STATUS_CHANGED', orderId, status });
      channel.close();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#090a0e] text-[#f5f0eb] pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Top Banner & Audio notification alert */}
      <AnimatePresence>
        {newOrderAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
          >
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#f7d678] to-[#aa820a] text-black shadow-[0_10px_40px_rgba(212,175,55,0.6)] animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center">
                  <Bell className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-cinzel font-bold text-sm uppercase tracking-wider">
                    🔔 New Order Received • {newOrderAlert.orderNumber}
                  </h4>
                  <p className="text-xs font-medium">
                    {newOrderAlert.customer.name} ({newOrderAlert.customer.tableNumber || 'Table 7'}) • ₹
                    {newOrderAlert.grandTotal.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onDismissAlert();
                    setActiveTab('orders');
                    setOrderFilter('all');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-black text-[#f7d678] text-xs font-bold font-cinzel hover:bg-zinc-900 transition-colors"
                >
                  View Order
                </button>
                <button
                  onClick={onDismissAlert}
                  className="p-1.5 hover:bg-black/10 rounded-lg text-black"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Executive Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#12141c] border border-[#d4af37]/25 rounded-3xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#aa820a] p-[1px] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <div className="w-full h-full bg-[#0b0c10] rounded-2xl flex items-center justify-center font-cinzel font-bold text-[#f7d678]">
                AG
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-cinzel tracking-widest text-[#d4af37] font-semibold">
                  Executive Maitre D &amp; Kitchen Control
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Socket Connected
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#fdfbf7]">
                Aurelia Grand Command Center
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Auto-Refresh Badge with Countdown & Toggle */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#181b25] border border-emerald-500/30 text-xs text-[#dcd7ce]">
              <div className="relative flex items-center justify-center">
                <span className={`w-2.5 h-2.5 rounded-full ${autoRefreshEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                {autoRefreshEnabled && (
                  <span className="absolute w-4 h-4 rounded-full bg-emerald-400/20 animate-ping" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  {autoRefreshEnabled ? `Auto-Refresh: ${refreshCountdown}s` : 'Auto-Refresh: OFF'}
                </span>
                <span className="text-[9px] text-[#8e8a80]">
                  Live Polling • {lastRefreshedAt}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                title={autoRefreshEnabled ? 'Pause Auto-Refresh' : 'Enable Auto-Refresh'}
                className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-[#25293b] hover:bg-[#32374d] text-[#f7d678] border border-[#3e445d]"
              >
                {autoRefreshEnabled ? 'Pause' : 'Resume'}
              </button>
            </div>

            {/* Real-time Clock */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#181b25] border border-[#2a2e3d] text-xs font-mono text-[#f7d678]">
              <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{clockTime}</span>
            </div>

            {/* Loud Sound alert test */}
            <button
              onClick={handleTestSound}
              title="Test High-Decibel Order Chime"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 text-xs font-medium text-[#f7d678] transition-all shadow-sm"
            >
              <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="hidden md:inline">Loud Chime Test</span>
              <span className="md:hidden">Chime</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={handleManualRefresh}
              title="Refresh Orders Now"
              className="p-2 rounded-xl bg-[#181b25] hover:bg-[#222634] border border-[#2a2e3d] text-[#a8a399] hover:text-[#fdfbf7] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshingPulse ? 'animate-spin text-[#d4af37]' : ''}`} />
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-400 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>

        {/* Animated Statistics Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-[#12141c] border border-[#d4af37]/20 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#9e9a91] text-xs mb-2">
              <span className="uppercase font-cinzel">Total Orders</span>
              <Utensils className="w-4 h-4 text-[#d4af37]" />
            </div>
            <span className="text-2xl sm:text-3xl font-cinzel font-bold text-[#fdfbf7]">
              {stats.totalOrders}
            </span>
            <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +18% today
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-[#12141c] border border-amber-500/30 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-amber-400 text-xs mb-2">
              <span className="uppercase font-cinzel">Pending</span>
              <AlertCircle className="w-4 h-4" />
            </div>
            <span className="text-2xl sm:text-3xl font-cinzel font-bold text-amber-300">
              {stats.pendingOrders}
            </span>
            <span className="text-[10px] text-amber-200/70 mt-1">Awaiting kitchen</span>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-[#12141c] border border-blue-500/30 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-blue-400 text-xs mb-2">
              <span className="uppercase font-cinzel">Preparing</span>
              <ChefHat className="w-4 h-4" />
            </div>
            <span className="text-2xl sm:text-3xl font-cinzel font-bold text-blue-300">
              {stats.preparingOrders}
            </span>
            <span className="text-[10px] text-blue-200/70 mt-1">On Chef&apos;s Line</span>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-[#12141c] border border-emerald-500/30 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-emerald-400 text-xs mb-2">
              <span className="uppercase font-cinzel">Ready / Served</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-2xl sm:text-3xl font-cinzel font-bold text-emerald-300">
              {stats.completedOrders + stats.readyOrders}
            </span>
            <span className="text-[10px] text-emerald-200/70 mt-1">Table delivered</span>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-[#12141c] border border-[#d4af37]/35 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#d4af37] text-xs mb-2">
              <span className="uppercase font-cinzel">Today&apos;s Revenue</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-xl sm:text-2xl font-cinzel font-bold text-[#f7d678]">
              ₹{stats.todayRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#9e9a91] mt-1">Across all tables</span>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-2xl bg-[#12141c] border border-purple-500/30 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-purple-400 text-xs mb-2">
              <span className="uppercase font-cinzel">Total Guests</span>
              <Users className="w-4 h-4" />
            </div>
            <span className="text-2xl sm:text-3xl font-cinzel font-bold text-purple-300">
              {stats.totalCustomers}
            </span>
            <span className="text-[10px] text-purple-200/70 mt-1">Registered members</span>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#2a2e3d] pb-2 overflow-x-auto">
          {[
            { id: 'orders', label: `Live Orders (${orders.length})`, icon: <Utensils className="w-4 h-4" /> },
            { id: 'menu', label: `Menu Management (${menuItems.length})`, icon: <Store className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics & Insights', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'customers', label: `Customer Directory (${customers.length})`, icon: <Users className="w-4 h-4" /> },
            { id: 'settings', label: 'Restaurant Settings', icon: <Sliders className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-cinzel font-bold tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa820a] text-black shadow-md'
                  : 'text-[#a8a399] hover:text-[#fdfbf7] hover:bg-[#181b24]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* --- TAB 1: LIVE ORDERS --- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter Sub-nav */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 p-1 bg-[#12141c] border border-[#2a2e3d] rounded-xl text-xs">
                {[
                  { id: 'all', label: 'All Orders' },
                  { id: 'pending', label: 'Pending / Confirmed' },
                  { id: 'preparing', label: 'Preparing' },
                  { id: 'ready', label: 'Ready' },
                  { id: 'completed', label: 'Completed' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setOrderFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      orderFilter === f.id
                        ? 'bg-[#d4af37] text-black font-semibold'
                        : 'text-[#a8a399] hover:text-[#fdfbf7]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <span className="text-xs text-[#9e9a91]">
                Displaying <strong>{filteredOrders.length}</strong> orders • Synchronized in real time
              </span>
            </div>

            {/* Orders List / Cards */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="py-20 text-center bg-[#12141c]/50 rounded-2xl border border-[#2a2e3d]">
                  <Utensils className="w-12 h-12 text-[#9e9a91]/40 mx-auto mb-3" />
                  <h3 className="font-serif-display text-lg text-[#fdfbf7]">No Orders in This Category</h3>
                  <p className="text-xs text-[#9e9a91]">New incoming customer orders will appear here automatically.</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const statusColors: Record<OrderStatus, { bg: string; text: string; border: string }> = {
                    Confirmed: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/40' },
                    Accepted: { bg: 'bg-yellow-500/15', text: 'text-yellow-300', border: 'border-yellow-500/40' },
                    Preparing: { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/40' },
                    Ready: { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/40' },
                    Completed: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/40' },
                    Cancelled: { bg: 'bg-red-500/15', text: 'text-red-300', border: 'border-red-500/40' },
                  };

                  const currentStatus = statusColors[order.status] || statusColors.Confirmed;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#12141c] border border-[#d4af37]/20 hover:border-[#d4af37]/45 rounded-2xl p-5 sm:p-6 transition-all space-y-4"
                    >
                      {/* Order Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222635]">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-cinzel font-bold text-[#f7d678]">
                            {order.orderNumber}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#1c202d] text-[#c9c5bc] border border-[#2a2e3e]">
                            {order.customer.tableNumber || 'Table 7'}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-[#9e9a91]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="font-cinzel text-base font-bold text-[#f7d678]">
                            ₹{order.grandTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Customer Details & Items */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#181b25] p-3 rounded-xl border border-[#222635] text-xs">
                          <span className="text-[10px] uppercase tracking-wider text-[#d4af37] block mb-1 font-cinzel">
                            Customer Details
                          </span>
                          <div className="font-semibold text-[#fdfbf7]">{order.customer.name}</div>
                          <div className="text-[#a8a399]">+91 {order.customer.mobile}</div>
                          {order.customer.address && (
                            <div className="text-[#a8a399] mt-1 break-words line-clamp-2">
                              {order.customer.address}
                            </div>
                          )}
                          {order.specialInstructions && (
                            <div className="mt-2 text-[11px] text-amber-200/90 italic bg-amber-500/10 p-2 rounded border border-amber-500/20">
                              Note: {order.specialInstructions}
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-2 bg-[#181b25] p-3 rounded-xl border border-[#222635] text-xs">
                          <span className="text-[10px] uppercase tracking-wider text-[#d4af37] block mb-2 font-cinzel">
                            Ordered Dishes ({order.items.length})
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[#c9c5bc]">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span
                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                      it.dietType === 'veg' ? 'bg-emerald-400' : 'bg-red-500'
                                    }`}
                                  />
                                  <span className="truncate">
                                    {it.name} <strong className="text-[#f7d678]">× {it.quantity}</strong>
                                  </span>
                                </div>
                                <span className="font-cinzel text-[#9e9a91] ml-2 shrink-0">
                                  ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Kitchen Status Action Buttons */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-[#8c887f]">Change Kitchen Status:</span>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleStatusChange(order.id, 'Accepted')}
                            disabled={order.status === 'Accepted'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              order.status === 'Accepted'
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 cursor-default'
                                : 'bg-[#1c202e] hover:bg-yellow-950/40 text-yellow-200 border border-[#2a2e3e]'
                            }`}
                          >
                            Accept
                          </button>

                          <button
                            onClick={() => handleStatusChange(order.id, 'Preparing')}
                            disabled={order.status === 'Preparing'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              order.status === 'Preparing'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 cursor-default'
                                : 'bg-[#1c202e] hover:bg-blue-950/40 text-blue-200 border border-[#2a2e3e]'
                            }`}
                          >
                            Preparing
                          </button>

                          <button
                            onClick={() => handleStatusChange(order.id, 'Ready')}
                            disabled={order.status === 'Ready'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              order.status === 'Ready'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 cursor-default'
                                : 'bg-[#1c202e] hover:bg-purple-950/40 text-purple-200 border border-[#2a2e3e]'
                            }`}
                          >
                            Ready
                          </button>

                          <button
                            onClick={() => handleStatusChange(order.id, 'Completed')}
                            disabled={order.status === 'Completed'}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              order.status === 'Completed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                                : 'bg-[#1c202e] hover:bg-emerald-950/40 text-emerald-200 border border-[#2a2e3e]'
                            }`}
                          >
                            Completed
                          </button>

                          <button
                            onClick={() => handleStatusChange(order.id, 'Cancelled')}
                            disabled={order.status === 'Cancelled'}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1c202e] hover:bg-red-950/40 text-red-300 border border-[#2a2e3e] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: MENU MANAGEMENT --- */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9e9a91]" />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Search dishes to edit price or availability..."
                  className="w-full pl-9 pr-4 py-2 bg-[#12141c] border border-[#2a2e3d] rounded-xl text-xs text-[#fdfbf7] placeholder-[#6e6b64] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <button
                onClick={() => setIsAddingItem(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#aa820a] hover:from-[#f7d678] hover:to-[#c59b27] text-black font-cinzel font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Culinary Creation</span>
              </button>
            </div>

            {/* Menu Items Table */}
            <div className="bg-[#12141c] border border-[#d4af37]/20 rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#181b25] text-[#d4af37] uppercase font-cinzel tracking-wider border-b border-[#2a2e3d]">
                  <tr>
                    <th className="p-4">Dish</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Price (₹)</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Badges</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222635]">
                  {filteredMenuItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#181b24]/60 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-lg border border-[#2a2e3d]"
                        />
                        <div>
                          <div className="font-semibold text-[#fdfbf7]">{item.name}</div>
                          <div className="text-[10px] text-[#9e9a91] line-clamp-1">{item.description}</div>
                        </div>
                      </td>
                      <td className="p-4 text-[#c9c5bc]">{item.category}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            item.dietType === 'veg' ? 'text-emerald-400 bg-emerald-950/60' : 'text-red-400 bg-red-950/60'
                          }`}
                        >
                          {item.dietType}
                        </span>
                      </td>
                      <td className="p-4 font-cinzel font-bold text-[#f7d678]">
                        ₹{item.price.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-amber-300">⭐ {item.rating}</td>
                      <td className="p-4">
                        <button
                          onClick={() => onUpdateMenuItem({ ...item, isAvailable: !item.isAvailable })}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                            item.isAvailable
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-600/40'
                              : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                          }`}
                        >
                          {item.isAvailable ? 'In Stock' : 'Sold Out'}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {item.isBestseller && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Bestseller
                            </span>
                          )}
                          {item.isChefsSpecial && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                              Chef Special
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 rounded-lg bg-[#181b24] hover:bg-[#25293a] text-[#d4af37] transition-colors"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${item.name} from menu?`)) {
                                onDeleteMenuItem(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-[#181b24] hover:bg-red-950/40 text-red-400 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 3: ADMIN ANALYTICS --- */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Orders & Revenue Chart */}
              <div className="bg-[#12141c] border border-[#d4af37]/20 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-cinzel tracking-widest text-[#d4af37]">
                      Today&apos;s Revenue Velocity
                    </span>
                    <h3 className="font-serif-display text-lg font-semibold text-[#fdfbf7]">
                      Hourly Revenue &amp; Orders
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#f7d678]">₹{stats.todayRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3d" />
                      <XAxis dataKey="time" stroke="#7a766f" fontSize={11} />
                      <YAxis stroke="#7a766f" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#181b25', borderColor: '#d4af37', borderRadius: '12px' }}
                        itemStyle={{ color: '#f7d678' }}
                      />
                      <Bar dataKey="revenue" fill="#d4af37" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Breakdown Pie */}
              <div className="bg-[#12141c] border border-[#d4af37]/20 p-6 rounded-2xl space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-cinzel tracking-widest text-[#d4af37]">
                    Popularity Distribution
                  </span>
                  <h3 className="font-serif-display text-lg font-semibold text-[#fdfbf7]">
                    Category Sales Share
                  </h3>
                </div>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdownData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={4}
                      >
                        {categoryBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#181b25', borderColor: '#d4af37', borderRadius: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 text-xs">
                  {categoryBreakdownData.map((c) => (
                    <div key={c.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-[#a8a399]">{c.name} ({c.value}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Popular Items Leaderboard */}
            <div className="bg-[#12141c] border border-[#d4af37]/20 p-6 rounded-2xl">
              <span className="text-[10px] uppercase font-cinzel tracking-widest text-[#d4af37]">
                Executive Leaderboard
              </span>
              <h3 className="font-serif-display text-lg font-semibold text-[#fdfbf7] mb-4">
                Most Celebrated Signature Dishes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.popularItems.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#181b25] border border-[#2a2e3e] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#f7d678]">#{idx + 1}</span>
                      <h4 className="font-semibold text-sm text-[#fdfbf7] mt-0.5">{item.name}</h4>
                      <span className="text-xs text-[#9e9a91]">{item.count} orders today</span>
                    </div>
                    <span className="font-cinzel text-sm font-bold text-[#d4af37]">
                      ₹{item.revenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: CUSTOMERS DIRECTORY --- */}
        {activeTab === 'customers' && (
          <div className="bg-[#12141c] border border-[#d4af37]/20 rounded-2xl overflow-hidden overflow-x-auto">
            <div className="p-5 border-b border-[#2a2e3d]">
              <h3 className="font-serif-display text-lg font-semibold text-[#fdfbf7]">
                Aurelia Grand Patron Directory
              </h3>
              <p className="text-xs text-[#9e9a91]">Track customer lifetime dining history, loyalty, and reservations.</p>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181b25] text-[#d4af37] uppercase font-cinzel tracking-wider border-b border-[#2a2e3d]">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Mobile Number</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Total Orders</th>
                  <th className="p-4">Lifetime Spend</th>
                  <th className="p-4">Last Table</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222635]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#181b24]/60 transition-colors">
                    <td className="p-4 font-semibold text-[#fdfbf7]">{c.name}</td>
                    <td className="p-4 font-mono text-[#a8a399]">+91 {c.mobile}</td>
                    <td className="p-4 text-[#a8a399]">{c.email || '—'}</td>
                    <td className="p-4 font-cinzel font-bold text-[#fdfbf7]">{c.totalOrders}</td>
                    <td className="p-4 font-cinzel font-bold text-[#f7d678]">
                      ₹{c.totalSpent.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-[#c9c5bc]">{c.tableNumber || 'Table 7'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- TAB 5: RESTAURANT SETTINGS --- */}
        {activeTab === 'settings' && (
          <div className="bg-[#12141c] border border-[#d4af37]/20 p-6 sm:p-8 rounded-2xl space-y-6 max-w-3xl">
            <div>
              <span className="text-xs uppercase font-cinzel tracking-widest text-[#d4af37]">
                Configuration &amp; Operations
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-[#fdfbf7] mt-1">
                Restaurant Settings
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#a8a399] uppercase tracking-wider mb-1 font-cinzel">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={settings.restaurantName}
                  onChange={(e) => onUpdateSettings({ restaurantName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#181b25] border border-[#2a2e3d] rounded-xl text-sm text-[#fdfbf7] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-[#a8a399] uppercase tracking-wider mb-1 font-cinzel">
                  Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => onUpdateSettings({ tagline: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#181b25] border border-[#2a2e3d] rounded-xl text-sm text-[#fdfbf7] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#a8a399] uppercase tracking-wider mb-1 font-cinzel">
                    GST Rate (Decimal, e.g. 0.05 for 5%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.gstRate}
                    onChange={(e) => onUpdateSettings({ gstRate: parseFloat(e.target.value) || 0.05 })}
                    className="w-full px-4 py-2.5 bg-[#181b25] border border-[#2a2e3d] rounded-xl text-sm text-[#fdfbf7] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-[#a8a399] uppercase tracking-wider mb-1 font-cinzel">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={settings.openingHours}
                    onChange={(e) => onUpdateSettings({ openingHours: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#181b25] border border-[#2a2e3d] rounded-xl text-sm text-[#fdfbf7] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#a8a399] uppercase tracking-wider mb-1 font-cinzel">
                  Location / Physical Address
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => onUpdateSettings({ address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#181b25] border border-[#2a2e3d] rounded-xl text-sm text-[#fdfbf7] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="pt-4 border-t border-[#2a2e3d] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm text-[#fdfbf7] block">Accepting Live Orders</span>
                  <span className="text-[#9e9a91]">Customers can submit live orders from table</span>
                </div>
                <button
                  onClick={() => onUpdateSettings({ isOnlineOrderingOpen: !settings.isOnlineOrderingOpen })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-cinzel transition-all ${
                    settings.isOnlineOrderingOpen
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {settings.isOnlineOrderingOpen ? 'OPEN' : 'PAUSED'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Adding / Editing Menu Items */}
      {(isAddingItem || editingItem) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#12141c] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif-display text-xl font-bold text-[#fdfbf7]">
                {editingItem ? 'Edit Culinary Creation' : 'Add New Dish to Menu'}
              </h3>
              <button
                onClick={() => {
                  setIsAddingItem(false);
                  setEditingItem(null);
                }}
                className="text-[#9e9a91] hover:text-[#fdfbf7]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const payload = {
                  name: formData.get('name') as string,
                  category: formData.get('category') as FoodCategory,
                  price: parseFloat(formData.get('price') as string),
                  dietType: formData.get('dietType') as 'veg' | 'non-veg',
                  description: formData.get('description') as string,
                  imageUrl: formData.get('imageUrl') as string,
                  rating: editingItem ? editingItem.rating : 4.9,
                  reviewCount: editingItem ? editingItem.reviewCount : 1,
                  isAvailable: true,
                  isBestseller: formData.get('isBestseller') === 'on',
                  isChefsSpecial: formData.get('isChefsSpecial') === 'on',
                };

                if (editingItem) {
                  onUpdateMenuItem({ ...editingItem, ...payload });
                  setEditingItem(null);
                } else {
                  onAddMenuItem(payload);
                  setIsAddingItem(false);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[#a8a399] uppercase font-cinzel mb-1">Dish Name</label>
                <input
                  name="name"
                  defaultValue={editingItem?.name || ''}
                  required
                  className="w-full px-3 py-2 bg-[#181b25] border border-[#2a2e3d] rounded-xl text-sm text-[#fdfbf7] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a8a399] uppercase font-cinzel mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editingItem?.category || 'Starters'}
                    className="w-full px-3 py-2 bg-[#181b25] border border-[#2a2e3d] rounded-xl text-sm text-[#fdfbf7] focus:outline-none focus:border-[#d4af37]"
                  >
                    {[
                      'Starters',
                      'South Indian Signature',
                      'North Indian',
                      'Biryani',
                      'Seafood',
                      'Continental',
                      'Desserts',
                      'Beverages',
                    ].map((c) => (
                      <option key={c} value={c} className="bg-[#181b25]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#a8a399] uppercase font-cinzel mb-1">Diet Type</label>
                  <select
                    name="dietType"
                    defaultValue={editingItem?.dietType || 'veg'}
                    className="w-full px-3 py-2 bg-[#181b25] border border-[#2a2e3d] rounded-xl text-sm text-[#fdfbf7] focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a8a399] uppercase font-cinzel mb-1">Price (₹)</label>
                  <input
                    name="price"
                    type="number"
                    defaultValue={editingItem?.price || 420}
                    required
                    className="w-full px-3 py-2 bg-[#181b25] border border-[#2a2e3d] rounded-xl text-sm text-[#fdfbf7] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-[#a8a399] uppercase font-cinzel mb-1">Image URL</label>
                  <input
                    name="imageUrl"
                    defaultValue={
                      editingItem?.imageUrl ||
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
                    }
                    required
                    className="w-full px-3 py-2 bg-[#181b25] border border-[#2a2e3d] rounded-xl text-sm text-[#fdfbf7] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#a8a399] uppercase font-cinzel mb-1">Culinary Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingItem?.description || ''}
                  required
                  className="w-full px-3 py-2 bg-[#181b25] border border-[#2a2e3d] rounded-xl text-sm text-[#fdfbf7] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex items-center gap-6 py-2">
                <label className="flex items-center gap-2 cursor-pointer text-[#dcd7ce]">
                  <input
                    type="checkbox"
                    name="isBestseller"
                    defaultChecked={editingItem?.isBestseller}
                    className="rounded border-[#d4af37] text-[#d4af37]"
                  />
                  <span>Mark Bestseller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[#dcd7ce]">
                  <input
                    type="checkbox"
                    name="isChefsSpecial"
                    defaultChecked={editingItem?.isChefsSpecial}
                    className="rounded border-[#d4af37] text-[#d4af37]"
                  />
                  <span>Mark Chef&apos;s Special</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#2a2e3d]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingItem(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-[#181b24] text-[#a8a399] hover:text-[#fdfbf7] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa820a] text-black font-semibold rounded-xl shadow-md"
                >
                  {editingItem ? 'Update Dish' : 'Publish Dish'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
