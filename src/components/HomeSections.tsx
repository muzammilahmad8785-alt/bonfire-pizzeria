import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { useCart } from '../context/CartContext';
import { Product, Deal } from '../types';
import { 
  Flame, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  Truck, 
  Star, 
  Plus, 
  Tag, 
  Award,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { openWhatsAppChat } from '../utils/whatsapp';
import { OffersCarousel } from './OffersCarousel';

interface HomeSectionsProps {
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: 'menu' | 'deals' | 'about' | 'contact' | 'checkout' | 'tracking') => void;
}

export const HomeSections: React.FC<HomeSectionsProps> = ({ 
  onSelectProduct, 
  onNavigate 
}) => {
  const { settings, categories, products, deals, banners, homepageOffers, selectedCategory, setSelectedCategory } = useRestaurant();
  const { addItem } = useCart();

  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Filter bestsellers
  const bestsellers = products.filter(p => p.bestseller && p.active);
  const featuredDeals = deals.filter(d => d.active);

  // Quick add deal to cart as a bundled item
  const handleAddDealToCart = (deal: Deal) => {
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
    <div className="w-full max-w-full min-w-0 space-y-16 sm:space-y-20 pb-20 animate-fadeIn">
      
      {/* 1. HERO SECTION */}
      <section id="hero-section" className="relative min-h-[540px] sm:min-h-[580px] lg:min-h-[640px] flex items-center bg-[#0a0a0c] overflow-hidden border-b border-zinc-900 w-full max-w-full">
        {/* Subtle radial ambient background glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-amber-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-0 sm:right-10 w-64 sm:w-[400px] h-64 sm:h-[400px] bg-orange-600/10 rounded-full blur-[100px] sm:blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 w-full relative z-10 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center min-w-0">
            
            {/* Left Column: Bold Typography & CTAs */}
            <div className="lg:col-span-6 space-y-6 text-left min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest max-w-full">
                <Flame className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
                <span className="truncate">Multan's Most Craved Fast Food</span>
              </div>

              <div className="min-w-0">
                <h1 className="font-['Anton'] text-4xl sm:text-6xl lg:text-7xl text-white tracking-wide uppercase leading-[0.95] break-words">
                  {settings.hero?.headline ? (
                    <span>{settings.hero.headline}</span>
                  ) : (
                    <>
                      REAL PIZZA. <br />
                      <span className="text-amber-500">REAL TASTE.</span>
                    </>
                  )}
                </h1>
                <p className="text-zinc-300 text-sm sm:text-lg mt-4 max-w-lg leading-relaxed font-normal">
                  {settings.hero?.subheadline || 'Freshly made stone-baked pizzas, double-smashed smash burgers, hot wings, and cheesy loaded favorites in Multan.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                <button
                  id="btn-hero-order"
                  onClick={() => onNavigate((settings.hero?.primaryBtnLink as any) || 'menu')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-['Teko'] text-xl sm:text-2xl font-bold tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-xl shadow-orange-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>{settings.hero?.primaryBtnText || 'ORDER ONLINE'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  id="btn-hero-view-menu"
                  onClick={() => onNavigate((settings.hero?.secondaryBtnLink as any) || 'menu')}
                  className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl font-['Teko'] text-xl sm:text-2xl font-bold tracking-wider uppercase bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800 transition-colors flex items-center justify-center"
                >
                  {settings.hero?.secondaryBtnText || 'VIEW FULL MENU'}
                </button>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-6 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs font-semibold text-zinc-300">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-zinc-900 text-amber-400 border border-zinc-800 shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="truncate">Fast Multan Delivery</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-zinc-900 text-amber-400 border border-zinc-800 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="truncate">Fresh Ingredients</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-zinc-900 text-amber-400 border border-zinc-800 shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <span className="truncate">Daily Hot Deals</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-zinc-900 text-amber-400 border border-zinc-800 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="truncate">Open Till 4:00 AM</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-End Hero Food Image with Floating Badges */}
            <div className="lg:col-span-6 relative flex justify-center w-full max-w-full min-w-0 px-2 sm:px-0">
              <div className="relative w-full max-w-lg aspect-square">
                
                {/* Visual Backdrop circular glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-orange-500/10 rounded-full blur-2xl transform scale-90 pointer-events-none" />
                
                {/* Hero Pizza & Burger Image */}
                <img
                  src={settings.hero?.heroImage || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80"}
                  alt="Bonfire Signature Pizza"
                  className="w-full h-full object-cover rounded-3xl shadow-2xl border border-zinc-800/80 hover:scale-[1.02] transition-transform duration-500 relative z-10"
                />

                {/* Floating Badge 1: 100% Mozzarella Melt */}
                <div className="absolute top-2 left-2 sm:-top-4 sm:-left-4 z-20 bg-[#121215]/95 backdrop-blur-md border border-zinc-700 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-2.5 sm:gap-3 max-w-[85%]">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shrink-0">
                    <Award className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs font-extrabold text-white uppercase truncate">100% Real Cheese</p>
                    <p className="text-[9px] sm:text-[10px] text-zinc-400 truncate">Pure dairy mozzarella melt</p>
                  </div>
                </div>

                {/* Floating Badge 2: Multan Hot delivery */}
                <div className="absolute bottom-2 right-2 sm:-bottom-4 sm:-right-4 z-20 bg-[#121215]/95 backdrop-blur-md border border-zinc-700 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-2.5 sm:gap-3 max-w-[85%]">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-black flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4 sm:w-6 sm:h-6 fill-black" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs font-extrabold text-white uppercase truncate">Bosan Road Hub</p>
                    <p className="text-[9px] sm:text-[10px] text-zinc-400 truncate">Baking hot in 35-45 mins</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOMEPAGE OFFER MEDIA CAROUSEL */}
      {homepageOffers && homepageOffers.length > 0 && (
        <OffersCarousel offers={homepageOffers} onNavigate={onNavigate} />
      )}

      {/* 3. CATEGORY NAVIGATION (Visual Attractive Cards) */}
      <section id="categories-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-amber-500 font-['Teko'] text-2xl font-bold tracking-widest uppercase">
            EXPLORE OUR CRUSTS & COMBOS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            BROWSE BY CATEGORY
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.filter(c => c.active).map((category) => (
            <div
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.slug);
                onNavigate('menu');
              }}
              className="group cursor-pointer p-4 rounded-2xl bg-[#121215] border border-zinc-800/80 hover:border-amber-500/80 hover:bg-zinc-900 transition-all text-center flex flex-col items-center justify-between space-y-3"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:brightness-110"
                />
              </div>

              <div>
                <h3 className="font-['Teko'] text-2xl font-bold tracking-wider text-white uppercase group-hover:text-amber-400 transition-colors leading-none">
                  {category.name}
                </h3>
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center justify-center gap-0.5 mt-1">
                  <span>View Items</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BESTSELLERS SECTION (Dynamic from Firestore) */}
      <section id="bestsellers-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8 border-b border-zinc-800 pb-4">
          <div>
            <span className="text-amber-500 font-['Teko'] text-2xl font-bold tracking-wider uppercase">
              POPULAR PICKS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              OUR BESTSELLERS
            </h2>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300"
          >
            <span>VIEW FULL MENU</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product) => {
            const minPrice = product.smallPrice || product.singlePrice || 0;
            return (
              <div
                key={product.id}
                className="group rounded-2xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 overflow-hidden flex flex-col justify-between transition-all"
              >
                {/* Food Image */}
                <div 
                  className="relative h-48 w-full bg-zinc-950 overflow-hidden cursor-pointer"
                  onClick={() => onSelectProduct(product)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent"></div>

                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-black" />
                    <span>Bestseller</span>
                  </div>

                  {product.rating && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm border border-zinc-700 text-amber-400 text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 
                      onClick={() => onSelectProduct(product)}
                      className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors cursor-pointer line-clamp-1"
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Starting at</span>
                      <span className="text-lg font-extrabold text-white">
                        PKR {minPrice.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectProduct(product)}
                      className="p-2.5 rounded-xl bg-amber-500 text-black hover:bg-amber-400 font-bold transition-all active:scale-95 shadow-md shadow-amber-500/10 flex items-center justify-center"
                      title="Add to cart"
                    >
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. DEALS & COMBOS SECTION (Dynamic from Firestore) */}
      <section id="deals-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-amber-500 font-['Teko'] text-2xl font-bold tracking-wider uppercase">
            SUPER SAVER OFFERS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            EXCLUSIVE BONFIRE DEALS
          </h2>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto">
            Packed with multi-slice pizzas, crunchy chicken, sides and chilled drinks at unbeatable Multan prices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredDeals.map((deal) => (
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent"></div>

                {deal.discountBadge && (
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-500 text-black font-['Teko'] text-lg font-bold tracking-wider uppercase shadow-md">
                    {deal.discountBadge}
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {deal.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    {deal.description}
                  </p>

                  {/* Included items chips */}
                  {deal.includedItems && deal.includedItems.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">Includes:</span>
                      <ul className="space-y-1 text-xs text-zinc-300">
                        {deal.includedItems.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <div>
                    {deal.originalPrice && (
                      <span className="text-xs text-zinc-500 line-through block">
                        PKR {deal.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-2xl font-['Teko'] font-bold text-amber-400 tracking-wider">
                      PKR {deal.price.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddDealToCart(deal)}
                    className="px-5 py-2.5 rounded-xl font-['Teko'] text-xl font-bold tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:brightness-110 active:scale-95 transition-all"
                  >
                    ADD DEAL
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. WHATSAPP INSTANT ORDER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full min-w-0">
        <div className="p-6 sm:p-10 rounded-3xl bg-zinc-950 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-6 min-w-0">
          <div className="space-y-2 min-w-0">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <MessageSquare className="w-4 h-4 shrink-0" />
              DIRECT WHATSAPP DESK
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white uppercase break-words">
              PREFER ORDERING VIA WHATSAPP?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg">
              Send your location and food selection directly to our Multan WhatsApp number <span className="text-emerald-400 font-bold">0306-7451542</span> for instant kitchen dispatch.
            </p>
          </div>

          <button
            onClick={() => openWhatsAppChat()}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-['Teko'] text-xl sm:text-2xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10 text-center"
          >
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <span className="truncate">CHAT & ORDER: 0306-7451542</span>
          </button>
        </div>
      </section>

    </div>
  );
};
