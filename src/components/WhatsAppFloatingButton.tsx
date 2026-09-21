import React, { useState } from 'react';
import { MessageSquare, Phone, Send, X } from 'lucide-react';
import { openWhatsAppChat, RESTAURANT_WHATSAPP } from '../utils/whatsapp';
import { soundFx } from '../utils/sound';

export const WhatsAppFloatingButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    soundFx.playClick();
    openWhatsAppChat();
  };

  return (
    <aside 
      aria-label="WhatsApp Quick Support" 
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex items-end flex-col select-none"
    >
      {/* Interactive Quick Chat Bubble preview */}
      {showTooltip && (
        <div 
          role="region"
          aria-label="WhatsApp Quick Order Popup"
          className="mb-3 w-72 max-w-[calc(100vw-2rem)] bg-[#121215] border border-emerald-500/50 rounded-2xl shadow-2xl p-4 text-left animate-fadeIn text-xs space-y-2.5 backdrop-blur-md"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                Multan Order Desk
              </span>
            </div>
            <button 
              onClick={() => setShowTooltip(false)}
              className="text-zinc-500 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-zinc-300 text-[11px] leading-relaxed">
            Need hot stone-baked pizza or deals delivered to Bosan Rd, Gulgasht, or Cantt? Chat with our kitchen manager directly!
          </p>
          <button
            onClick={handleClick}
            className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Open WhatsApp Chat</span>
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Persistent Mini Label on Desktop */}
        <div 
          onClick={() => setShowTooltip(!showTooltip)}
          className="hidden md:flex cursor-pointer items-center gap-2 bg-[#121215]/95 border border-emerald-500/40 text-emerald-300 text-xs py-2 px-3.5 rounded-2xl shadow-2xl font-bold hover:border-emerald-400 transition-all hover:bg-zinc-900"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>WhatsApp Hotline: {RESTAURANT_WHATSAPP}</span>
        </div>

        {/* Circular Action Button */}
        <button
          id="btn-whatsapp-floating"
          onClick={handleClick}
          onMouseEnter={() => setShowTooltip(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 hover:from-emerald-500 hover:to-teal-300 text-black flex items-center justify-center shadow-[0_10px_25px_rgba(16,185,129,0.4)] hover:scale-110 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
          aria-label="Order on WhatsApp"
          title="Direct WhatsApp Support & Order: 0306-7451542"
        >
          <MessageSquare className="w-7 h-7 fill-black stroke-black" />
        </button>
      </div>
    </aside>
  );
};
