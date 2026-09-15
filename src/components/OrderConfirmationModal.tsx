import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Clock, Utensils, ArrowRight, X } from 'lucide-react';
import { Order } from '../types';
import { playSuccessChime } from '../utils/audio';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onOpenLiveTracker: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onOpenLiveTracker,
}) => {
  useEffect(() => {
    if (order) {
      playSuccessChime();
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#f7d678', '#fff', '#e5c05b'],
        });
      } catch {
        // Fallback if confetti fails
      }
    }
  }, [order]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-[#12141c] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-center space-y-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#181b24] border border-[#2a2e3d] text-[#9e9a91] hover:text-[#fdfbf7] flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Success Icon */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#f7d678]/10 border-2 border-[#d4af37] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(212,175,55,0.4)]">
          <CheckCircle2 className="w-10 h-10 text-[#f7d678]" />
        </div>

        <div>
          <span className="text-xs uppercase font-cinzel font-bold tracking-[0.25em] text-[#d4af37]">
            Order Confirmed & Sent to Kitchen
          </span>
          <h2 className="text-3xl font-serif-display font-bold text-[#fdfbf7] mt-1">
            Thank You, {order.customer.name}
          </h2>
          <p className="text-xs text-[#a8a399] mt-2">
            Your dining order <strong className="text-[#f7d678]">{order.orderNumber}</strong> has been transmitted directly to our Executive Chef line.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#181b25] border border-[#2a2e3e] rounded-2xl p-4 text-left space-y-3 text-xs">
          <div className="flex justify-between pb-2 border-b border-[#2a2e3e]">
            <span className="text-[#9e9a91]">Service Station:</span>
            <span className="font-semibold text-[#fdfbf7]">{order.customer.tableNumber || 'Table 7'}</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-[#c9c5bc]">
                <span>
                  {it.name} <strong className="text-[#f7d678]">× {it.quantity}</strong>
                </span>
                <span className="font-cinzel text-[#fdfbf7]">
                  ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#2a2e3e] flex justify-between items-baseline text-sm font-bold">
            <span className="text-[#fdfbf7]">Grand Total Paid</span>
            <span className="font-cinzel text-xl text-[#f7d678]">
              ₹{order.grandTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="space-y-3">
          <button
            onClick={() => {
              onClose();
              onOpenLiveTracker();
            }}
            className="w-full py-4 bg-gradient-to-r from-[#d4af37] via-[#f7d678] to-[#aa820a] hover:from-[#f7d678] hover:to-[#c59b27] text-black font-cinzel font-bold text-xs tracking-[0.15em] uppercase rounded-xl shadow-[0_4px_25px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Track Live Order Status</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-[#a8a399] hover:text-[#fdfbf7] font-medium transition-colors"
          >
            Return to Menu
          </button>
        </div>
      </motion.div>
    </div>
  );
};
