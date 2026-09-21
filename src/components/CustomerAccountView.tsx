import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { 
  User, 
  MapPin, 
  Phone, 
  Clock, 
  Package, 
  Plus, 
  Trash2, 
  Check, 
  LogOut,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';

interface CustomerAccountViewProps {
  onTrackOrder: (orderId: string) => void;
  onBrowseMenu: () => void;
  onOpenAuth: () => void;
}

export const CustomerAccountView: React.FC<CustomerAccountViewProps> = ({
  onTrackOrder,
  onBrowseMenu,
  onOpenAuth
}) => {
  const { user, profile, logout, updateCustomerProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Address book states
  const [newLabel, setNewLabel] = useState('Home');
  const [newAddress, setNewAddress] = useState('');
  const [newArea, setNewArea] = useState('Gulgasht Colony');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('customerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      setOrders(list);
      setLoadingOrders(false);
    }, (err) => {
      console.warn('Orders listener error:', err);
      setLoadingOrders(false);
    });

    return () => unsub();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-amber-500">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Sign In to Your Account</h2>
        <p className="text-xs text-zinc-400">
          Please log in to view your live orders, delivery history, and saved addresses in Multan.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 rounded-xl bg-amber-500 text-black font-['Teko'] text-xl font-bold uppercase tracking-wider hover:bg-amber-400 transition-colors"
        >
          LOG IN OR REGISTER
        </button>
      </div>
    );
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    setIsSaving(true);

    try {
      const currentAddresses = profile?.addresses || [];
      const updated = [
        ...currentAddresses,
        {
          id: String(Date.now()),
          label: newLabel,
          address: newAddress.trim(),
          area: newArea,
          isDefault: currentAddresses.length === 0
        }
      ];

      await updateCustomerProfile({ addresses: updated });
      setNewAddress('');
      setShowAddressForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    const current = profile?.addresses || [];
    const filtered = current.filter(a => a.id !== addrId);
    await updateCustomerProfile({ addresses: filtered });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn space-y-10">
      
      {/* Account Profile Header */}
      <div className="bg-[#121215] border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 p-0.5 shadow-lg shadow-orange-500/20">
            <div className="w-full h-full bg-[#18181b] rounded-[14px] flex items-center justify-center font-['Teko'] text-3xl font-bold text-amber-400">
              {(profile?.name || user.displayName || 'B')[0].toUpperCase()}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {profile?.name || user.displayName || 'Customer'}
              </h1>
              {profile?.role === 'admin' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500 text-black">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{user.email}</p>
            {profile?.phone && (
              <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" />
                {profile.phone}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Orders History & Active Orders */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Teko'] text-2xl font-bold tracking-wider text-white uppercase">
                YOUR ORDERS & STATUS
              </h2>
              <p className="text-xs text-zinc-400">Track current kitchen progress and view past receipts.</p>
            </div>
          </div>

          {loadingOrders ? (
            <div className="p-8 text-center text-zinc-500 animate-pulse">Loading order history...</div>
          ) : orders.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#121215] border border-zinc-800 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto" />
              <h4 className="text-sm font-bold text-zinc-300">No orders placed yet</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Ready to taste the real pizza? Check out our menu and deals for instant Multan delivery.
              </p>
              <button
                onClick={onBrowseMenu}
                className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-['Teko'] text-lg font-bold uppercase tracking-wider hover:bg-amber-400 transition-colors"
              >
                EXPLORE MENU
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id || order.orderId}
                  className="p-5 rounded-2xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {order.orderId}
                      </span>
                      <span className="text-zinc-500 text-xs">•</span>
                      <span className="text-xs text-zinc-400">{order.orderType}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>

                      <button
                        onClick={() => onTrackOrder(order.orderId)}
                        className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300"
                      >
                        <span>TRACK LIVE</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-zinc-300">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{it.quantity}x {it.name} {it.selectedSize && `(${it.selectedSize})`}</span>
                        <span className="text-zinc-400">PKR {(it.itemPrice * it.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                    <span className="text-zinc-500">{order.deliveryAddress}</span>
                    <span className="font-extrabold text-white">Total: PKR {order.total.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Saved Multan Addresses */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-['Teko'] text-2xl font-bold tracking-wider text-white uppercase">
              SAVED ADDRESSES
            </h2>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add New</span>
            </button>
          </div>

          {/* New Address Form */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 animate-fadeIn">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">New Delivery Location</h4>
              
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Label</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Home, Office, Hostel"
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Area</label>
                <input
                  type="text"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  placeholder="e.g. Gulgasht Colony, Bosan Road"
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Address Details</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="House, Street, Landmark"
                  className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 rounded-lg bg-amber-500 text-black font-bold text-xs uppercase hover:bg-amber-400 transition-colors"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* List of Addresses */}
          <div className="space-y-3">
            {(!profile?.addresses || profile.addresses.length === 0) ? (
              <p className="text-xs text-zinc-500 italic p-4 rounded-2xl bg-[#121215] border border-zinc-800/80">
                No saved addresses yet. Save your favorite Multan spot for faster 1-click checkout.
              </p>
            ) : (
              profile.addresses.map((addr) => (
                <div 
                  key={addr.id}
                  className="p-4 rounded-2xl bg-[#121215] border border-zinc-800 flex items-start justify-between gap-2"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{addr.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold">{addr.area}</span>
                    </div>
                    <p className="text-zinc-400">{addr.address}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
