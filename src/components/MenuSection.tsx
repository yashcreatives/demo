import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, Sparkles, Heart } from 'lucide-react';
import { MenuItem, FoodCategory, DietType } from '../types';
import { MenuItemCard } from './MenuItemCard';

interface MenuSectionProps {
  menuItems: MenuItem[];
  cartQuantities: Record<string, number>;
  favorites: string[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (item: MenuItem, newQuantity: number) => void;
  onToggleFavorite: (itemId: string) => void;
  onOpenDetails: (item: MenuItem) => void;
}

const CATEGORIES: FoodCategory[] = [
  'Starters',
  'South Indian Signature',
  'North Indian',
  'Biryani',
  'Seafood',
  'Continental',
  'Desserts',
  'Beverages',
];

export const MenuSection: React.FC<MenuSectionProps> = ({
  menuItems,
  cartQuantities,
  favorites,
  onAddToCart,
  onUpdateQuantity,
  onToggleFavorite,
  onOpenDetails,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Category counts calculation
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: menuItems.length };
    CATEGORIES.forEach((cat) => {
      counts[cat] = menuItems.filter((item) => item.category === cat).length;
    });
    return counts;
  }, [menuItems]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }
        // Diet filter
        if (dietFilter !== 'all' && item.dietType !== dietFilter) {
          return false;
        }
        // Favorites filter
        if (showOnlyFavorites && !favorites.includes(item.id)) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = item.name.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          return matchName || matchDesc || matchCat;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        // Featured / Bestseller default
        if (a.isChefsSpecial && !b.isChefsSpecial) return -1;
        if (!a.isChefsSpecial && b.isChefsSpecial) return 1;
        if (a.isBestseller && !b.isBestseller) return -1;
        if (!a.isBestseller && b.isBestseller) return 1;
        return 0;
      });
  }, [menuItems, selectedCategory, dietFilter, showOnlyFavorites, favorites, searchQuery, sortBy]);

  return (
    <section id="menu-section" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b1e2a] border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Haute Gastronomie</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-display font-bold text-[#fdfbf7] tracking-tight">
          The Grand Epicurean Menu
        </h2>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto my-4" />
        <p className="text-sm sm:text-base text-[#a8a399] font-sans leading-relaxed">
          Crafted by master culinary artisans using royal heirloom spices, locally sourced organic produce, and time-honored slow-cooking methods.
        </p>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 justify-between bg-[#12141c]/80 border border-[#d4af37]/20 p-4 rounded-2xl backdrop-blur-md">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9e9a91]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, ingredients, curries, biryanis..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#181b25] border border-[#2a2e3e] rounded-xl text-sm text-[#fdfbf7] placeholder-[#73706a] focus:outline-none focus:border-[#d4af37] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9e9a91] hover:text-[#fdfbf7]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Diet Filter Buttons */}
            <div className="inline-flex rounded-xl bg-[#181b25] border border-[#2a2e3e] p-1 text-xs">
              <button
                onClick={() => setDietFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  dietFilter === 'all'
                    ? 'bg-[#d4af37] text-black font-semibold shadow-sm'
                    : 'text-[#a8a399] hover:text-[#fdfbf7]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDietFilter('veg')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  dietFilter === 'veg'
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Veg
              </button>
              <button
                onClick={() => setDietFilter('non-veg')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  dietFilter === 'non-veg'
                    ? 'bg-red-700 text-white font-semibold shadow-sm'
                    : 'text-red-400 hover:text-red-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Non-Veg
              </button>
            </div>

            {/* Favorites Toggle */}
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                showOnlyFavorites
                  ? 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                  : 'bg-[#181b25] border-[#2a2e3e] text-[#a8a399] hover:text-[#fdfbf7]'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-rose-400 text-rose-400' : ''}`}
              />
              <span>Favorites ({favorites.length})</span>
            </button>

            {/* Sort Selector */}
            <div className="relative flex items-center bg-[#181b25] border border-[#2a2e3e] rounded-xl px-2.5 py-1 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#d4af37] mr-2 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[#dcd7ce] focus:outline-none pr-3 py-1 cursor-pointer"
              >
                <option value="featured" className="bg-[#181b25] text-[#dcd7ce]">
                  Featured & Signature
                </option>
                <option value="rating" className="bg-[#181b25] text-[#dcd7ce]">
                  Highest Rated (⭐)
                </option>
                <option value="price-low" className="bg-[#181b25] text-[#dcd7ce]">
                  Price: Low to High
                </option>
                <option value="price-high" className="bg-[#181b25] text-[#dcd7ce]">
                  Price: High to Low
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Horizontal Navigation Scroll */}
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-cinzel font-semibold tracking-wider transition-all duration-200 border ${
                selectedCategory === 'All'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-black border-transparent shadow-[0_4px_15px_rgba(212,175,55,0.3)]'
                  : 'bg-[#12141c] border-[#d4af37]/20 text-[#c7c2b6] hover:border-[#d4af37]/50 hover:text-[#fdfbf7]'
              }`}
            >
              All Courses ({categoryCounts['All'] || 0})
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-cinzel font-semibold tracking-wider transition-all duration-200 border ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-black border-transparent shadow-[0_4px_15px_rgba(212,175,55,0.3)]'
                    : 'bg-[#12141c] border-[#d4af37]/20 text-[#c7c2b6] hover:border-[#d4af37]/50 hover:text-[#fdfbf7]'
                }`}
              >
                {cat} ({categoryCounts[cat] || 0})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-[#8c887f] mb-6 px-1">
        <span>
          Presenting <strong className="text-[#f7d678]">{filteredItems.length}</strong> delicacies
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          {dietFilter !== 'all' && ` (${dietFilter === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'})`}
        </span>
        {(searchQuery || dietFilter !== 'all' || showOnlyFavorites || selectedCategory !== 'All') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setDietFilter('all');
              setShowOnlyFavorites(false);
              setSelectedCategory('All');
            }}
            className="text-[#d4af37] hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Dishes Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center bg-[#12141c]/50 rounded-2xl border border-[#2a2e3e] max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-[#1b1e2a] flex items-center justify-center mx-auto mb-4 border border-[#d4af37]/30 text-[#d4af37]">
            <Filter className="w-7 h-7" />
          </div>
          <h3 className="font-serif-display text-xl text-[#fdfbf7] font-semibold mb-2">
            No Delicacies Found
          </h3>
          <p className="text-xs text-[#9e9a91] mb-6">
            We couldn&apos;t find any dishes matching your current selection. Please adjust your filters or search keywords.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setDietFilter('all');
              setShowOnlyFavorites(false);
              setSelectedCategory('All');
            }}
            className="px-5 py-2.5 rounded-xl bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-wider"
          >
            View Complete Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              inCartQuantity={cartQuantities[item.id] || 0}
              isFavorite={favorites.includes(item.id)}
              onAddToCart={onAddToCart}
              onUpdateQuantity={onUpdateQuantity}
              onToggleFavorite={onToggleFavorite}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      )}
    </section>
  );
};
