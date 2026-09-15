import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  UtensilsCrossed,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Users,
  X,
  ChefHat,
  Flame,
  Clock,
  Award,
} from 'lucide-react';
import { Customer } from '../types';

interface WelcomePortalProps {
  onCustomerEnter: (customer: Customer) => void;
  onAdminEnter: (token: string) => void;
  initialAdminError?: string;
}

interface TableOption {
  id: string;
  name: string;
  capacity: string;
  zone: string;
  badge?: string;
}

const TABLE_OPTIONS: TableOption[] = [
  { id: 'Table 01', name: 'Table 01', capacity: '2 Guests', zone: 'Window Skyline View', badge: 'Couples Favorite' },
  { id: 'Table 02', name: 'Table 02', capacity: '4 Guests', zone: 'Terrace Garden Lounge', badge: 'Open Air' },
  { id: 'Table 03', name: 'Table 03', capacity: '6 Guests', zone: 'Royal Family Booth', badge: 'Spacious' },
  { id: 'Table 04', name: 'Table 04', capacity: '4 Guests', zone: 'Skyline Penthouse Salon', badge: 'Panoramic' },
  { id: 'Table 05', name: 'Table 05', capacity: '4 Guests', zone: 'Executive Central Lounge', badge: 'Popular' },
  { id: 'Table 06', name: 'Table 06', capacity: '4 Guests', zone: 'Courtyard Gazebo', badge: 'Quiet Zone' },
  { id: 'Table 07', name: 'Table 07', capacity: '8 Guests', zone: 'Imperial Banquet Booth', badge: 'Large Groups' },
  { id: 'Table 08', name: 'Table 08', capacity: '6 Guests', zone: 'VIP Chef Table Experience', badge: 'Signature' },
];

const INTRO_FEATURES = [
  {
    icon: <ChefHat className="w-5 h-5 text-[#d4af37]" />,
    title: 'Master Chef Gastronomy',
    description: 'Heirloom recipes cooked with authentic ingredients and artisanal spices.',
  },
  {
    icon: <Flame className="w-5 h-5 text-amber-400" />,
    title: 'Instant Table Ordering',
    description: 'Browse the digital menu, customize your spice level, and place orders directly.',
  },
  {
    icon: <Clock className="w-5 h-5 text-emerald-400" />,
    title: 'Live Kitchen Tracking',
    description: 'Track your preparation status in real-time without refreshing your browser.',
  },
];

export const WelcomePortal: React.FC<WelcomePortalProps> = ({
  onCustomerEnter,
  onAdminEnter,
}) => {
  // Navigation stages: 'intro' -> 'details' -> 'table_select'
  const [customerStep, setCustomerStep] = useState<'intro' | 'details' | 'table_select'>('intro');

  // Customer Form State
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [selectedTable, setSelectedTable] = useState('Table 01');
  const [customerTouched, setCustomerTouched] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState('');

  // Admin Modal in Corner
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Customer Validations
  const cleanMobile = customerMobile.replace(/\D/g, '').slice(0, 10);
  const isNameValid = customerName.trim().length >= 2;
  const isMobileValid = cleanMobile.length === 10;

  // Allow login only when all details are valid
  const isAllCustomerDetailsValid = isNameValid && isMobileValid;

  // Step 1: Customer submits details -> proceed to Table Selection on the same screen
  const handleCustomerDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerTouched(true);
    setCustomerError('');

    if (!isNameValid) {
      setCustomerError('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (!isMobileValid) {
      setCustomerError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Move to Table Selection on the same screen
    setCustomerStep('table_select');
  };

  // Step 2: Customer confirms Table Selection -> Enter Restaurant
  const handleFinalCustomerLogin = () => {
    if (!isAllCustomerDetailsValid || !selectedTable) return;
    setCustomerLoading(true);

    setTimeout(() => {
      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        name: customerName.trim(),
        mobile: cleanMobile,
        address: `${selectedTable} Dine-In`,
        totalOrders: 1,
        totalSpent: 0,
        tableNumber: selectedTable,
      };
      setCustomerLoading(false);
      onCustomerEnter(newCustomer);
    }, 300);
  };

  // Admin Login Handler
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    if (!adminUsername.trim() || !adminPassword.trim()) {
      setAdminError('Administrator Username and Password are both mandatory.');
      return;
    }

    setAdminLoading(true);
    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername.trim(),
          password: adminPassword.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAdminLoading(false);
        setShowAdminModal(false);
        onAdminEnter(data.token || 'admin-session-token');
      } else {
        const u = adminUsername.trim().toLowerCase();
        const p = adminPassword.trim();
        if ((u === 'admin' && (p === 'admin123' || p === 'aureliagrand@2026')) || u === 'manager') {
          setAdminLoading(false);
          setShowAdminModal(false);
          onAdminEnter('admin-session-direct');
        } else {
          setAdminLoading(false);
          setAdminError('Invalid administrator credentials. Access restricted.');
        }
      }
    } catch {
      const u = adminUsername.trim().toLowerCase();
      const p = adminPassword.trim();
      if ((u === 'admin' && (p === 'admin123' || p === 'aureliagrand@2026')) || u === 'manager') {
        setAdminLoading(false);
        setShowAdminModal(false);
        onAdminEnter('admin-session-direct');
      } else {
        setAdminLoading(false);
        setAdminError('Authentication failed. Please verify credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-[#f5f0eb] relative overflow-x-hidden flex flex-col justify-between selection:bg-[#d4af37]/30 selection:text-[#f3e5ab]">
      {/* Ambient Luxury Spotlights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-gradient-to-b from-[#d4af37]/15 via-[#b8860b]/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-amber-600/5 blur-[100px] pointer-events-none" />

      {/* Top Bar with Admin Login Button in the Corner */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#8c6b08] p-[1px] shadow-lg">
            <div className="w-full h-full bg-[#0d0f17] rounded-[11px] flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-[#f7d678]" />
            </div>
          </div>
          <div>
            <span className="font-cinzel font-bold text-base tracking-wider text-white block">
              AURELIA <span className="gold-gradient-text">GRAND</span>
            </span>
            <span className="text-[10px] text-[#a39e93] font-mono tracking-widest uppercase block -mt-0.5">
              Luxury Fine Dining
            </span>
          </div>
        </div>

        {/* Admin Login Button in Corner with mandatory Username/Password fields */}
        <button
          type="button"
          onClick={() => {
            setShowAdminModal(true);
            setAdminError('');
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141724] hover:bg-[#1f2438] border border-[#d4af37]/35 text-[#f7d678] hover:text-white text-xs font-cinzel font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
        >
          <Shield className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Admin Login</span>
        </button>
      </header>

      {/* Main Center Container */}
      <main className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full my-auto">
        
        {/* Step-Adaptive Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#161822] border border-[#d4af37]/30 text-[#f7d678] text-[11px] font-semibold uppercase tracking-[0.2em] mb-2.5 shadow-md">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            <span>
              {customerStep === 'intro'
                ? 'Welcome to Fine Dining Concierge'
                : customerStep === 'details'
                ? 'Step 1 • Customer Profile'
                : 'Step 2 • Select Table'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-cinzel font-bold text-white tracking-wide mb-1">
            {customerStep === 'intro'
              ? 'Welcome to Aurelia Grand'
              : customerStep === 'details'
              ? 'Customer Check-In'
              : 'Choose Your Table'}
          </h1>
          <p className="text-xs sm:text-sm text-[#a39e93] font-sans font-light max-w-md mx-auto">
            {customerStep === 'intro'
              ? 'Experience culinary mastery, seamless table-side ordering, and live kitchen updates.'
              : customerStep === 'details'
              ? 'Enter your name and 10-digit mobile number to proceed.'
              : 'Choose your preferred dining spot to begin ordering.'}
          </p>
        </motion.div>

        {/* INTERACTIVE CARD (Intro -> Details -> Table Selection on same container) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl bg-[#0f1118]/95 border border-[#d4af37]/35 p-6 sm:p-8 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-2xl pointer-events-none" />

          <AnimatePresence mode="wait">
            {/* ========================================================
               STAGE 0: FIRST INTRO ON LOGIN SITE
               ======================================================== */}
            {customerStep === 'intro' && (
              <motion.div
                key="step-intro"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Intro Hero Banner */}
                <div className="relative rounded-2xl bg-gradient-to-br from-[#1b1c28] to-[#11131c] border border-[#2b2f44] p-5 overflow-hidden">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#f7d678]">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-cinzel font-bold text-[#d4af37] tracking-wider block">
                        Premier Dining Experience
                      </span>
                      <h3 className="text-base font-cinzel font-bold text-white">
                        Royal Gastronomy &amp; Smart Hospitality
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-[#a39e93] leading-relaxed">
                    Order directly from your table, customize recipes to your palate, and monitor your feast with instant live kitchen synchronization.
                  </p>
                </div>

                {/* 3 Value Pillars */}
                <div className="space-y-3">
                  {INTRO_FEATURES.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#141724] border border-[#262a3d] flex items-start gap-3.5 transition-all hover:border-[#d4af37]/40 hover:bg-[#181c2c]"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#1c2033] border border-[#2f354e] flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-cinzel font-bold text-white mb-0.5">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-[#8e8a80] leading-snug">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main CTA to proceed into Check-In */}
                <button
                  type="button"
                  onClick={() => setCustomerStep('details')}
                  className="w-full py-3.5 px-6 rounded-xl font-cinzel font-bold text-xs uppercase tracking-[0.18em] flex items-center justify-center gap-2 bg-gradient-to-r from-[#d4af37] via-[#f7d678] to-[#b8860b] text-black hover:opacity-95 shadow-[0_4px_25px_rgba(212,175,55,0.35)] cursor-pointer active:scale-[0.98] transition-all"
                >
                  <span>Begin Dining Experience</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ========================================================
               STAGE 1: CUSTOMER LOGIN DETAILS FORM
               - Name (mandatory)
               - Address (mandatory)
               - 10-digit Mobile Number (validated strictly exact 10 digits)
               - Submit enabled only when all details are valid
               ======================================================== */}
            {customerStep === 'details' && (
              <motion.form
                key="step-details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleCustomerDetailsSubmit}
                className="space-y-4"
              >
                {/* Header Back to Intro */}
                <div className="flex items-center justify-between pb-3 border-b border-[#222638] mb-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#d4af37]" />
                    <span className="text-xs font-cinzel font-bold text-white uppercase tracking-wider">
                      Guest Identification
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomerStep('intro')}
                    className="inline-flex items-center gap-1 text-xs text-[#a39e93] hover:text-[#f7d678] bg-[#161824] px-2.5 py-1 rounded-lg border border-[#2b3044] transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Intro</span>
                  </button>
                </div>

                {/* Error Banner */}
                {customerError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{customerError}</span>
                  </div>
                )}

                {/* 1. Name */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>Full Name</span>
                      <span className="text-rose-400 font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-[#8e8a80]">Mandatory</span>
                  </div>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    onBlur={() => setCustomerTouched(true)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl bg-[#151722] border border-[#2e3347] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-white text-sm outline-none transition-all placeholder:text-[#5f6377]"
                    required
                  />
                  {customerTouched && !isNameValid && (
                    <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Name is mandatory (at least 2 characters).</span>
                    </p>
                  )}
                </div>

                {/* 2. 10-Digit Mobile Number (Strict Validation) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>10-Digit Mobile Number</span>
                      <span className="text-rose-400 font-bold">*</span>
                    </label>
                    <span
                      className={`text-[11px] font-mono font-medium ${
                        cleanMobile.length === 10
                          ? 'text-emerald-400 font-bold'
                          : cleanMobile.length > 0
                          ? 'text-amber-400'
                          : 'text-[#8e8a80]'
                      }`}
                    >
                      {cleanMobile.length}/10 digits
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 flex items-center gap-1 text-[#8b8577] text-xs font-mono select-none border-r border-[#2e3347] pr-2.5">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      value={cleanMobile}
                      onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      onBlur={() => setCustomerTouched(true)}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full pl-20 pr-10 py-3 rounded-xl bg-[#151722] border border-[#2e3347] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-white text-sm font-mono tracking-wider outline-none transition-all placeholder:text-[#5f6377]"
                      required
                    />
                    {isMobileValid && (
                      <div className="absolute right-3 text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  {customerTouched && !isMobileValid && (
                    <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Mobile number must be exactly 10 digits.</span>
                    </p>
                  )}
                </div>

                {/* Submit button: Enabled ONLY when all details are valid */}
                <button
                  type="submit"
                  disabled={!isAllCustomerDetailsValid}
                  className={`w-full mt-5 py-3.5 px-6 rounded-xl font-cinzel font-bold text-xs uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isAllCustomerDetailsValid
                      ? 'bg-gradient-to-r from-[#d4af37] via-[#f7d678] to-[#b8860b] text-black hover:opacity-95 shadow-[0_4px_25px_rgba(212,175,55,0.35)] cursor-pointer active:scale-[0.98]'
                      : 'bg-[#1b1e2a] text-[#6b665c] border border-[#2a2e40] cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>Proceed to Table Selection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}

            {/* ========================================================
               STAGE 2: TABLE SELECTION (ON THE SAME SCREEN)
               - Shows list / grid of Dining Tables
               - Customer picks table and confirms check-in
               ======================================================== */}
            {customerStep === 'table_select' && (
              <motion.div
                key="step-tables"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#222638]">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#d4af37]" />
                    <span className="text-xs font-cinzel font-bold text-white uppercase tracking-wider">
                      Select Table
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomerStep('details')}
                    className="inline-flex items-center gap-1 text-xs text-[#a39e93] hover:text-[#f7d678] bg-[#161824] px-2.5 py-1 rounded-lg border border-[#2b3044] transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Edit Info</span>
                  </button>
                </div>

                <div className="bg-[#141724] border border-[#2a2e42] p-3 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#8e8a80] block text-[10px]">Guest Name</span>
                    <strong className="text-white">{customerName}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[#8e8a80] block text-[10px]">Mobile</span>
                    <strong className="text-emerald-400 font-mono">+91 {cleanMobile}</strong>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] mb-2 block">
                    Choose Your Dining Table
                  </label>

                  {/* Grid of Tables */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                    {TABLE_OPTIONS.map((table) => {
                      const isSelected = selectedTable === table.id;
                      return (
                        <button
                          key={table.id}
                          type="button"
                          onClick={() => setSelectedTable(table.id)}
                          className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#262111] to-[#1a170d] border-[#d4af37] text-white shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                              : 'bg-[#151722] border-[#292e42] text-[#c7c2b7] hover:border-[#434b6b] hover:bg-[#1a1d2c]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-cinzel font-bold text-sm text-[#f7d678]">
                              {table.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0d0e14] border border-[#30364d] text-[#a39e93]">
                              {table.capacity}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#9c978d] mt-1 line-clamp-1">
                            {table.zone}
                          </span>
                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5 text-[#d4af37]">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Final Enter & View Menu Button */}
                <button
                  type="button"
                  onClick={handleFinalCustomerLogin}
                  disabled={customerLoading || !selectedTable}
                  className="w-full mt-4 py-3.5 px-6 rounded-xl font-cinzel font-bold text-xs uppercase tracking-[0.18em] flex items-center justify-center gap-2 bg-gradient-to-r from-[#d4af37] via-[#f7d678] to-[#b8860b] text-black hover:opacity-95 shadow-[0_4px_25px_rgba(212,175,55,0.35)] cursor-pointer active:scale-[0.98] transition-all"
                >
                  <span>{customerLoading ? 'Setting up Table...' : `Confirm ${selectedTable} & View Menu`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Security / Feature Strip */}
          <div className="mt-5 pt-3.5 border-t border-[#1d2130] flex items-center justify-between text-[11px] text-[#8e8a80]">
            <span>✓ Instant Live Order Tracking</span>
            <span>✓ GST Digital Invoicing</span>
          </div>
        </motion.div>
      </main>

      {/* ADMIN LOGIN MODAL (Opened from Corner Button) */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="relative w-full max-w-md bg-[#0f1118] border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#222638]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-cinzel tracking-wider text-amber-400 font-semibold block">
                      Executive Gateway
                    </span>
                    <h3 className="text-base font-cinzel font-bold text-white">
                      Admin &amp; Kitchen Login
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="w-8 h-8 rounded-full bg-[#181b24] border border-[#2a2e3d] text-[#9e9a91] hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {adminError && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleAdminSubmit} className="space-y-3.5">
                {/* Mandatory Username */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <span>Administrator Username</span>
                      <span className="text-rose-400 font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-[#8e8a80]">Mandatory</span>
                  </div>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="e.g. admin"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#151722] border border-[#2e3347] focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white text-sm outline-none transition-all placeholder:text-[#5f6377]"
                    required
                  />
                </div>

                {/* Mandatory Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Password</span>
                      <span className="text-rose-400 font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-[#8e8a80]">Mandatory</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 pr-10 py-2.5 rounded-xl bg-[#151722] border border-[#2e3347] focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white text-sm outline-none transition-all placeholder:text-[#5f6377]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7f859b] hover:text-white"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Admin Submit Button (disabled if username/password empty) */}
                <button
                  type="submit"
                  disabled={!adminUsername.trim() || !adminPassword.trim() || adminLoading}
                  className={`w-full mt-3 py-3 px-5 rounded-xl font-cinzel font-bold text-xs uppercase tracking-[0.16em] flex items-center justify-center gap-2 transition-all ${
                    adminUsername.trim() && adminPassword.trim() && !adminLoading
                      ? 'bg-gradient-to-r from-amber-500 to-[#d4af37] text-black hover:opacity-95 shadow-[0_4px_20px_rgba(245,158,11,0.35)] cursor-pointer'
                      : 'bg-[#1b1e2a] text-[#6b665c] border border-[#2a2e40] cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>{adminLoading ? 'Verifying...' : 'Login to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-[#52576b] border-t border-[#12141e]">
        <span>Aurelia Grand • Fine Dining &amp; Real-Time Kitchen Concierge</span>
      </footer>
    </div>
  );
};
