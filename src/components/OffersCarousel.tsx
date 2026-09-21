import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HomepageOffer } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Tag, 
  ArrowRight, 
  Check, 
  Copy,
  Sparkles,
  VolumeX
} from 'lucide-react';

interface OffersCarouselProps {
  offers: HomepageOffer[];
  onNavigate: (view: 'menu' | 'deals' | 'about' | 'contact' | 'checkout' | 'tracking') => void;
}

export const OffersCarousel: React.FC<OffersCarouselProps> = ({ offers, onNavigate }) => {
  // Only consider active offers, sorted by displayOrder
  const activeOffers = offers
    .filter(o => o.active)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<Record<string, boolean>>({});
  const [isPaused, setIsPaused] = useState(false);

  // Swipe / Drag tracking
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const dragStartX = useRef<number>(0);

  // Video element references
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalOffers = activeOffers.length;

  // Clear & restart the 3-second automatic slide interval cleanly
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (totalOffers > 1 && !isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalOffers);
      }, 3000);
    }
  }, [totalOffers, isPaused]);

  // Handle slide transitions and video play/pause
  useEffect(() => {
    if (totalOffers === 0) return;

    // Manage video playback for current vs inactive slides
    activeOffers.forEach((offer, idx) => {
      const vid = videoRefs.current.get(offer.id);
      if (vid) {
        if (idx === currentIndex && offer.mediaType === 'video' && !videoError[offer.id]) {
          vid.currentTime = 0;
          const playPromise = vid.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.warn('Autoplay prevented or video issue:', err);
              // Fallback will take over if needed
            });
          }
        } else {
          vid.pause();
        }
      }
    });

    resetTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentIndex, totalOffers, resetTimer, activeOffers, videoError]);

  if (totalOffers === 0) {
    return null;
  }

  const currentOffer = activeOffers[currentIndex] || activeOffers[0];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalOffers);
    resetTimer();
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalOffers) % totalOffers);
    resetTimer();
  };

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
    resetTimer();
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (diff > minSwipeDistance) {
      // Swiped Left -> Next
      goToNext();
    } else if (diff < -minSwipeDistance) {
      // Swiped Right -> Prev
      goToPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Desktop Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const diff = dragStartX.current - e.clientX;
    const minDragDistance = 50;

    if (diff > minDragDistance) {
      goToNext();
    } else if (diff < -minDragDistance) {
      goToPrev();
    }
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const handleCtaClick = (offer: HomepageOffer) => {
    const link = (offer.ctaLink || 'menu').toLowerCase();
    if (link.includes('deal')) {
      onNavigate('deals');
    } else if (link.includes('about')) {
      onNavigate('about');
    } else if (link.includes('contact')) {
      onNavigate('contact');
    } else if (link.includes('checkout')) {
      onNavigate('checkout');
    } else {
      onNavigate('menu');
    }
  };

  return (
    <section 
      id="homepage-offers-carousel" 
      aria-label="Hot Offers Carousel"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 min-w-0 box-border overflow-hidden"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400 shrink-0" />
          </div>
          <div>
            <h2 className="font-['Teko'] text-2xl sm:text-3xl font-bold tracking-wider text-white uppercase leading-none">
              TODAY'S EXCLUSIVE OFFERS
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400 font-medium tracking-wide">
              Hand-tossed crusts, sizzling wings & limited-time Multan specials
            </p>
          </div>
        </div>

        {/* Desktop Quick Nav Arrows */}
        {totalOffers > 1 && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              id="btn-offer-prev-top"
              onClick={goToPrev}
              aria-label="Previous Offer"
              className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-500/50 hover:bg-zinc-800 transition-all active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="btn-offer-next-top"
              onClick={goToNext}
              aria-label="Next Offer"
              className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-500/50 hover:bg-zinc-800 transition-all active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Responsive Media Carousel Container */}
      <div
        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-800/90 bg-[#0d0d10] shadow-2xl select-none group cursor-grab active:cursor-grabbing min-w-0"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsPaused(true)}
        onMouseOver={() => setIsPaused(true)}
        onMouseOut={() => setIsPaused(false)}
      >
        {/* Slides Track */}
        <div 
          className="relative w-full h-[360px] sm:h-[420px] md:h-[460px] lg:h-[490px] min-w-0"
        >
          {activeOffers.map((offer, idx) => {
            const isActive = idx === currentIndex;
            const isVideo = offer.mediaType === 'video' && !videoError[offer.id];

            return (
              <div
                key={offer.id || idx}
                aria-hidden={!isActive}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* 1. Background Media (Video or Image) */}
                <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
                  {isVideo ? (
                    <video
                      ref={(el) => {
                        if (el) videoRefs.current.set(offer.id, el);
                        else videoRefs.current.delete(offer.id);
                      }}
                      src={offer.mediaUrl}
                      poster={offer.fallbackImageUrl || offer.mediaUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      onError={() => {
                        console.warn('Video failed to load, falling back to image');
                        setVideoError(prev => ({ ...prev, [offer.id]: true }));
                      }}
                      className="w-full h-full object-cover object-center scale-[1.01]"
                    />
                  ) : (
                    <img
                      src={offer.mediaUrl || offer.fallbackImageUrl}
                      alt={offer.title}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      className="w-full h-full object-cover object-center scale-[1.01] transition-transform duration-1000 group-hover:scale-105"
                    />
                  )}

                  {/* Dark Gradient Overlay for optimal typographic contrast & Bonfire vibe */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-black/25" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/80 via-transparent to-black/30" />
                </div>

                {/* Video Indicator Chip */}
                {isVideo && (
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs font-bold text-zinc-300">
                    <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                    <span>MUTED AUTOPLAY</span>
                  </div>
                )}

                {/* 2. Slide Foreground Content */}
                <div className="relative z-20 h-full w-full flex flex-col justify-end p-5 sm:p-8 md:p-12 max-w-3xl min-w-0">
                  <div className="space-y-3 sm:space-y-4">
                    
                    {/* Badge + Promo Code Row */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20">
                        <Sparkles className="w-3.5 h-3.5 fill-black shrink-0" />
                        <span>FEATURED OFFER</span>
                      </div>

                      {offer.promoCode && (
                        <button
                          type="button"
                          onClick={(e) => handleCopyCode(offer.promoCode!, e)}
                          title="Click to copy promo code"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-400 hover:text-white hover:border-amber-400 text-xs font-bold uppercase tracking-wider transition-all"
                        >
                          <Tag className="w-3 h-3 text-amber-400" />
                          <span>CODE: {offer.promoCode}</span>
                          {copiedCode === offer.promoCode ? (
                            <span className="flex items-center gap-0.5 text-emerald-400 font-extrabold text-[10px]">
                              <Check className="w-3 h-3" />
                              <span>COPIED</span>
                            </span>
                          ) : (
                            <Copy className="w-3 h-3 opacity-60 hover:opacity-100" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-['Anton'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white uppercase tracking-wide leading-[0.95] drop-shadow-md break-words">
                      {offer.title}
                    </h3>

                    {/* Small Description */}
                    <p className="text-zinc-200 text-xs sm:text-sm md:text-base font-normal max-w-xl leading-relaxed drop-shadow line-clamp-2 sm:line-clamp-3">
                      {offer.description}
                    </p>

                    {/* CTA Button */}
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        id={`btn-offer-cta-${idx}`}
                        type="button"
                        onClick={() => handleCtaClick(offer)}
                        className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-['Teko'] text-xl sm:text-2xl font-bold tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span>{offer.ctaText || 'ORDER NOW'}</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                      </button>

                      {offer.promoCode && (
                        <span className="hidden sm:inline-block text-[11px] text-zinc-400 font-medium">
                          Use code <strong className="text-amber-400">{offer.promoCode}</strong> at checkout
                        </span>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Floating In-Card Navigation Controls */}
        {totalOffers > 1 && (
          <>
            {/* Left Prev Arrow Button */}
            <button
              id="btn-offer-prev"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              aria-label="Previous Slide"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-amber-500 hover:text-black text-white backdrop-blur-md border border-white/10 shadow-xl transition-all active:scale-90"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Right Next Arrow Button */}
            <button
              id="btn-offer-next"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              aria-label="Next Slide"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-amber-500 hover:text-black text-white backdrop-blur-md border border-white/10 shadow-xl transition-all active:scale-90"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Clickable Progress Dots */}
            <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
              {activeOffers.map((_, i) => (
                <button
                  key={i}
                  id={`btn-offer-dot-${i}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(i);
                  }}
                  aria-label={`Go to offer slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentIndex === i
                      ? 'w-7 sm:w-9 bg-gradient-to-r from-amber-400 to-orange-500 shadow-sm shadow-amber-500/50'
                      : 'w-2 sm:w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
