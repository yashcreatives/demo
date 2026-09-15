import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Smartphone, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Customer } from '../types';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCustomer: Customer | null;
  onLogin: (mobile: string, name?: string, address?: string) => Promise<void>;
  onLogout: () => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  currentCustomer,
  onLogin,
  onLogout,
}) => {
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '');
    if (!name.trim()) {
      setError('Customer Full Name is compulsory.');
      return;
    }
    if (cleanMobile.length !== 10) {
      setError('A valid 10-digit mobile number is compulsory.');
      return;
    }
    if (address.trim().length < 5) {
      setError('Delivery address is compulsory (minimum 5 characters).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onLogin(cleanMobile, name.trim(), address.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="relative w-full max-w-md bg-[#12141c] border border-[#d4af37]/35 rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)]"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#181b24] border border-[#2a2e3d] text-[#9e9a91] hover:text-[#fdfbf7] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {currentCustomer ? (
          /* Profile view when already logged in */
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d4af37] to-[#aa820a] p-[2px] mx-auto">
              <div className="w-full h-full rounded-full bg-[#0e1017] flex items-center justify-center text-[#f7d678] font-cinzel font-bold text-xl">
                {currentCustomer.name.slice(0, 2).toUpperCase()}
              </div>
            </div>

            <div>
              <span className="text-xs uppercase font-cinzel tracking-widest text-[#d4af37]">
                Authenticated Guest
              </span>
              <h3 className="text-2xl font-serif-display font-bold text-[#fdfbf7] mt-1">
                {currentCustomer.name}
              </h3>
              <p className="text-xs text-[#9e9a91] mt-0.5">+91 {currentCustomer.mobile}</p>
              {currentCustomer.address && (
                <p className="text-[11px] text-[#8e8a80] mt-1.5 max-w-[80%] mx-auto break-words">
                  {currentCustomer.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#2a2e3d] text-left">
              <div className="bg-[#181b25] p-3 rounded-xl border border-[#2a2e3e]">
                <span className="text-[10px] uppercase tracking-wider text-[#9e9a91] block">
                  Total Orders
                </span>
                <span className="text-lg font-cinzel font-bold text-[#fdfbf7]">
                  {currentCustomer.totalOrders}
                </span>
              </div>
              <div className="bg-[#181b25] p-3 rounded-xl border border-[#2a2e3e]">
                <span className="text-[10px] uppercase tracking-wider text-[#9e9a91] block">
                  Total Spent
                </span>
                <span className="text-lg font-cinzel font-bold text-[#f7d678]">
                  ₹{currentCustomer.totalSpent.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gradient-to-r from-[#d4af37] to-[#aa820a] text-black font-semibold text-xs rounded-xl shadow-md cursor-pointer hover:opacity-95"
              >
                Continue Dining
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setMobile('');
                  setName('');
                  setAddress('');
                }}
                className="px-4 py-3 bg-[#181b24] border border-red-500/40 text-red-400 hover:bg-red-950/40 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Login Form */
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1b1e2a] border border-[#d4af37]/30 flex items-center justify-center mx-auto text-[#d4af37] mb-3">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-[11px] uppercase font-cinzel font-bold tracking-[0.25em] text-[#d4af37]">
                Guest Check-In
              </span>
              <h3 className="text-2xl font-serif-display font-bold text-[#fdfbf7] mt-1">
                Yash Creations Demo
              </h3>
              <p className="text-xs text-[#9e9a91] mt-1">
                Enter your details to manage orders and track kitchen preparation in real time.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#d4af37] mb-1 font-cinzel">
                  Full Name <span className="text-red-400">* Compulsory</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9e9a91]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 bg-[#181b25] border border-[#2a2e3e] rounded-xl text-sm text-[#fdfbf7] placeholder-[#6e6b64] focus:outline-none focus:border-[#d4af37] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#d4af37] mb-1 font-cinzel">
                  Mobile Number <span className="text-red-400">* Compulsory (10 Digits)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#a8a399]">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-3 bg-[#181b25] border border-[#2a2e3e] rounded-xl text-sm font-mono tracking-wide text-[#fdfbf7] placeholder-[#6e6b64] focus:outline-none focus:border-[#d4af37] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#d4af37] mb-1 font-cinzel">
                  Delivery Address <span className="text-red-400">* Compulsory</span>
                </label>
                <div className="relative">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your delivery address"
                    rows={2}
                    className="w-full px-4 py-3 bg-[#181b25] border border-[#2a2e3e] rounded-xl text-sm text-[#fdfbf7] placeholder-[#6e6b64] focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || mobile.length !== 10 || !name.trim() || address.trim().length < 5}
                className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] via-[#f7d678] to-[#aa820a] hover:from-[#f7d678] hover:to-[#c59b27] text-black font-cinzel font-bold text-xs tracking-widest uppercase rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Enter Dining Experience</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};
