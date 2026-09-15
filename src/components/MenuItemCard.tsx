import React from 'react';
import { motion } from 'motion/react';
import { Star, Heart, Plus, Minus, Check, Eye } from 'lucide-react';
import { MenuItem } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  inCartQuantity: number;
  isFavorite: boolean;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (item: MenuItem, newQuantity: number) => void;
  onToggleFavorite: (itemId: string) => void;
  onOpenDetails: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  inCartQuantity,
  isFavorite,
  onAddToCart,
  onUpdateQuantity,
  onToggleFavorite,
  onOpenDetails,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col justify-between bg-[#12141c]/90 border border-[#d4af37]/15 hover:border-[#d4af37]/45 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 backdrop-blur-md"
    >
      {/* Top Image Container */}
      <div className="relative h-52 w-full overflow-hidden bg-[#181b24] cursor-pointer" onClick={() => onOpenDetails(item)}>
        <img
          src={item.imageUrl}
          alt={item.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-[#12141c]/20 to-transparent" />

        {/* Diet Indicator (Veg / Non-veg dot) */}
        <div className="absolute top-3 left-3 z-10">
          <div
            className={`w-6 h-6 rounded flex items-center justify-center border-2 bg-black/60 backdrop-blur-md ${
              item.dietType === 'veg' ? 'border-emerald-500' : 'border-red-600'
            }`}
            title={item.dietType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                item.dietType === 'veg' ? 'bg-emerald-400' : 'bg-red-500'
              }`}
            />
          </div>
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-[#d4af37]/30 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-[#e53e3e] text-[#e53e3e]' : 'text-[#f5f0eb]/80 hover:text-[#f7d678]'
            }`}
          />
        </button>

        {/* Badges (Bestseller / Chef's Special / New) */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 z-10">
          {item.isBestseller && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/90 text-black shadow-sm">
              Bestseller
            </span>
          )}
          {item.isChefsSpecial && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#d4af37] text-black shadow-sm">
              Chef&apos;s Special
            </span>
          )}
          {item.isNew && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/90 text-black shadow-sm">
              New
            </span>
          )}
        </div>

        {/* Quick View Hover Hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 border border-[#d4af37]/40 text-[#f7d678] text-xs font-medium">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Rating and category */}
          <div className="flex items-center justify-between text-xs text-[#9e9a91] mb-1.5">
            <span className="uppercase tracking-widest text-[#d4af37] font-semibold text-[11px]">
              {item.category}
            </span>
            <div className="flex items-center gap-1 bg-[#1a1d28] px-2 py-0.5 rounded text-[#f7d678]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-xs text-amber-200">{item.rating}</span>
            </div>
          </div>

          {/* Name */}
          <h3
            onClick={() => onOpenDetails(item)}
            className="font-serif-display text-lg font-semibold text-[#fdfbf7] group-hover:text-[#f7d678] transition-colors cursor-pointer line-clamp-1"
            title={item.name}
          >
            {item.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-[#a39f97] line-clamp-2 mt-1.5 font-sans leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Bottom Pricing and Actions */}
        <div className="pt-3 border-t border-[#222634] flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#7a766f] block">Price</span>
            <span className="text-xl font-cinzel font-bold text-[#f7d678]">
              ₹{item.price.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Add / Quantity Button */}
          <div>
            {!item.isAvailable ? (
              <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed">
                Sold Out
              </span>
            ) : inCartQuantity > 0 ? (
              <div className="flex items-center gap-2 bg-[#1b1e2a] border border-[#d4af37]/40 rounded-xl px-2 py-1 shadow-inner">
                <button
                  onClick={() => onUpdateQuantity(item, inCartQuantity - 1)}
                  aria-label="Decrease quantity"
                  className="w-6 h-6 rounded flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37]/20 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-5 text-center font-bold font-cinzel text-sm text-[#fdfbf7]">
                  {inCartQuantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item, inCartQuantity + 1)}
                  aria-label="Increase quantity"
                  className="w-6 h-6 rounded flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37]/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAddToCart(item)}
                aria-label={`Add ${item.name} to cart`}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa820a] hover:from-[#f7d678] hover:to-[#c59b27] text-black font-semibold text-xs rounded-xl shadow-[0_2px_15px_rgba(212,175,55,0.25)] transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
