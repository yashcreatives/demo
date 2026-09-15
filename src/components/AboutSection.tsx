import React from 'react';
import { motion } from 'motion/react';
import { Award, Wine, Flame, Sparkles, ChefHat, Clock } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="space-y-24 py-12">
      {/* Heritage & Culinary Philosophy */}
      <section id="about-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Narrative */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1b1e2a] border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold uppercase tracking-widest">
              <Award className="w-3.5 h-3.5" />
              <span>A Legacy of Royal Hospitality</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-display font-bold text-[#fdfbf7] leading-tight">
              An Ode to Indian Culinary Royalty &amp; Contemporary Art
            </h2>

            <p className="text-sm sm:text-base text-[#a8a399] font-sans leading-relaxed">
              At Aurelia Grand, every culinary passage is an evocative journey across the princely states of India and high-contemporary gastronomy. Our kitchen is guided by third-generation master chefs who blend ancient dum-pukht techniques with avant-garde French plating.
            </p>

            <p className="text-sm text-[#8f8a80] leading-relaxed">
              From our 24-karat edible gold dusted signatures to hand-foraged Himalayan morels and cold-pressed coastal coconut infusions, each ingredient is chosen with uncompromising devotion.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#222634]">
              <div>
                <span className="font-cinzel text-2xl sm:text-3xl font-bold text-[#f7d678] block">
                  3 Michelin
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#8c887f]">Star Mentors</span>
              </div>
              <div>
                <span className="font-cinzel text-2xl sm:text-3xl font-bold text-[#f7d678] block">
                  100%
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#8c887f]">Organic Spices</span>
              </div>
              <div>
                <span className="font-cinzel text-2xl sm:text-3xl font-bold text-[#f7d678] block">
                  24th
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#8c887f]">Floor Vista</span>
              </div>
            </div>
          </div>

          {/* Right Imagery Collage */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#d4af37]/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
              <img
                src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80"
                alt="Aurelia Grand Interior"
                referrerPolicy="no-referrer"
                className="w-full h-[440px] object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-transparent to-transparent" />
            </div>

            {/* Floating Luxury Badge */}
            <div className="absolute -bottom-6 -left-6 bg-[#12141c]/95 backdrop-blur-md border border-[#d4af37]/40 p-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#aa820a] flex items-center justify-center text-black">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-cinzel font-bold text-[#f7d678] block">
                  Private Salon &amp; Cellar
                </span>
                <span className="text-[11px] text-[#9e9a91]">Curated for 40 bespoke diners daily</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Aurelia Experience Pillar Cards */}
      <section id="experience-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase font-cinzel font-bold tracking-[0.25em] text-[#d4af37]">
            The Aurelia Standards
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-display font-bold text-[#fdfbf7] mt-2">
            Crafted Beyond Perfection
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto my-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-[#12141c]/80 border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1b1e2a] border border-[#d4af37]/30 flex items-center justify-center text-[#f7d678]">
              <ChefHat className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif-display font-bold text-[#fdfbf7]">Master Chef Lineage</h3>
            <p className="text-xs sm:text-sm text-[#a8a399] leading-relaxed">
              Every master chef in our salon has honed their craft across Michelin-starred dynasties and royal kitchens of Awadh and Hyderabad.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#12141c]/80 border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1b1e2a] border border-[#d4af37]/30 flex items-center justify-center text-[#f7d678]">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif-display font-bold text-[#fdfbf7]">Slow Clay Charcoal Fire</h3>
            <p className="text-xs sm:text-sm text-[#a8a399] leading-relaxed">
              Dishes like our Dal Aurelia simmer undisturbed for 24 continuous hours over sweet mango wood embers, releasing unfathomable richness.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#12141c]/80 border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1b1e2a] border border-[#d4af37]/30 flex items-center justify-center text-[#f7d678]">
              <Wine className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif-display font-bold text-[#fdfbf7]">Grand Cru Cellar Pairing</h3>
            <p className="text-xs sm:text-sm text-[#a8a399] leading-relaxed">
              An exclusive selection of over 300 rare old-world vintages and artisanal single-estate teas curated to elevate every course.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
