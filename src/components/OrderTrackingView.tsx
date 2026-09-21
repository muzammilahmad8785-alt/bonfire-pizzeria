import React, { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  limit 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  Bike, 
  CheckCheck, 
  XCircle, 
  Search, 
  Phone, 
  MapPin, 
  Calendar,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { openWhatsAppChat } from '../utils/whatsapp';

interface OrderTrackingViewProps {
  initialOrderId?: string;
  onBackToMenu: () => void;
}

const STATUS_STEPS: Array<{ key: OrderStatus; label: string; desc: string; icon: any }> = [
  { key: 'NEW', label: 'ORDER RECEIVED', desc: 'Your order has been logged in Multan branch kitchen.', icon: Clock },
  { key: 'CONFIRMED', label: 'CONFIRMED', desc: 'Kitchen accepted order & ingredients prepped.', icon: CheckCircle2 },
  { key: 'PREPARING', label: 'PREPARING', desc: 'Hand-stretching dough, baking at 400°C.', icon: ChefHat },
  { key: 'OUT_FOR_DELIVERY', label: 'OUT FOR DELIVERY', desc: 'Rider is en route to your Multan address.', icon: Bike },
  { key: 'DELIVERED', label: 'DELIVERED', desc: 'Delivered piping hot. Enjoy your meal!', icon: CheckCheck },
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ 
  initialOrderId, 
  onBackToMenu 
}) => {
  const [searchId, setSearchId] = useState(initialOrderId || '');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(!!initialOrderId);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (!initialOrderId) return;
    trackOrder(initialOrderId);
  }, [initialOrderId]);

  const trackOrder = (orderIdToTrack: string) => {
    const cleanId = orderIdToTrack.trim().toUpperCase();
    if (!cleanId) return;

    setLoading(true);
    setNotFound(false);

    // Query Firestore for matching orderId
    const q = query(
      collection(db, 'orders'),
      where('orderId', '==', cleanId),
      limit(1)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const docData = snap.docs[0].data() as Order;
        setCurrentOrder({ ...docData, id: snap.docs[0].id });
        setNotFound(false);
      } else {
        setCurrentOrder(null);
        setNotFound(true);
      }
      setLoading(false);
    }, (err) => {
      console.error('Tracking listener error', err);
      setLoading(false);
    });

    return () => unsub();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackOrder(searchId);
  };

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'READY') return 2; // Treat Ready as prepared
    const index = STATUS_STEPS.findIndex(s => s.key === status);
    return index >= 0 ? index : 0;
  };

  const activeIndex = currentOrder ? getStepIndex(currentOrder.status) : 0;
  const isCancelled = currentOrder?.status === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fadeIn">
      
      {/* Search Header */}
      <div className="text-center space-y-2 mb-10">
        <span className="text-amber-500 font-['Teko'] text-2xl font-bold tracking-wider uppercase">
          LIVE STATUS UPDATE
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          TRACK YOUR MULTAN ORDER
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Enter your unique Bonfire order reference code (e.g. BNF-12345) to see real-time updates directly from our Multan kitchen.
        </p>

        {/* Order ID Input Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.toUpperCase())}
              placeholder="e.g. BNF-74829"
              className="w-full pl-10 pr-4 py-3 bg-[#141417] border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-amber-500 text-black font-['Teko'] text-xl font-bold tracking-wider uppercase hover:bg-amber-400 transition-colors"
          >
            TRACK
          </button>
        </form>
      </div>

      {loading && (
        <div className="p-12 text-center text-zinc-400 animate-pulse">
          Fetching live kitchen status...
        </div>
      )}

      {notFound && !loading && (
        <div className="p-8 rounded-3xl bg-[#141417] border border-zinc-800 text-center max-w-md mx-auto space-y-3">
          <XCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Order Reference Not Found</h3>
          <p className="text-xs text-zinc-400">
            Please check the Order ID or message our Multan WhatsApp support team at 0306-7451542.
          </p>
          <button
            onClick={() => openWhatsAppChat(`Hi, I need help checking my order reference ${searchId}`)}
            className="inline-flex items-center gap-2 text-xs text-emerald-400 font-bold hover:underline"
          >
            <MessageSquare className="w-4 h-4" />
            Contact WhatsApp Hotline
          </button>
        </div>
      )}

      {currentOrder && !loading && (
        <div className="space-y-8">
          
          {/* Status Banner Card */}
          <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">ORDER NUMBER</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
                    {currentOrder.orderId}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  Status: <span className="text-amber-400">{currentOrder.status.replace(/_/g, ' ')}</span>
                </h2>
              </div>

              <div className="text-right">
                <span className="text-xs text-zinc-400 block">Total Due (COD)</span>
                <span className="text-2xl font-['Teko'] font-bold text-white">
                  PKR {currentOrder.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Stepper Visualization */}
            {isCancelled ? (
              <div className="my-8 p-4 rounded-2xl bg-red-950/40 border border-red-800 text-red-300 text-center font-bold">
                This order has been CANCELLED by the restaurant or customer.
              </div>
            ) : (
              <div className="py-8">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-zinc-800 -translate-y-1/2 -z-0">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                      style={{ width: `${(activeIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                    {STATUS_STEPS.map((step, idx) => {
                      const isComplete = idx <= activeIndex;
                      const isCurrent = idx === activeIndex;
                      const Icon = step.icon;

                      return (
                        <div key={step.key} className="flex sm:flex-col items-center sm:text-center gap-3">
                          <div 
                            className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/30 scale-110 ring-4 ring-amber-500/20'
                                : isComplete
                                ? 'bg-zinc-800 border-zinc-700 text-amber-400'
                                : 'bg-[#18181b] border-zinc-800 text-zinc-600'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          <div>
                            <p className={`text-xs font-extrabold uppercase tracking-wider ${
                              isCurrent ? 'text-amber-400' : isComplete ? 'text-white' : 'text-zinc-500'
                            }`}>
                              {step.label}
                            </p>
                            <p className="text-[11px] text-zinc-400 hidden sm:block mt-1 leading-tight">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Customer Information & Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-zinc-800 text-xs text-zinc-300">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-400">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-white">Delivery Destination:</span>
                </div>
                <p className="pl-6 text-zinc-300 leading-relaxed">
                  {currentOrder.deliveryAddress}, {currentOrder.area}
                </p>
                <div className="flex items-center gap-2 pl-6 text-zinc-400">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Contact: {currentOrder.phone} ({currentOrder.customerName})</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-white block">Order Items:</span>
                <div className="space-y-1 pl-1">
                  {currentOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-zinc-400">
                      <span>{item.quantity}x {item.name} {item.selectedSize && `(${item.selectedSize})`}</span>
                      <span className="text-zinc-200">PKR {(item.itemPrice * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => openWhatsAppChat(`Hi, I'm checking up on my order ${currentOrder.orderId}`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-400 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>INQUIRE ON WHATSAPP (0306-7451542)</span>
              </button>

              <button
                onClick={onBackToMenu}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-amber-400 transition-colors"
              >
                <span>ORDER MORE ITEMS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
