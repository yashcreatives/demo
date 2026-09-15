import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Clock, Flame, ShieldAlert, Heart, Plus, Minus, ShoppingBag } from 'lucide-react';
import { MenuItem } from '../types';

interface FoodDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, customization?: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (itemId: string) => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  item,
  onClose,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [specialNote, setSpecialNote] = useState('');

  if (!item) return null;

  const handleAdd = () => {
    onAddToCart(item, quantity, specialNote.trim() || undefined);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl bg-[#12141c] border border-[#d4af37]/30 rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close details"
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 border border-[#d4af37]/40 text-[#f7d678] hover:bg-[#d4af37] hover:text-black flex items-center justify-center transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Favorite button */}
          <button
            onClick={() => onToggleFavorite(item.id)}
            aria-label="Toggle favorite"
            className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/60 border border-[#d4af37]/40 flex items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-[#e53e3e] text-[#e53e3e]' : 'text-[#eae5db]'
              }`}
            />
          </button>

          <div className="overflow-y-auto">
            {/* Food Image Banner */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#181b24]">
              <img
                src={item.imageUrl}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-[#12141c]/40 to-transparent" />

              {/* Diet and Badge tags */}
              <div className="absolute bottom-4 left-6 flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider backdrop-blur-md border ${
                    item.dietType === 'veg'
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-600/50'
                      : 'bg-red-950/80 text-red-400 border-red-600/50'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.dietType === 'veg' ? 'bg-emerald-400' : 'bg-red-500'
                    }`}
                  />
                  <span>{item.dietType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}</span>
                </div>

                {item.isBestseller && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/50">
                    Bestseller
                  </span>
                )}
                {item.isChefsSpecial && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/50">
                    Chef&apos;s Signature
                  </span>
                )}
              </div>
            </div>

            {/* Food Content Details */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
                    {item.category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif-display font-semibold text-[#fdfbf7] mt-1">
                    {item.name}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-cinzel font-bold text-[#f7d678]">
                    ₹{item.price.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-[#9e9a91] tracking-wide">Inclusive of all taxes</span>
                </div>
              </div>

              {/* Badges / Metrics Row */}
              <div className="grid grid-cols-3 gap-3 py-3 border-y border-[#2a2e3d]">
                <div className="flex items-center gap-2 text-[#eae5db]">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-amber-300">{item.rating}</span>
                    <span className="text-[#9e9a91] block text-[10px]">({item.reviewCount} reviews)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[#eae5db]">
                  <Clock className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold">{item.preparationTimeMinutes || 18} mins</span>
                    <span className="text-[#9e9a91] block text-[10px]">Freshly prepared</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[#eae5db]">
                  <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold">{item.calories || 360} kcal</span>
                    <span className="text-[#9e9a91] block text-[10px]">Per serving</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs uppercase font-cinzel tracking-widest text-[#d4af37] mb-2">
                  Culinary Heritage & Profile
                </h4>
                <p className="text-sm sm:text-base text-[#d0cbc2] leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>

              {/* Special Dining Request */}
              <div>
                <label className="block text-xs uppercase font-cinzel tracking-widest text-[#d4af37] mb-2">
                  Special Dining Request (Optional)
                </label>
                <input
                  type="text"
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  placeholder="e.g., Less spicy, no cilantro, extra crisp, etc."
                  className="w-full bg-[#181b24] border border-[#2a2e3d] rounded-xl px-4 py-3 text-sm text-[#fdfbf7] placeholder-[#6e6b64] focus:outline-none focus:border-[#d4af37] transition-colors"
                />
              </div>

              {/* Bottom Action Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#2a2e3d]">
                {/* Quantity Controls */}
                <div className="flex items-center gap-3 bg-[#181b24] border border-[#2a2e3d] rounded-xl px-4 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="text-[#9e9a91] hover:text-[#f7d678] disabled:opacity-30 transition-colors p-1"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-cinzel font-semibold text-lg text-[#fdfbf7] w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-[#9e9a91] hover:text-[#f7d678] transition-colors p-1"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAdd}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-to-r from-[#d4af37] via-[#f7d678] to-[#aa820a] text-black font-semibold rounded-xl hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_4px_25px_rgba(212,175,55,0.35)]"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="font-sans font-bold tracking-wide">
                    Add to Cart • ₹{(item.price * quantity).toLocaleString('en-IN')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
