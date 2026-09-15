import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Clock, MapPin, Phone, ChevronDown, UtensilsCrossed } from 'lucide-react';

interface HeroProps {
  onExploreMenu: () => void;
  onOpenLiveTracking?: () => void;
  hasActiveOrder?: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onExploreMenu, onOpenLiveTracking, hasActiveOrder }) => {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-between overflow-hidden pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Background with subtle luxury ambient glow and vignette */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Cinematic ambient spotlight */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#d4af37]/12 to-transparent blur-[140px] rounded-full" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#0b0c10] to-transparent" />
      </div>

      {/* Hero Content Centerpiece */}
      <div className="relative z-10 max-w-5xl mx-auto text-center my-auto">
        {/* Grand Restaurant Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-cinzel text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase tracking-[0.12em] text-[#fdfbf7] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]"
        >
          Yash Creations <span className="gold-gradient-text">Demo</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-2xl font-serif-display italic text-[#e7bd58] tracking-wider mt-3 mb-6"
        >
          “Where Culinary Art Meets Luxury”
        </motion.p>

        {/* Narrative Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-2xl mx-auto text-sm sm:text-base text-[#bfb9ad] font-sans leading-relaxed mb-10"
        >
          Immerse your senses in a symphony of royal Indian culinary opulence. From tandoor-kissed prime cuts and fragrant dum biryanis to coastal seafood and artisanal desserts, every course is curated for royalty.
        </motion.p>

        {/* Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
        >
          <button
            onClick={onExploreMenu}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#d4af37] via-[#f7d678] to-[#aa820a] hover:from-[#f7d678] hover:to-[#c59b27] text-black font-cinzel font-bold text-sm tracking-[0.15em] uppercase rounded-xl shadow-[0_6px_30px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Explore The Menu</span>
          </button>

          {hasActiveOrder && onOpenLiveTracking && (
            <button
              onClick={onOpenLiveTracking}
              className="w-full sm:w-auto px-7 py-4 bg-[#181b24] hover:bg-[#222634] border border-[#d4af37]/50 text-[#f7d678] font-cinzel font-semibold text-sm tracking-[0.15em] uppercase rounded-xl transition-all duration-300 hover:border-[#d4af37] flex items-center justify-center gap-3 animate-pulse cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Track Live Order</span>
            </button>
          )}
        </motion.div>
      </div>

      {/* Info strip bar at bottom of hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative z-10 mt-12 pt-6 border-t border-[#d4af37]/20 max-w-5xl mx-auto w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#a39f97]">
          <div className="flex items-center justify-center md:justify-start gap-3 p-2 bg-[#12141c]/60 rounded-xl border border-[#d4af37]/10">
            <Clock className="w-4 h-4 text-[#d4af37] shrink-0" />
            <div>
              <span className="font-semibold text-[#fdfbf7] block">Hours of Service</span>
              <span>12:00 PM – 11:30 PM (Daily)</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 p-2 bg-[#12141c]/60 rounded-xl border border-[#d4af37]/10">
            <MapPin className="w-4 h-4 text-[#d4af37] shrink-0" />
            <div>
              <span className="font-semibold text-[#fdfbf7] block">The Penthouse</span>
              <span>Level 24, The Grand Pavilion, Vittal Mallya Rd</span>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-3 p-2 bg-[#12141c]/60 rounded-xl border border-[#d4af37]/10">
            <Phone className="w-4 h-4 text-[#d4af37] shrink-0" />
            <div>
              <span className="font-semibold text-[#fdfbf7] block">Private Concierge</span>
              <span>+91 63834 41561</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center mt-6">
          <button
            onClick={onExploreMenu}
            aria-label="Scroll down to menu"
            className="text-[#d4af37]/60 hover:text-[#d4af37] transition-colors animate-bounce p-1"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </motion.div>
    </section>
  );
};
