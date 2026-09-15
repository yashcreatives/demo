import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, ChefHat, BellRing, Sparkles, X, ArrowLeft, RefreshCw, XCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { getSocket } from '../services/socket';

interface LiveOrderTrackerProps {
  order: Order | null;
  onClose: () => void;
  allCustomerOrders?: Order[];
  onSelectOrder?: (order: Order) => void;
  onCancelOrder?: (orderId: string) => void;
}

const ORDER_STEPS: { status: OrderStatus; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  {
    status: 'Confirmed',
    label: 'Order Confirmed',
    description: 'Received by kitchen concierge',
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'emerald',
  },
  {
    status: 'Accepted',
    label: 'Accepted by Maitre D',
    description: 'Assigned to Master Chef line',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'amber',
  },
  {
    status: 'Preparing',
    label: 'Preparing in Kitchen',
    description: 'Slow-cooked with heirloom spices',
    icon: <ChefHat className="w-5 h-5" />,
    color: 'blue',
  },
  {
    status: 'Ready',
    label: 'Ready for Service',
    description: 'Plated and ready for delivery',
    icon: <BellRing className="w-5 h-5" />,
    color: 'purple',
  },
  {
    status: 'Completed',
    label: 'Served & Completed',
    description: 'Bon Appétit! Enjoy your royal feast',
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'gold',
  },
];

export const LiveOrderTracker: React.FC<LiveOrderTrackerProps> = ({
  order: initialOrder,
  onClose,
  allCustomerOrders = [],
  onSelectOrder,
  onCancelOrder,
}) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(initialOrder);
  const [statusFlash, setStatusFlash] = useState(false);

  useEffect(() => {
    setCurrentOrder(initialOrder);
  }, [initialOrder]);

  // Real-time Push Listener (BroadcastChannel + Socket.io) for 0ms latency status updates
  useEffect(() => {
    if (!currentOrder) return;

    const socket = getSocket();
    const handleSocketUpdate = (updatedOrder: Order) => {
      if (updatedOrder.id === currentOrder.id || updatedOrder.orderNumber === currentOrder.orderNumber) {
        setCurrentOrder(updatedOrder);
        setStatusFlash(true);
        setTimeout(() => setStatusFlash(false), 2000);
      }
    };

    socket.on('order:updated', handleSocketUpdate);
    socket.on('order_status_updated', handleSocketUpdate);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('restaurant_orders_channel');
      channel.onmessage = (event) => {
        const data = event.data;
        if (data?.type === 'ORDER_STATUS_CHANGED' && (data.orderId === currentOrder.id || data.orderId === currentOrder.orderNumber)) {
          setCurrentOrder((prev) => prev ? { ...prev, status: data.status, updatedAt: new Date().toISOString() } : null);
          setStatusFlash(true);
          setTimeout(() => setStatusFlash(false), 2000);
        }
      };
    } catch {
      // Fallback
    }

    return () => {
      socket.off('order:updated', handleSocketUpdate);
      socket.off('order_status_updated', handleSocketUpdate);
      if (channel) channel.close();
    };
  }, [currentOrder?.id, currentOrder?.orderNumber]);

  if (!currentOrder) return null;

  const order = currentOrder;
  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === 'Cancelled';

  // Calculate estimated completion time
  const orderDate = new Date(order.createdAt);
  const formattedTime = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        className="relative w-full max-w-2xl bg-[#12141c] border border-[#d4af37]/35 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col my-auto"
      >
        {/* Header Strip */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-[#1c1f2c] to-[#12141c] border-b border-[#2a2e3d]">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs text-[#a8a399] hover:text-[#f7d678] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Menu</span>
            </button>

            {/* Live Socket Sync Pulse */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Kitchen Sync</span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#181b24] border border-[#2a2e3d] text-[#9e9a91] hover:text-[#fdfbf7] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-cinzel tracking-widest text-[#d4af37]">
                Live Order Tracker
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#fdfbf7] flex items-center gap-3 mt-1">
                <span>{order.orderNumber}</span>
                <span className="text-sm font-sans font-normal px-2.5 py-0.5 rounded-lg bg-[#242838] text-[#c9c5bc] border border-[#34394d]">
                  {order.customer.tableNumber || 'Table 7'}
                </span>
              </h2>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-xs text-[#9e9a91] block">Grand Total</span>
              <span className="text-2xl sm:text-3xl font-cinzel font-bold text-[#f7d678]">
                ₹{order.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Multiple Orders Selector (if any) */}
          {allCustomerOrders.length > 1 && onSelectOrder && (
            <div className="mt-4 pt-4 border-t border-[#2a2e3d] flex items-center gap-2 overflow-x-auto">
              <span className="text-xs text-[#9e9a91] shrink-0">Switch Order:</span>
              {allCustomerOrders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => onSelectOrder(o)}
                  className={`px-3 py-1 rounded-lg text-xs font-cinzel font-semibold transition-all shrink-0 ${
                    o.id === order.id
                      ? 'bg-[#d4af37] text-black shadow-sm'
                      : 'bg-[#181b24] text-[#a8a399] border border-[#2a2e3d] hover:text-[#fdfbf7]'
                  }`}
                >
                  {o.orderNumber} ({o.status})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Stepper Progression */}
        <div className="p-6 sm:p-8 space-y-6">
          {isCancelled ? (
            <div className="p-6 rounded-2xl bg-red-950/40 border border-red-500/40 text-center space-y-2">
              <XCircle className="w-10 h-10 text-red-400 mx-auto" />
              <h3 className="font-serif-display text-lg text-red-200 font-bold">
                Order Cancelled
              </h3>
              <p className="text-xs text-red-300 max-w-sm mx-auto">
                This order was cancelled. If you have questions, please speak directly to our floor concierge.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ORDER_STEPS.map((step, idx) => {
                const isPast = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isFuture = idx > currentStepIndex;

                return (
                  <div key={step.status} className="flex items-start gap-4 relative">
                    {/* Connecting Line */}
                    {idx < ORDER_STEPS.length - 1 && (
                      <div
                        className={`absolute left-5 top-10 bottom-0 w-0.5 -mb-4 transition-colors duration-500 ${
                          isPast ? 'bg-[#d4af37]' : 'bg-[#262a38]'
                        }`}
                      />
                    )}

                    {/* Step Icon Node */}
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isCurrent
                          ? 'bg-[#d4af37] text-black ring-4 ring-[#d4af37]/30 shadow-[0_0_20px_rgba(212,175,55,0.6)] animate-pulse'
                          : isPast
                          ? 'bg-[#1b2a1e] text-emerald-400 border border-emerald-500/50'
                          : 'bg-[#181b24] text-[#636059] border border-[#2a2e3d]'
                      }`}
                    >
                      {step.icon}
                    </div>

                    {/* Step Label & Details */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-sm sm:text-base font-cinzel font-bold transition-colors ${
                            isCurrent
                              ? 'text-[#f7d678]'
                              : isPast
                              ? 'text-[#fdfbf7]'
                              : 'text-[#636059]'
                          }`}
                        >
                          {step.label}
                        </h4>
                        {isCurrent && (
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f7d678] border border-[#d4af37]/40">
                            Current Stage
                          </span>
                        )}
                        {isPast && (
                          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                            Done
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#9e9a91] mt-0.5">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ordered Dishes Summary */}
          <div className="p-4 rounded-2xl bg-[#181b25] border border-[#2a2e3d] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#9e9a91] pb-2 border-b border-[#2a2e3d]">
              <span className="uppercase tracking-wider font-cinzel text-[#d4af37]">
                Ordered Delicacies ({order.items.length})
              </span>
              <span>Placed at {formattedTime}</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {order.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-[#e8e4dc]">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        it.dietType === 'veg' ? 'bg-emerald-400' : 'bg-red-500'
                      }`}
                    />
                    <span className="truncate">
                      {it.name} <strong className="text-[#f7d678]">× {it.quantity}</strong>
                    </span>
                  </div>
                  <span className="font-cinzel text-[#c9c5bc] shrink-0 ml-2">
                    ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {order.specialInstructions && (
              <div className="pt-2 border-t border-[#2a2e3d] text-[11px] text-[#9e9a91]">
                <strong className="text-[#d4af37]">Chef Instruction:</strong> {order.specialInstructions}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-2">
            {order.status === 'Confirmed' && onCancelOrder && (
              <button
                onClick={() => onCancelOrder(order.id)}
                className="text-xs text-red-400 hover:text-red-300 hover:underline"
              >
                Cancel Order
              </button>
            )}

            <button
              onClick={onClose}
              className="ml-auto px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#aa820a] hover:from-[#f7d678] hover:to-[#c59b27] text-black font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              Order More Delicacies
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
