import React from 'react';
import { Flame, ShieldCheck, Heart, MapPin, Award, Clock, Truck, ChefHat } from 'lucide-react';
import { RESTAURANT_WHATSAPP, openWhatsAppChat } from '../utils/whatsapp';

interface AboutContactViewsProps {
  view: 'about' | 'contact';
  onOrderNow: () => void;
}

export const AboutContactViews: React.FC<AboutContactViewsProps> = ({ view, onOrderNow }) => {
  if (view === 'about') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn space-y-12">
        <div className="text-center space-y-3">
          <span className="text-amber-500 font-['Teko'] text-2xl font-bold tracking-wider uppercase">
            ABOUT OUR CRAFT
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">
            THE BONFIRE PIZZERIA STORY
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Born out of passion for genuine stone-baked crusts and deeply satisfying fast-food favorites in Multan, Pakistan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5 text-sm text-zinc-300 leading-relaxed">
            <h3 className="text-2xl font-bold text-white uppercase">
              No Shortcuts. Pure Fire & Real Cheese.
            </h3>
            <p>
              At Bonfire Pizzeria, we believe great pizza is an art. We slow-ferment our hand-kneaded dough for 24 hours to achieve that airy, crisp crown with golden blistered crusts.
            </p>
            <p>
              Whether it is our signature spicy Tikka, Chicago-style Deep Dish packed with molten strings of pure dairy mozzarella, or our butter-toasted smash burgers, every bite is engineered for pure flavor ecstasy.
            </p>
            <div className="pt-2">
              <button
                onClick={onOrderNow}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-['Teko'] text-2xl font-bold uppercase tracking-wider hover:brightness-110 transition-all"
              >
                EXPERIENCE THE FLAVOR
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <img
              src="https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&auto=format&fit=crop&q=80"
              alt="Artisan Pizza Making"
              className="rounded-3xl border border-zinc-800 shadow-2xl object-cover w-full h-80 lg:h-96"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white uppercase">100% Real Mozzarella</h4>
            <p className="text-xs text-zinc-400">Never vegetable-oil based analogs. Only natural whole milk cheeses.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white uppercase">Open Till 4:00 AM</h4>
            <p className="text-xs text-zinc-400">Catering to Multan's night-owls with blazing fast late night delivery.</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <ChefHat className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white uppercase">Fresh Daily Prep</h4>
            <p className="text-xs text-zinc-400">Locally sourced farm fresh veggies, cuts and freshly simmered sauces.</p>
          </div>
        </div>
      </div>
    );
  }

  // Contact view
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn space-y-10">
      <div className="text-center space-y-3">
        <span className="text-amber-500 font-['Teko'] text-2xl font-bold tracking-wider uppercase">
          CONNECT WITH US
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight">
          VISIT OR CONTACT BONFIRE
        </h1>
        <p className="text-sm text-zinc-400 max-w-lg mx-auto">
          Need custom catering, corporate lunch bundles, or direct delivery tracking? We are here for you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Contact Info Card */}
        <div className="p-8 rounded-3xl bg-[#121215] border border-zinc-800 space-y-6">
          <h3 className="font-['Teko'] text-2xl font-bold text-white uppercase">
            MULTAN MAIN BRANCH
          </h3>

          <div className="space-y-4 text-xs text-zinc-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-sm">Location Address</p>
                <p className="text-zinc-400 mt-0.5 leading-relaxed">
                  Main Bosan Road, Opposite Gulgasht Colony, Multan, Punjab, Pakistan
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-sm">Operating Hours</p>
                <p className="text-zinc-400 mt-0.5">Everyday: 10:00 AM – 4:00 AM (Midnight Delivery)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-sm">Multan Delivery Areas</p>
                <p className="text-zinc-400 mt-0.5">
                  Bosan Road, Gulgasht, Cantt, Model Town, Officers Colony, Shah Rukn-e-Alam, Wapda Town & surrounding districts.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex flex-col gap-3">
            <button
              onClick={() => openWhatsAppChat()}
              className="w-full py-3 rounded-xl bg-emerald-500 text-black font-['Teko'] text-xl font-bold uppercase tracking-wider hover:bg-emerald-400 transition-colors"
            >
              CHAT ON WHATSAPP: {RESTAURANT_WHATSAPP}
            </button>
            <a
              href="tel:03067451542"
              className="w-full py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-['Teko'] text-xl font-bold uppercase tracking-wider text-center hover:bg-zinc-800 transition-colors"
            >
              CALL DIRECTLY
            </a>
          </div>
        </div>

        {/* Message Form or Map preview */}
        <div className="p-8 rounded-3xl bg-[#121215] border border-zinc-800 space-y-4">
          <h3 className="font-['Teko'] text-2xl font-bold text-white uppercase">
            SEND US A FEEDBACK NOTE
          </h3>
          <p className="text-xs text-zinc-400">
            Have thoughts about your recent pizza crust or delivery experience? Drop a note directly to our branch management.
          </p>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you! Your feedback has been sent to Bonfire Multan management.');
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1 uppercase">Name</label>
              <input
                type="text"
                required
                placeholder="Your Name"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1 uppercase">Phone / WhatsApp</label>
              <input
                type="tel"
                required
                placeholder="0300-1234567"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 mb-1 uppercase">Message</label>
              <textarea
                required
                placeholder="Tell us what you loved or how we can improve..."
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white h-24"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 text-black font-['Teko'] text-xl font-bold uppercase hover:bg-amber-400 transition-colors"
            >
              SUBMIT NOTE
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
