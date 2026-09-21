import React, { useState } from 'react';
import { Product, ProductAddon } from '../types';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Flame, Star, Check } from 'lucide-react';
import { soundFx } from '../utils/sound';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addItem } = useCart();

  if (!product) return null;

  // Default size selection
  const [selectedSize, setSelectedSize] = useState<'Small' | 'Medium' | 'Large' | 'Single'>(() => {
    return product.availableSizes[0] || 'Single';
  });

  // Selected add-ons
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [instructions, setInstructions] = useState<string>('');
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Calculate current unit price
  const getBasePrice = () => {
    if (selectedSize === 'Small') return product.smallPrice || product.singlePrice || 0;
    if (selectedSize === 'Medium') return product.mediumPrice || product.singlePrice || 0;
    if (selectedSize === 'Large') return product.largePrice || product.singlePrice || 0;
    return product.singlePrice || product.smallPrice || 0;
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + (a.price || 0), 0);
  const unitPrice = getBasePrice() + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddon = (addon: ProductAddon) => {
    soundFx.playClick();
    if (selectedAddons.some(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleAddToCart = () => {
    soundFx.playAddToCart();
    addItem(product, selectedSize, selectedAddons, quantity, instructions);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 450);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto overscroll-y-contain p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn flex items-center justify-center touch-scroll"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundFx.playClick();
          onClose();
        }
      }}
    >
      <div 
        id="product-detail-modal"
        className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[88vh] my-auto bg-[#121215] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scaleUp text-left"
      >
        {/* Close button */}
        <button
          id="btn-close-product-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-zinc-300 hover:text-white hover:bg-black/90 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto overscroll-y-contain flex-1 touch-scroll">
          
          {/* Header Food Image */}
          <div className="relative h-64 sm:h-72 w-full bg-zinc-950 overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-black/40"></div>
            
            {product.bestseller && (
              <div className="absolute bottom-4 left-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-black uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 fill-black" />
                <span>Multan Bestseller</span>
              </div>
            )}
            
            {product.rating && (
              <div className="absolute top-4 left-6 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-amber-400 text-xs font-bold border border-zinc-700">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Title & Description */}
            <div>
              <div className="text-xs uppercase font-extrabold tracking-widest text-amber-500 mb-1">
                {product.category}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {product.name}
              </h2>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size Selector */}
            {product.availableSizes && product.availableSizes.length > 1 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
                  Select Size <span className="text-amber-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {product.availableSizes.map((size) => {
                    let price = 0;
                    if (size === 'Small') price = product.smallPrice || 0;
                    if (size === 'Medium') price = product.mediumPrice || 0;
                    if (size === 'Large') price = product.largePrice || 0;
                    if (size === 'Single') price = product.singlePrice || 0;

                    const isSelected = selectedSize === size;

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected 
                            ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10' 
                            : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-sm font-bold ${isSelected ? 'text-amber-400' : 'text-zinc-200'}`}>
                            {size}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <span className="text-xs font-semibold text-zinc-400 mt-2">
                          PKR {price.toLocaleString()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Addons / Toppings */}
            {product.addons && product.addons.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
                  Custom Add-ons & Extra Dips
                </label>
                <div className="space-y-2.5">
                  {product.addons.map((addon) => {
                    const isChecked = selectedAddons.some(a => a.id === addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked 
                            ? 'border-amber-500/80 bg-amber-500/10' 
                            : 'border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-amber-500 border-amber-500 text-black' : 'border-zinc-700 bg-zinc-800'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-sm font-medium text-zinc-200">{addon.name}</span>
                        </div>
                        <span className="text-xs font-bold text-amber-400">+ PKR {addon.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Cooking Notes / Requests (Optional)
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Extra crispy, less spicy, no oregano"
                className="w-full px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>

          </div>
        </div>

        {/* Modal Bottom Sticky Bar: Quantity & Add to Cart */}
        <div className="p-4 sm:p-6 bg-[#0c0c0e] border-t border-zinc-800 flex items-center justify-between gap-4">
          
          {/* Quantity Controls */}
          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-black text-white">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            id="btn-confirm-add-to-cart"
            onClick={handleAddToCart}
            className={`flex-1 py-3.5 px-6 rounded-2xl font-['Teko'] text-2xl font-bold tracking-wide uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-between ${
              addedAnimation ? 'scale-95 brightness-125' : ''
            }`}
          >
            <span>{addedAnimation ? 'ADDED TO BASKET!' : 'ADD TO CART'}</span>
            <span className="text-xl">PKR {totalPrice.toLocaleString()}</span>
          </button>

        </div>
      </div>
    </div>
  );
};
