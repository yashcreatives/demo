import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Utensils, Sparkles } from 'lucide-react';
import { OrderItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (details: {
    tableNumber: string;
    specialInstructions: string;
  }) => Promise<void>;
  customerName?: string;
  customerMobile?: string;
  onOpenCustomerLogin: () => void;
  gstRate?: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
  customerName,
  customerMobile,
  onOpenCustomerLogin,
  gstRate = 0.05,
}) => {
  const [tableNumber, setTableNumber] = useState('Table 7');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subtotal, GST, Grand Total
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const tax = Math.round(subtotal * gstRate);
  const grandTotal = subtotal + tax;

  const handleCheckout = async () => {
    if (!customerMobile) {
      onOpenCustomerLogin();
      return;
    }
    setIsSubmitting(true);
    try {
      await onPlaceOrder({
        tableNumber,
        specialInstructions,
      });
      onClose();
    } catch (err) {
      console.error('Order submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-[#12141c] border-l border-[#d4af37]/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#2a2e3d] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1b1e2a] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-display text-xl font-bold text-[#fdfbf7]">
                      Your Epicurean Selection
                    </h3>
                    <p className="text-xs text-[#9e9a91]">
                      {items.length} {items.length === 1 ? 'delicacy' : 'delicacies'} in order
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  aria-label="Close cart drawer"
                  className="w-8 h-8 rounded-full bg-[#1b1e2a] border border-[#2a2e3d] text-[#9e9a91] hover:text-[#fdfbf7] flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items Scrollable List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-[#181b24] border border-[#d4af37]/20 flex items-center justify-center mx-auto text-[#d4af37]">
                      <Utensils className="w-7 h-7" />
                    </div>
                    <h4 className="font-serif-display text-lg text-[#fdfbf7]">Your Cart Is Empty</h4>
                    <p className="text-xs text-[#8c887f] max-w-xs mx-auto">
                      Explore our handcrafted delicacies and add dishes to begin your live dining experience.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-xs uppercase font-cinzel tracking-wider text-[#d4af37]">
                        Selected Dishes
                      </span>
                      <button
                        onClick={onClearCart}
                        className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Clear all
                      </button>
                    </div>

                    <div className="space-y-3">
                      {items.map((it) => (
                        <div
                          key={it.menuItemId}
                          className="flex items-center gap-3 p-3 bg-[#181b25] border border-[#222635] rounded-xl"
                        >
                          {/* Item Thumbnail */}
                          <img
                            src={it.imageUrl}
                            alt={it.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 object-cover rounded-lg shrink-0 border border-[#2a2e3d]"
                          />

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  it.dietType === 'veg' ? 'bg-emerald-400' : 'bg-red-500'
                                }`}
                              />
                              <h5 className="text-sm font-semibold text-[#fdfbf7] truncate">
                                {it.name}
                              </h5>
                            </div>
                            <span className="text-xs font-cinzel font-bold text-[#f7d678] block mt-0.5">
                              ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                            </span>
                            {it.customization && (
                              <span className="text-[10px] text-[#9e9a91] italic block truncate">
                                Note: {it.customization}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1.5 bg-[#12141c] border border-[#2a2e3d] rounded-lg p-1">
                            <button
                              onClick={() => onUpdateQuantity(it.menuItemId, it.quantity - 1)}
                              aria-label="Decrease"
                              className="w-5 h-5 flex items-center justify-center text-[#9e9a91] hover:text-[#f7d678]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-4 text-center text-xs font-bold text-[#fdfbf7]">
                              {it.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(it.menuItemId, it.quantity + 1)}
                              aria-label="Increase"
                              className="w-5 h-5 flex items-center justify-center text-[#9e9a91] hover:text-[#f7d678]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => onRemoveItem(it.menuItemId)}
                            aria-label="Remove item"
                            className="text-[#73706a] hover:text-red-400 p-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Table & Dining Request Fields */}
                    <div className="pt-3 border-t border-[#222635] space-y-3">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#d4af37] mb-1 font-cinzel">
                          Select Table / Dining Lounge
                        </label>
                        <select
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          className="w-full bg-[#181b25] border border-[#2a2e3e] rounded-xl px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#d4af37]"
                        >
                          <option value="Table 1">Table 1 (Window Skyline View)</option>
                          <option value="Table 2">Table 2 (Window Skyline View)</option>
                          <option value="Table 3">Table 3 (Central Dining Salon)</option>
                          <option value="Table 4">Table 4 (Central Dining Salon)</option>
                          <option value="Table 5">Table 5 (Terrace Garden)</option>
                          <option value="Table 7">Table 7 (Imperial Booth)</option>
                          <option value="Table 12">Table 12 (Grand Hall)</option>
                          <option value="Private Dining Room 1">Private Dining Room 1</option>
                          <option value="Private Dining Room 2">Private Dining Room 2</option>
                          <option value="Room Service (Suite)">Room Service / Suite Delivery</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#d4af37] mb-1 font-cinzel">
                          Chef / Service Instructions
                        </label>
                        <input
                          type="text"
                          value={specialInstructions}
                          onChange={(e) => setSpecialInstructions(e.target.value)}
                          placeholder="e.g. Serve beverages first, less spicy, celebrating anniversary"
                          className="w-full bg-[#181b25] border border-[#2a2e3e] rounded-xl px-3 py-2 text-xs text-[#fdfbf7] placeholder-[#6e6b64] focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Drawer Footer with Totals & Place Order Button */}
              {items.length > 0 && (
                <div className="p-6 border-t border-[#2a2e3d] bg-[#0e1017] space-y-4">
                  {/* Guest status notification */}
                  {!customerMobile ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                      <span>Sign in with your mobile to place order</span>
                      <button
                        onClick={onOpenCustomerLogin}
                        className="px-2.5 py-1 rounded-md bg-[#d4af37] text-black font-bold text-[11px]"
                      >
                        Sign In
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-[#9e9a91]">
                      <span>
                        Ordering as <strong className="text-[#f7d678]">{customerName}</strong> ({customerMobile})
                      </span>
                      <button onClick={onOpenCustomerLogin} className="text-[#d4af37] hover:underline">
                        Change
                      </button>
                    </div>
                  )}

                  {/* Calculations */}
                  <div className="space-y-1.5 text-xs text-[#bfb9ad]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-cinzel text-sm text-[#fdfbf7]">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST ({(gstRate * 100).toFixed(0)}%)</span>
                      <span className="font-cinzel text-sm text-[#fdfbf7]">
                        ₹{tax.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#222635] flex justify-between items-baseline">
                      <span className="text-sm font-semibold uppercase tracking-wider text-[#fdfbf7]">
                        Grand Total
                      </span>
                      <span className="font-cinzel text-2xl font-bold text-[#f7d678]">
                        ₹{grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Place Order CTA Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-[#d4af37] via-[#f7d678] to-[#aa820a] hover:from-[#f7d678] hover:to-[#c59b27] text-black font-cinzel font-bold text-sm tracking-widest uppercase rounded-xl shadow-[0_4px_25px_rgba(212,175,55,0.4)] transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Sending to Kitchen...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Place Order • ₹{grandTotal.toLocaleString('en-IN')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
