import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  Flame, 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  Phone, 
  ShieldCheck, 
  MessageSquare,
  Clock,
  MapPin,
  Volume2,
  VolumeX
} from 'lucide-react';
import { RESTAURANT_WHATSAPP, openWhatsAppChat } from '../utils/whatsapp';
import { soundFx } from '../utils/sound';

interface NavbarProps {
  onNavigate: (view: 'home' | 'menu' | 'deals' | 'about' | 'contact' | 'checkout' | 'account' | 'admin' | 'tracking') => void;
  activeView: string;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeView, onOpenAuthModal }) => {
  const { itemCount, setIsCartOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(soundFx.isEnabled());

  const handleNavClick = (view: any) => {
    soundFx.playClick();
    onNavigate(view);
  };

  const toggleSoundState = () => {
    const newState = soundFx.toggleSound();
    setSoundActive(newState);
  };

  return (
    <>
      {/* Top Notification Announcement Bar */}
      <div id="announcement-bar" className="w-full max-w-full min-w-0 bg-[#18181b] border-b border-[#27272a] text-xs text-zinc-300 py-1.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black uppercase tracking-wider shrink-0">
              Multan Special
            </span>
            <span className="hidden sm:inline text-zinc-300">Open Daily 10:00 AM – 4:00 AM • Fast delivery across Bosan Rd, Cantt, Gulgasht & Multan city!</span>
            <span className="sm:hidden text-zinc-300 text-[11px] truncate">Open 10 AM – 4 AM • Multan</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs shrink-0">
            <button 
              onClick={() => openWhatsAppChat()}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors text-[11px] sm:text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span>WhatsApp: {RESTAURANT_WHATSAPP}</span>
            </button>
            <a href="tel:03067451542" className="hidden md:flex items-center gap-1 text-zinc-400 hover:text-amber-400">
              <Phone className="w-3 h-3" />
              <span>Call Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header id="main-header" className="sticky top-0 z-40 w-full max-w-full min-w-0 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between min-w-0">
          
          {/* Brand Logo */}
          <div 
            id="brand-logo"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0 shrink-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 p-0.5 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#0c0c0e] rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 fill-amber-500" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-['Teko'] text-2xl sm:text-3xl font-bold tracking-wider text-white uppercase leading-none">
                  BONFIRE
                </span>
                <span className="font-['Teko'] text-2xl sm:text-3xl font-bold tracking-wider text-amber-500 uppercase leading-none">
                  PIZZERIA
                </span>
              </div>
              <p className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-zinc-400 truncate">
                MULTAN • ARTISAN FAST FOOD
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav id="desktop-nav" className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-sm font-semibold tracking-wide transition-colors ${
                activeView === 'home' ? 'text-amber-400' : 'text-zinc-300 hover:text-white'
              }`}
            >
              HOME
            </button>
            <button
              onClick={() => handleNavClick('menu')}
              className={`text-sm font-semibold tracking-wide transition-colors ${
                activeView === 'menu' ? 'text-amber-400' : 'text-zinc-300 hover:text-white'
              }`}
            >
              MENU
            </button>
            <button
              onClick={() => handleNavClick('deals')}
              className={`text-sm font-semibold tracking-wide transition-colors ${
                activeView === 'deals' ? 'text-amber-400' : 'text-zinc-300 hover:text-white'
              }`}
            >
              DEALS
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`text-sm font-semibold tracking-wide transition-colors ${
                activeView === 'about' ? 'text-amber-400' : 'text-zinc-300 hover:text-white'
              }`}
            >
              ABOUT US
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`text-sm font-semibold tracking-wide transition-colors ${
                activeView === 'contact' ? 'text-amber-400' : 'text-zinc-300 hover:text-white'
              }`}
            >
              CONTACT
            </button>

            {isAdmin && (
              <button
                id="nav-admin-link"
                onClick={() => handleNavClick('admin')}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider hover:bg-amber-500/20 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                ADMIN DASHBOARD
              </button>
            )}
          </nav>

          {/* Right Action Icons & ORDER ONLINE Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Audio Sound Toggle */}
            <button
              onClick={toggleSoundState}
              className="shrink-0 p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors"
              title={soundActive ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
              aria-label="Toggle Sound Effects"
            >
              {soundActive ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
            </button>

            {/* Account / Login */}
            {user ? (
              <button
                id="btn-account"
                onClick={() => handleNavClick('account')}
                className={`shrink-0 p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center gap-2 ${
                  activeView === 'account' ? 'border-amber-500/50 text-amber-400' : ''
                }`}
                title="Customer Account"
              >
                <User className="w-5 h-5 text-amber-400" />
                <span className="hidden md:inline text-xs font-semibold max-w-[100px] truncate">
                  {user.displayName || user.email?.split('@')[0] || 'My Account'}
                </span>
              </button>
            ) : (
              <button
                id="btn-login-trigger"
                onClick={() => {
                  soundFx.playClick();
                  onOpenAuthModal();
                }}
                className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-200 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                LOGIN
              </button>
            )}

            {/* Cart Button */}
            <button
              id="btn-open-cart"
              onClick={() => {
                soundFx.playClick();
                setIsCartOpen(true);
              }}
              className="shrink-0 relative p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 transition-colors"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span 
                  id="cart-badge-count"
                  className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scaleIn"
                >
                  {itemCount}
                </span>
              )}
            </button>

            {/* ORDER ONLINE Button (Prominent Call to Action) */}
            <button
              id="btn-order-online-nav"
              onClick={() => handleNavClick('menu')}
              className="shrink-0 hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-['Teko'] text-xl font-bold tracking-wide uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-95 transition-all"
            >
              ORDER ONLINE
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="shrink-0 lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div id="mobile-menu-drawer" className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-4 pt-2 pb-6 space-y-3 animate-fadeIn">
            <button
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              className={`w-full text-left py-2 text-sm font-semibold tracking-wide ${
                activeView === 'home' ? 'text-amber-400' : 'text-zinc-300'
              }`}
            >
              HOME
            </button>
            <button
              onClick={() => { onNavigate('menu'); setMobileMenuOpen(false); }}
              className={`w-full text-left py-2 text-sm font-semibold tracking-wide ${
                activeView === 'menu' ? 'text-amber-400' : 'text-zinc-300'
              }`}
            >
              FULL MENU
            </button>
            <button
              onClick={() => { onNavigate('deals'); setMobileMenuOpen(false); }}
              className={`w-full text-left py-2 text-sm font-semibold tracking-wide ${
                activeView === 'deals' ? 'text-amber-400' : 'text-zinc-300'
              }`}
            >
              DEALS & OFFERS
            </button>
            <button
              onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }}
              className={`w-full text-left py-2 text-sm font-semibold tracking-wide ${
                activeView === 'about' ? 'text-amber-400' : 'text-zinc-300'
              }`}
            >
              ABOUT BONFIRE
            </button>
            <button
              onClick={() => { onNavigate('contact'); setMobileMenuOpen(false); }}
              className={`w-full text-left py-2 text-sm font-semibold tracking-wide ${
                activeView === 'contact' ? 'text-amber-400' : 'text-zinc-300'
              }`}
            >
              CONTACT & LOCATION
            </button>

            {isAdmin && (
              <button
                onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 text-sm font-bold text-amber-400 flex items-center gap-2 border-t border-zinc-800 pt-3"
              >
                <ShieldCheck className="w-4 h-4" />
                ADMIN DASHBOARD
              </button>
            )}

            <div className="pt-2 border-t border-zinc-800 flex flex-col gap-2">
              <button
                onClick={() => { onNavigate('menu'); setMobileMenuOpen(false); }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-['Teko'] text-xl font-bold tracking-wider uppercase text-center"
              >
                ORDER ONLINE NOW
              </button>
              <button
                onClick={() => { openWhatsAppChat(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold tracking-wider uppercase text-center flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                CHAT ON WHATSAPP
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
