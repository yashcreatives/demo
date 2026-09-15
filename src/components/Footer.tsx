import React from 'react';
import { Logo } from './Logo';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact-section" className="bg-[#07080b] border-t border-[#d4af37]/20 pt-16 pb-12 text-[#9e9a91]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-xs text-[#a8a399] leading-relaxed">
              Where Culinary Art Meets Luxury. Experience an unprecedented confluence of Indian culinary heritage, master craftsmanship, and modern gastronomic innovation.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[#d4af37]">
              <a href="#" className="w-8 h-8 rounded-full bg-[#12141c] border border-[#2a2e3d] flex items-center justify-center hover:border-[#d4af37] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#12141c] border border-[#2a2e3d] flex items-center justify-center hover:border-[#d4af37] transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#12141c] border border-[#2a2e3d] flex items-center justify-center hover:border-[#d4af37] transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Operating Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-cinzel font-bold uppercase tracking-wider text-[#fdfbf7]">
              Hours of Service
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[#f7d678] font-medium block">Lunch Salon</span>
                <span>12:00 PM – 03:30 PM (Daily)</span>
              </div>
              <div>
                <span className="text-[#f7d678] font-medium block">Twilight &amp; High Tea</span>
                <span>04:30 PM – 06:30 PM</span>
              </div>
              <div>
                <span className="text-[#f7d678] font-medium block">Royal Dinner Seating</span>
                <span>07:00 PM – 11:30 PM</span>
              </div>
              <div className="pt-2 text-[11px] text-[#73706a]">
                *Last seating &amp; kitchen orders at 11:00 PM
              </div>
            </div>
          </div>

          {/* Col 3: Location & Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-cinzel font-bold uppercase tracking-wider text-[#fdfbf7]">
              Private Concierge
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <span>Level 24, The Grand Pavilion, Vittal Mallya Road, Bengaluru 560001</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>+91 63834 41561</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>maitred@aureliagrand.com</span>
              </div>
            </div>
          </div>

          {/* Col 4: Dining Accolades */}
          <div className="space-y-3">
            <h4 className="text-sm font-cinzel font-bold uppercase tracking-wider text-[#fdfbf7]">
              Dining Distinction
            </h4>
            <div className="p-4 rounded-2xl bg-[#12141c] border border-[#d4af37]/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#f7d678]">
                <Award className="w-4 h-4" />
                <span className="font-cinzel font-bold">5-Star Diamond Award</span>
              </div>
              <p className="text-[11px] text-[#8c887f]">
                Honored as India&apos;s most distinguished culinary landmark for slow-cooked royal traditions.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1a1d28] flex flex-col sm:flex-row items-center justify-between text-xs text-[#73706a] gap-4">
          <p>© {new Date().getFullYear()} Yash Creations Demo. All Rights Reserved. Master Crafted for Luxury.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#d4af37]">Privacy Protocol</a>
            <a href="#" className="hover:text-[#d4af37]">Terms of Grand Dining</a>
            <a href="#" className="hover:text-[#d4af37]">FSSAI Lic. 11222334455667</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
