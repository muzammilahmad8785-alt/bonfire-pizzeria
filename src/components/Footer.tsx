import React from 'react';
import { Flame, Phone, MapPin, Clock, MessageSquare, Heart } from 'lucide-react';
import { RESTAURANT_WHATSAPP, openWhatsAppChat } from '../utils/whatsapp';

interface FooterProps {
  onNavigate: (view: 'home' | 'menu' | 'deals' | 'about' | 'contact' | 'admin' | 'tracking') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer id="main-footer" className="w-full max-w-full min-w-0 bg-[#09090b] border-t border-zinc-800/80 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 min-w-0">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#0c0c0e] rounded-[10px] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
              </div>
              <span className="font-['Teko'] text-3xl font-bold tracking-wider text-white uppercase">
                BONFIRE PIZZERIA
              </span>
            </div>

            <p className="text-zinc-400 leading-relaxed max-w-sm">
              Multan's leading destination for hand-stretched stone baked pizzas, loaded burgers, juicy wings and gourmet late-night cravings. Real pizza, real taste.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => openWhatsAppChat()}
                className="px-4 py-2 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-2 hover:bg-emerald-900/40 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp: {RESTAURANT_WHATSAPP}</span>
              </button>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-white font-['Teko'] text-xl font-bold tracking-wider uppercase">
              QUICK LINKS
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-amber-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('menu')} className="hover:text-amber-400 transition-colors">
                  Explore Full Menu
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('deals')} className="hover:text-amber-400 transition-colors">
                  Super Saver Deals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tracking')} className="hover:text-amber-400 transition-colors">
                  Track Live Order
                </button>
              </li>
            </ul>
          </div>

          {/* Multan Timings */}
          <div className="space-y-3">
            <h4 className="text-white font-['Teko'] text-xl font-bold tracking-wider uppercase">
              OPERATING HOURS
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Monday – Sunday</span>
              </li>
              <li className="font-bold text-zinc-200 pl-6">
                10:00 AM – 4:00 AM
              </li>
              <li className="text-[11px] text-zinc-500 pl-6">
                Late night baking & doorstep delivery active across Multan.
              </li>
            </ul>
          </div>

          {/* Branch Location */}
          <div className="space-y-3">
            <h4 className="text-white font-['Teko'] text-xl font-bold tracking-wider uppercase">
              MULTAN BRANCH
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Main Bosan Road, Gulgasht Colony, Multan, Pakistan</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>0306-7451542</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} BONFIRE PIZZERIA MULTAN. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('admin')} className="text-zinc-600 hover:text-amber-500 transition-colors">
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
