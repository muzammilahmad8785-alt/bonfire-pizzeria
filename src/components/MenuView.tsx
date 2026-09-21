import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Product, Deal } from '../types';
import { Flame, Star, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { soundFx } from '../utils/sound';

interface MenuViewProps {
  onSelectProduct: (product: Product) => void;
}

export const MenuView: React.FC<MenuViewProps> = ({ onSelectProduct }) => {
  const { categories, products, deals, selectedCategory, setSelectedCategory } = useRestaurant();
  const { addItem } = useCart();
  const [searchFilter, setSearchFilter] = useState('');

  // When 'deals' category is active, show deals, otherwise show products matching category slug
  const activeProducts = products.filter(p => {
    if (!p.active) return false;
    const matchesCategory = selectedCategory === 'all' ? true : p.category === selectedCategory;
    const matchesSearch = searchFilter.trim() 
      ? p.name.toLowerCase().includes(searchFilter.toLowerCase()) || p.description.toLowerCase().includes(searchFilter.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const activeDeals = deals.filter(d => {
    if (!d.active) return false;
    if (!searchFilter.trim()) return true;
    return d.name.toLowerCase().includes(searchFilter.toLowerCase()) || d.description.toLowerCase().includes(searchFilter.toLowerCase());
  });

  const handleAddDealToCart = (deal: Deal) => {
    soundFx.playAddToCart();
    const dealProductEquivalent: Product = {
      id: `deal-${deal.id}`,
      name: deal.name,
      category: 'deals',
      description: deal.description,
      image: deal.image,
      singlePrice: deal.price,
      availableSizes: ['Single'],
      active: true
    };
    addItem(dealProductEquivalent, 'Single', [], 1, `Deal: ${deal.name}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn space-y-8">
      
      {/* Menu Header */}
      <div className="text-center space-y-2">
        <span className="text-amber-500 font-['Teko'] text-2xl font-bold tracking-widest uppercase">
          OUR CRAFTED FLAVORS
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">
          BONFIRE FULL MENU
        </h1>
        <p className="text-sm text-zinc-400 max-w-lg mx-auto">
          Every pizza is hand-stretched, stone-baked with mozzarella, fresh herbs & artisan cuts in Multan.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto pt-3">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search pizza, burger, wings, dips..."
            className="w-full px-5 py-3 bg-[#131316] border border-zinc-800 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
        <button
          onClick={() => {
            soundFx.playClick();
            setSelectedCategory('all');
          }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
          }`}
        >
          ALL ITEMS
        </button>

        {categories.filter(c => c.active).map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedCategory(cat.slug);
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* When Deals Category is selected */}
      {selectedCategory === 'deals' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {activeDeals.map((deal) => (
            <div
              key={deal.id}
              className="rounded-3xl bg-[#121215] border border-zinc-800 hover:border-amber-500/60 overflow-hidden flex flex-col justify-between transition-all group"
            >
              <div className="relative h-56 w-full overflow-hidden bg-zinc-950">
                <img
                  src={deal.image}
                  alt={deal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {deal.discountBadge && (
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-500 text-black font-['Teko'] text-lg font-bold tracking-wider uppercase">
                    {deal.discountBadge}
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {deal.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {deal.description}
                  </p>

                  {deal.includedItems && deal.includedItems.length > 0 && (
                    <div className="mt-4 space-y-1 text-xs text-zinc-300">
                      <span className="font-bold text-zinc-400 block text-[11px]">Includes:</span>
                      {deal.includedItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-2xl font-['Teko'] font-bold text-amber-400">
                    PKR {deal.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleAddDealToCart(deal)}
                    className="px-5 py-2.5 rounded-xl font-['Teko'] text-xl font-bold tracking-wider uppercase bg-amber-500 text-black hover:bg-amber-400 active:scale-95 transition-all"
                  >
                    ADD DEAL
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Regular Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {activeProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-zinc-500">
              No products found for this category or search term.
            </div>
          ) : (
            activeProducts.map((product) => {
              const basePrice = product.smallPrice || product.singlePrice || 0;
              return (
                <div
                  key={product.id}
                  className="group rounded-3xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 overflow-hidden flex flex-col justify-between transition-all"
                >
                  <div 
                    className="relative h-56 w-full bg-zinc-950 overflow-hidden cursor-pointer"
                    onClick={() => onSelectProduct(product)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent"></div>

                    {product.bestseller && (
                      <div className="absolute top-4 left-4 px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-black" />
                        <span>Bestseller</span>
                      </div>
                    )}

                    {product.rating && (
                      <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-black/70 border border-zinc-700 text-amber-400 text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{product.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-[10px] uppercase font-black tracking-widest text-amber-500 mb-1">
                        {product.category}
                      </div>
                      <h3 
                        onClick={() => onSelectProduct(product)}
                        className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {product.availableSizes && product.availableSizes.length > 1 && (
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500">
                          <span>Sizes:</span>
                          <span className="text-zinc-300 font-semibold">{product.availableSizes.join(' • ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block">From</span>
                        <span className="text-xl font-extrabold text-white">
                          PKR {basePrice.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => onSelectProduct(product)}
                        className="px-5 py-2.5 rounded-xl font-['Teko'] text-xl font-bold uppercase tracking-wider bg-amber-500 text-black hover:bg-amber-400 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>CUSTOMIZE</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
