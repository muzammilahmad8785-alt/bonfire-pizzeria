import React from 'react';
import { useCart } from '../context/CartContext';
import { useRestaurant } from '../context/RestaurantContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, MessageSquare } from 'lucide-react';
import { generateWhatsAppOrderUrl } from '../utils/whatsapp';
import { soundFx } from '../utils/sound';

interface CartDrawerProps {
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    subtotal, 
    itemCount, 
    isCartOpen, 
    setIsCartOpen 
  } = useCart();
  const { settings } = useRestaurant();

  if (!isCartOpen) return null;

  const deliveryFee = subtotal > 0 ? settings.deliveryFee : 0;
  const grandTotal = subtotal + deliveryFee;
  const isMinimumMet = subtotal >= settings.minimumOrder;

  const handleWhatsAppDirectOrder = () => {
    const url = generateWhatsAppOrderUrl({
      items,
      total: grandTotal,
      orderType: 'Delivery'
    });
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div 
          id="cart-drawer-panel"
          className="w-screen max-w-md bg-[#121215] border-l border-zinc-800 shadow-2xl flex flex-col"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-['Teko'] text-2xl font-bold tracking-wider text-white uppercase leading-none">
                  YOUR BASKET
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>

            <button
              id="btn-close-cart-drawer"
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-zinc-800/60">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-300">Your basket is empty</h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                    Explore our wood-fired pizzas, smash burgers, and loaded fries to get started.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-['Teko'] text-lg font-bold tracking-wider uppercase bg-amber-500 text-black hover:bg-amber-400 transition-colors"
                >
                  BROWSE MENU
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-zinc-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.selectedSize && (
                      <p className="text-[11px] font-semibold text-amber-500 uppercase">
                        Size: {item.selectedSize}
                      </p>
                    )}

                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <p className="text-[11px] text-zinc-400 truncate">
                        +{item.selectedAddons.map(a => a.name).join(', ')}
                      </p>
                    )}

                    {item.notes && (
                      <p className="text-[11px] italic text-zinc-500 truncate">
                        Note: {item.notes}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity Controller */}
                      <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            updateQuantity(item.id, -1);
                          }}
                          className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white px-1.5">{item.quantity}</span>
                        <button
                          onClick={() => {
                            soundFx.playAddToCart();
                            updateQuantity(item.id, 1);
                          }}
                          className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-extrabold text-white">
                        PKR {(item.itemPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {items.length > 0 && (
            <div className="p-5 bg-zinc-950 border-t border-zinc-800 space-y-3.5">
              
              {/* Pricing breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white font-semibold">PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Standard Delivery (Multan)</span>
                  <span className="text-white font-semibold">PKR {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-amber-400 font-extrabold text-base">
                    PKR {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Minimum order check */}
              {!isMinimumMet && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] text-center font-medium">
                  Minimum delivery order in Multan is PKR {settings.minimumOrder}. Please add PKR {(settings.minimumOrder - subtotal).toLocaleString()} more.
                </div>
              )}

              {/* Checkout Action Button */}
              <button
                id="btn-proceed-checkout"
                disabled={!isMinimumMet}
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className="w-full py-3.5 rounded-xl font-['Teko'] text-xl font-bold tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* WhatsApp Quick Order Option */}
              <button
                id="btn-whatsapp-cart-order"
                onClick={handleWhatsAppDirectOrder}
                className="w-full py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-400 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>ORDER ON WHATSAPP DIRECTLY</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
