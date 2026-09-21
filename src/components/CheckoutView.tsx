import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  Store, 
  Banknote, 
  CheckCircle, 
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  User as UserIcon,
  MessageSquare
} from 'lucide-react';
import { generateWhatsAppOrderUrl } from '../utils/whatsapp';
import { soundFx } from '../utils/sound';

interface CheckoutViewProps {
  onBackToMenu: () => void;
  onOrderSuccess: (orderId: string) => void;
}

const MULTAN_AREAS = [
  'Gulgasht Colony',
  'Bosan Road',
  'Multan Cantt',
  'Model Town',
  'Officers Colony',
  'Shah Rukn-e-Alam',
  'Chungi No. 9',
  'Chungi No. 6',
  'Wapda Town',
  'MDA Officers Colony',
  'Shamsabad',
  'Zakariya Town',
  'Vehari Road',
  'Other Area (Multan)'
];

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onBackToMenu, onOrderSuccess }) => {
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { settings } = useRestaurant();

  const [orderType, setOrderType] = useState<'Delivery' | 'Pickup'>('Delivery');
  const [fullName, setFullName] = useState(profile?.name || user?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState(
    profile?.addresses?.[0]?.address || ''
  );
  const [area, setArea] = useState(profile?.addresses?.[0]?.area || MULTAN_AREAS[0]);
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Pay at Pickup'>('Cash on Delivery');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deliveryFee = orderType === 'Delivery' ? settings.deliveryFee : 0;
  const grandTotal = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <h2 className="font-['Teko'] text-4xl text-white">YOUR BASKET IS EMPTY</h2>
        <p className="text-zinc-400 text-sm mt-2">Add delicious items to your cart before checking out.</p>
        <button
          onClick={onBackToMenu}
          className="mt-6 px-8 py-3 rounded-xl bg-amber-500 text-black font-['Teko'] text-xl font-bold uppercase hover:bg-amber-400 transition-colors"
        >
          RETURN TO MENU
        </button>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form Validations
    if (!fullName.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setErrorMessage('Please provide a valid active contact phone number.');
      return;
    }
    if (orderType === 'Delivery' && !deliveryAddress.trim()) {
      setErrorMessage('Please provide your complete delivery street address in Multan.');
      return;
    }
    if (orderType === 'Delivery' && subtotal < settings.minimumOrder) {
      setErrorMessage(`Minimum order for delivery is PKR ${settings.minimumOrder}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate clean unique Order ID e.g. BNF-74829
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const generatedOrderId = `BNF-${randomDigits}`;

      const newOrder: Order = {
        orderId: generatedOrderId,
        customerId: user ? user.uid : 'guest',
        customerName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || 'guest@bonfirepizzeria.com',
        items,
        subtotal,
        deliveryFee,
        total: grandTotal,
        deliveryAddress: orderType === 'Delivery' ? deliveryAddress.trim() : 'Store Pickup (Main Bosan Road)',
        area: orderType === 'Delivery' ? area : 'Multan Pickup Branch',
        orderType,
        paymentMethod: orderType === 'Delivery' ? 'Cash on Delivery' : 'Pay at Pickup',
        notes: orderNotes.trim() || '',
        status: 'NEW',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Save document to Firestore
      const orderRef = doc(collection(db, 'orders'));
      await setDoc(orderRef, newOrder);

      // Clear Cart
      clearCart();

      // Play joyful order placed sound effect
      soundFx.playOrderSuccess();

      // Trigger success callback to show tracking view
      onOrderSuccess(generatedOrderId);
    } catch (err: any) {
      console.error('Order submission failed', err);
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppCheckout = () => {
    const url = generateWhatsAppOrderUrl({
      customerName: fullName,
      phone,
      address: `${deliveryAddress}, ${area}`,
      items,
      total: grandTotal,
      orderType
    });
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Back button */}
      <button
        onClick={onBackToMenu}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-amber-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        BACK TO MENU
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Checkout Customer Details */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <span className="text-amber-500 font-['Teko'] text-2xl font-bold tracking-wider uppercase">
              CHECKOUT & DETAILS
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              COMPLETE YOUR ORDER
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Please enter your Multan contact and delivery details.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="space-y-6">
            
            {/* 1. Order Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Order Fulfillment
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setOrderType('Delivery');
                    setPaymentMethod('Cash on Delivery');
                  }}
                  className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                    orderType === 'Delivery'
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-lg shadow-amber-500/10'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Truck className={`w-6 h-6 ${orderType === 'Delivery' ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <div className="text-left">
                    <p className="text-sm font-bold">Fast Doorstep Delivery</p>
                    <p className="text-xs text-zinc-400">Piping hot in 35-45 mins</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOrderType('Pickup');
                    setPaymentMethod('Pay at Pickup');
                  }}
                  className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                    orderType === 'Pickup'
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-lg shadow-amber-500/10'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Store className={`w-6 h-6 ${orderType === 'Pickup' ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <div className="text-left">
                    <p className="text-sm font-bold">Direct Takeaway Pickup</p>
                    <p className="text-xs text-zinc-400">Ready in 20 mins at Bosan Rd</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Customer Personal Info */}
            <div className="p-6 rounded-2xl bg-[#131316] border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-amber-500" />
                Customer Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Full Name <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Muzammil Ahmad"
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Multan Mobile Number <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0306-1234567"
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Email Address (Optional for tracking notifications)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* 3. Delivery Address (If delivery selected) */}
            {orderType === 'Delivery' && (
              <div className="p-6 rounded-2xl bg-[#131316] border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  Multan Delivery Location
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Area / Neighborhood <span className="text-amber-500">*</span>
                    </label>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      {MULTAN_AREAS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      House / Flat / Plaza No.
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. House 42, Street 5, Block B"
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Special Delivery Instructions
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. Ring bell twice, near Gol Bagh or PSO pump"
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* 4. Payment Method */}
            <div className="p-6 rounded-2xl bg-[#131316] border border-zinc-800 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Banknote className="w-4 h-4 text-amber-500" />
                Payment Method
              </h3>
              
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white">
                      {orderType === 'Delivery' ? 'Cash on Delivery (COD)' : 'Pay Cash/Card at Counter'}
                    </span>
                    <p className="text-xs text-zinc-400">Pay when your order arrives or at pickup</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Default</span>
              </div>
            </div>

            {/* Place Order Buttons */}
            <div className="space-y-3 pt-2">
              <button
                id="btn-place-order"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl font-['Teko'] text-2xl font-bold tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-xl shadow-orange-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="text-sm normal-case font-semibold">Processing your order...</span>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>CONFIRM & PLACE ORDER (PKR {grandTotal.toLocaleString()})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="w-full py-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-400 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>CONFIRM ORDER VIA WHATSAPP (0306-7451542)</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 bg-[#121215] border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <h3 className="font-['Teko'] text-2xl font-bold tracking-wider text-white uppercase border-b border-zinc-800 pb-3">
              ORDER SUMMARY
            </h3>

            {/* Item list */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-zinc-800 shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>{item.name}</span>
                      <span>PKR {(item.itemPrice * item.quantity).toLocaleString()}</span>
                    </div>
                    <div className="text-zinc-400 mt-0.5">
                      Qty: {item.quantity} {item.selectedSize && `• Size: ${item.selectedSize}`}
                    </div>
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="text-[11px] text-amber-500/90 truncate">
                        +{item.selectedAddons.map(a => a.name).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-zinc-800 pt-4 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-white font-semibold">PKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Delivery Fee ({orderType})</span>
                <span className="text-white font-semibold">PKR {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="border-t border-zinc-800 pt-3 flex justify-between text-base font-extrabold text-white">
                <span>Total Due</span>
                <span className="text-amber-400 text-xl font-['Teko'] tracking-wider">
                  PKR {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Delivery Guarantees */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-400 space-y-2">
              <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Estimated Time: 35-45 Minutes</span>
              </div>
              <p>
                Freshly prepared in our stone pizza ovens and delivered piping hot across Multan.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
