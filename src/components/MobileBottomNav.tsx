import React from 'react';
import { Home, UtensilsCrossed, Tag, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { soundFx } from '../utils/sound';

interface MobileBottomNavProps {
  activeView: string;
  onNavigate: (view: 'home' | 'menu' | 'deals' | 'account') => void;
  onOpenCart: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  onNavigate,
  onOpenCart
}) => {
  const { itemCount } = useCart();

  const handleMobileNav = (view: 'home' | 'menu' | 'deals' | 'account') => {
    soundFx.playClick();
    onNavigate(view);
  };

  const handleCartClick = () => {
    soundFx.playClick();
    onOpenCart();
  };

  return (
    <nav 
      id="mobile-bottom-bar" 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 w-full max-w-full bg-[#0c0c0e]/95 backdrop-blur-xl border-t border-zinc-800/80 px-1 py-2 grid grid-cols-5 shadow-[0_-10px_25px_rgba(0,0,0,0.6)] safe-area-pb"
    >
      <button
        onClick={() => handleMobileNav('home')}
        className={`min-w-0 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all ${
          activeView === 'home' 
            ? 'text-amber-400 font-extrabold scale-105 bg-amber-500/10' 
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Home className="w-5 h-5 shrink-0" />
        <span className="text-[10px] uppercase tracking-wider font-bold truncate">Home</span>
      </button>

      <button
        onClick={() => handleMobileNav('menu')}
        className={`min-w-0 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all ${
          activeView === 'menu' 
            ? 'text-amber-400 font-extrabold scale-105 bg-amber-500/10' 
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <UtensilsCrossed className="w-5 h-5 shrink-0" />
        <span className="text-[10px] uppercase tracking-wider font-bold truncate">Menu</span>
      </button>

      <button
        onClick={() => handleMobileNav('deals')}
        className={`min-w-0 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all ${
          activeView === 'deals' 
            ? 'text-amber-400 font-extrabold scale-105 bg-amber-500/10' 
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Tag className="w-5 h-5 shrink-0" />
        <span className="text-[10px] uppercase tracking-wider font-bold truncate">Deals</span>
      </button>

      <button
        onClick={handleCartClick}
        className="min-w-0 relative flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all active:scale-95"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 shrink-0" />
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-amber-500 text-black font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce">
              {itemCount}
            </span>
          )}
        </div>
        <span className="text-[10px] uppercase tracking-wider font-bold truncate">Cart</span>
      </button>

      <button
        onClick={() => handleMobileNav('account')}
        className={`min-w-0 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all ${
          activeView === 'account' 
            ? 'text-amber-400 font-extrabold scale-105 bg-amber-500/10' 
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <User className="w-5 h-5 shrink-0" />
        <span className="text-[10px] uppercase tracking-wider font-bold truncate">Account</span>
      </button>
    </nav>
  );
};
