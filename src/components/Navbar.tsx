import React, { useState } from 'react';
import { ShoppingBag, User, Shield, Menu, X, Bell, UtensilsCrossed, Clock, MapPin, Sparkles, Store, LogOut } from 'lucide-react';
import { Logo } from './Logo';
import { Customer } from '../types';

interface NavbarProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  currentCustomer: Customer | null;
  activeOrderCount: number;
  onOpenLiveTracker: () => void;
  onScrollToSection: (sectionId: string) => void;
  onCustomerLogout?: () => void;
  onOpenCustomerAuth?: () => void;
  onOpenAdminAuth?: () => void;
  isAdminLoggedIn?: boolean;
  onNavigateToAdmin?: () => void;
  onOpenWelcomePortal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  currentCustomer,
  activeOrderCount,
  onOpenLiveTracker,
  onScrollToSection,
  onCustomerLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#090a0e]/90 backdrop-blur-xl border-b border-[#d4af37]/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo size="md" />
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 text-xs uppercase font-cinzel font-semibold tracking-[0.2em]">
            <button
              onClick={() => onScrollToSection('menu-section')}
              className="text-[#c4bfb5] hover:text-[#f7d678] transition-colors"
            >
              The Menu
            </button>

            <button
              onClick={() => onScrollToSection('about-section')}
              className="text-[#c4bfb5] hover:text-[#f7d678] transition-colors"
            >
              Heritage &amp; Art
            </button>

            <button
              onClick={() => onScrollToSection('experience-section')}
              className="text-[#c4bfb5] hover:text-[#f7d678] transition-colors"
            >
              The Experience
            </button>

            <button
              onClick={() => onScrollToSection('contact-section')}
              className="text-[#c4bfb5] hover:text-[#f7d678] transition-colors"
            >
              Concierge
            </button>

            {activeOrderCount > 0 && (
              <button
                onClick={onOpenLiveTracker}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-400 text-[11px] animate-pulse"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Live Kitchen ({activeOrderCount})</span>
              </button>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Seated Table Indicator (Subtle Display, not a button) */}
            {currentCustomer && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131520] border border-[#d4af37]/20 text-xs text-[#e8e4dc]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="font-cinzel font-semibold text-[#f7d678]">
                  {currentCustomer.tableNumber || 'Table'}
                </span>
                <span className="text-[#62677d]">•</span>
                <span className="font-medium text-[#c5c0b6] max-w-[100px] truncate">
                  {currentCustomer.name.split(' ')[0]}
                </span>
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              aria-label="Open cart drawer"
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8860b] hover:from-[#f7d678] hover:to-[#c59b27] text-black font-semibold text-xs transition-all shadow-[0_2px_15px_rgba(212,175,55,0.3)] active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline font-cinzel font-bold">
                {cartCount > 0 ? `₹${cartTotal.toLocaleString('en-IN')}` : 'Cart'}
              </span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-black text-[#f7d678] font-cinzel font-bold text-[11px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Logout / Exit Table Button on Side */}
            {onCustomerLogout && (
              <button
                type="button"
                onClick={onCustomerLogout}
                title="Logout / Exit Table Session"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141724] hover:bg-rose-950/40 border border-[#2a2e40] hover:border-rose-500/50 text-[#a39e93] hover:text-rose-300 text-xs font-cinzel font-semibold transition-all shadow-sm active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#151722] border border-[#2a2e3d] text-[#d4af37]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#2a2e3d] bg-[#0c0e14] px-6 py-6 space-y-4 shadow-2xl">
          <div className="flex flex-col space-y-3 text-sm font-cinzel font-semibold tracking-wider text-[#dcd7ce]">
            <button
              onClick={() => {
                onScrollToSection('menu-section');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-[#f7d678]"
            >
              The Grand Menu
            </button>
            <button
              onClick={() => {
                onScrollToSection('about-section');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-[#f7d678]"
            >
              Heritage &amp; Art
            </button>
            <button
              onClick={() => {
                onScrollToSection('experience-section');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-[#f7d678]"
            >
              Private Dining
            </button>
            <button
              onClick={() => {
                onScrollToSection('contact-section');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-[#f7d678]"
            >
              Concierge &amp; Reservations
            </button>

            {activeOrderCount > 0 && (
              <button
                onClick={() => {
                  onOpenLiveTracker();
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 text-emerald-400 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Track Live Order ({activeOrderCount})
              </button>
            )}

            {onCustomerLogout && (
              <div className="pt-2 border-t border-[#222638]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onCustomerLogout();
                  }}
                  className="w-full py-2 text-left text-rose-400 hover:text-rose-300 flex items-center gap-2 font-cinzel font-bold text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout / Exit Table Session</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
