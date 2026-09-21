import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { processAndUploadMedia } from '../utils/mediaUpload';
import { Order, OrderStatus, Product, Deal, HomepageBanner, HomepageOffer, RestaurantSettings, HeroConfig, MediaItem } from '../types';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Pizza, 
  Tag, 
  Image, 
  Users, 
  Settings, 
  LogOut, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  ShieldAlert, 
  Eye, 
  CheckCircle2, 
  XCircle,
  Phone,
  MapPin,
  Save,
  MessageSquare,
  Video,
  Play,
  ArrowUp,
  ArrowDown,
  Upload,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Copy,
  CopyPlus,
  HardDrive,
  ExternalLink,
  Flame,
  Search,
  X,
  AlertTriangle
} from 'lucide-react';
import { openWhatsAppChat } from '../utils/whatsapp';
import { soundFx } from '../utils/sound';
import { useToast } from '../context/ToastContext';
import { MediaUploader } from './MediaUploader';

interface AdminDashboardProps {
  onBackToCustomerSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToCustomerSite }) => {
  const { user, profile, isAdmin, logout, signInWithGoogle } = useAuth();
  const { settings } = useRestaurant();
  const toast = useToast();

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'orders' | 'products' | 'categories' | 'deals' | 'homepage' | 'media' | 'customers' | 'settings'
  >('dashboard');

  // Real-time collections
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [offers, setOffers] = useState<HomepageOffer[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [editableSettings, setEditableSettings] = useState<RestaurantSettings>(settings);

  // Hero Section Form State
  const [heroForm, setHeroForm] = useState<HeroConfig>(() => settings.hero || {
    headline: 'REAL PIZZA. REAL TASTE.',
    subheadline: 'Freshly made stone-baked pizzas, double-smashed smash burgers, hot wings, and cheesy loaded favorites in Multan.',
    heroImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900',
    primaryBtnText: 'ORDER ONLINE',
    primaryBtnLink: 'menu',
    secondaryBtnText: 'VIEW FULL MENU',
    secondaryBtnLink: 'menu'
  });

  // Orders Filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');

  // Media Search State
  const [mediaSearch, setMediaSearch] = useState<string>('');
  const [mediaFilterType, setMediaFilterType] = useState<'all' | 'image' | 'video'>('all');

  // Selected Order for Modal/Detail
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Modal forms states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const [showDealModal, setShowDealModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Partial<Deal> | null>(null);

  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<HomepageBanner> | null>(null);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Partial<HomepageOffer> | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Dedicated Delete Confirmation Modal for Products & Deals
  const [deleteModalItem, setDeleteModalItem] = useState<{
    type: 'product' | 'deal';
    id: string;
    name: string;
  } | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Prevent background body scroll when any modal is open without blocking child touch scrolling
  const isAnyModalOpen = Boolean(
    showProductModal ||
    showDealModal ||
    showBannerModal ||
    showOfferModal ||
    selectedOrder ||
    deleteModalItem
  );

  useEffect(() => {
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isAnyModalOpen]);

  // Realtime Listeners for Admin Data - only attach when authenticated as admin
  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    // 1. Orders Realtime
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(
      qOrders, 
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        setOrders(list);
      },
      (err) => {
        console.warn('Orders realtime listener notice:', err);
      }
    );

    // 2. Products Realtime
    const unsubProducts = onSnapshot(
      collection(db, 'products'), 
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        setProducts(list);
      },
      (err) => {
        console.warn('Products realtime listener notice:', err);
      }
    );

    // 3. Deals Realtime
    const unsubDeals = onSnapshot(
      collection(db, 'deals'), 
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Deal));
        setDeals(list);
      },
      (err) => {
        console.warn('Deals realtime listener notice:', err);
      }
    );

    // 4. Banners Realtime
    const unsubBanners = onSnapshot(
      collection(db, 'banners'), 
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as HomepageBanner));
        setBanners(list);
      },
      (err) => {
        console.warn('Banners realtime listener notice:', err);
      }
    );

    // 5. Homepage Offers Realtime (ordered by displayOrder)
    const qOffers = query(collection(db, 'homepageOffers'), orderBy('displayOrder', 'asc'));
    const unsubOffers = onSnapshot(
      qOffers,
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as HomepageOffer));
        setOffers(list);
      },
      (err) => {
        console.warn('Offers realtime listener notice:', err);
      }
    );

    // 6. Media Library Realtime
    const qMedia = query(collection(db, 'media'), orderBy('createdAt', 'desc'));
    const unsubMedia = onSnapshot(
      qMedia,
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as MediaItem));
        setMediaList(list);
      },
      (err) => {
        console.warn('Media realtime listener notice:', err);
      }
    );

    // 7. Customers Realtime
    const unsubUsers = onSnapshot(
      collection(db, 'users'), 
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCustomers(list);
      },
      (err) => {
        console.warn('Customers realtime listener notice:', err);
      }
    );

    // Settings
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'restaurant'), 
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as RestaurantSettings;
          setEditableSettings(data);
          if (data.hero) {
            setHeroForm(data.hero);
          }
        }
      },
      (err) => {
        console.warn('Settings realtime listener notice:', err);
      }
    );

    return () => {
      unsubOrders();
      unsubProducts();
      unsubDeals();
      unsubBanners();
      unsubOffers();
      unsubMedia();
      unsubUsers();
      unsubSettings();
    };
  }, [isAdmin]);

  const flashMessage = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Inline state for direct admin credentials inside Admin Dashboard
  const [adminInputUser, setAdminInputUser] = useState('Muzammil@1234');
  const [adminInputPass, setAdminInputPass] = useState('Malik@1234');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const { loginAsDedicatedAdmin } = useAuth();

  const handleDirectAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);
    setAdminAuthLoading(true);
    soundFx.playClick();
    try {
      const ok = await loginAsDedicatedAdmin(adminInputUser, adminInputPass);
      if (ok) {
        soundFx.playOrderSuccess();
        flashMessage('Welcome Muzammil! Admin portal unlocked.');
      } else {
        setAdminAuthError('Invalid credentials. Check username and password.');
      }
    } catch (err: any) {
      setAdminAuthError(err.message || 'Login failed');
    } finally {
      setAdminAuthLoading(false);
    }
  };

  // If unauthorized, show direct dedicated Admin Login Portal
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#121216] border border-amber-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-500">
              RESTRICTED ACCESS
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">Admin Portal Login</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Sign in with management credentials to view orders, catalog, and Multan store settings.
            </p>
          </div>

          {/* Quick Notice with Credentials requested */}
          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-left text-xs space-y-1">
            <p className="text-zinc-400 text-[11px]">Default Admin Credentials:</p>
            <div className="flex justify-between items-center text-zinc-200">
              <span>Username: <strong className="text-amber-400">Muzammil@1234</strong></span>
              <span>Pass: <strong className="text-amber-400">Malik@1234</strong></span>
            </div>
          </div>

          {adminAuthError && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs">
              {adminAuthError}
            </div>
          )}

          <form onSubmit={handleDirectAdminLogin} className="space-y-3 text-left">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Admin Username / Email</label>
              <input
                type="text"
                required
                value={adminInputUser}
                onChange={(e) => setAdminInputUser(e.target.value)}
                placeholder="Muzammil@1234"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Admin Password</label>
              <input
                type="password"
                required
                value={adminInputPass}
                onChange={(e) => setAdminInputPass(e.target.value)}
                placeholder="Malik@1234"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={adminAuthLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-['Teko'] text-xl font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {adminAuthLoading ? 'Verifying...' : 'LOG IN AS ADMIN'}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">or sign in with google</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                setAdminAuthLoading(true);
                await signInWithGoogle();
                soundFx.playOrderSuccess();
              } catch (err: any) {
                setAdminAuthError(err.message || 'Google login failed');
              } finally {
                setAdminAuthLoading(false);
              }
            }}
            disabled={adminAuthLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google (muzammilahmad8785@gmail.com)
          </button>

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <button
              onClick={onBackToCustomerSite}
              className="text-zinc-400 hover:text-white"
            >
              ← Return to Customer Store
            </button>

            {user && (
              <button
                onClick={logout}
                className="text-zinc-500 hover:text-red-400"
              >
                Log Out Current User
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quick order status update
  const updateOrderStatus = async (order: Order, newStatus: OrderStatus) => {
    try {
      if (!order.id) return;
      await updateDoc(doc(db, 'orders', order.id), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      soundFx.playSaveSuccess();
      toast.success(`Order #${order.orderId} status set to ${newStatus}`);
      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (e: any) {
      console.error(e);
      soundFx.playError();
      toast.error('Failed to update status: ' + e.message);
    }
  };

  // Product Operations
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name) return;
    try {
      const prodId = editingProduct.id || `prod-${Date.now()}`;
      const payload: Product = {
        id: prodId,
        name: editingProduct.name,
        category: editingProduct.category || 'pizza',
        description: editingProduct.description || '',
        image: editingProduct.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700',
        smallPrice: Number(editingProduct.smallPrice) || undefined,
        mediumPrice: Number(editingProduct.mediumPrice) || undefined,
        largePrice: Number(editingProduct.largePrice) || undefined,
        singlePrice: Number(editingProduct.singlePrice) || undefined,
        availableSizes: editingProduct.availableSizes || ['Single'],
        bestseller: !!editingProduct.bestseller,
        featured: !!editingProduct.featured,
        active: editingProduct.active !== undefined ? editingProduct.active : true,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'products', prodId), payload, { merge: true });
      setShowProductModal(false);
      setEditingProduct(null);
      soundFx.playSaveSuccess();
      toast.success(`Product "${payload.name}" saved successfully!`);
    } catch (e: any) {
      console.error(e);
      soundFx.playError();
      toast.error('Failed to save product: ' + e.message);
    }
  };

  const handleDuplicateProduct = async (prod: Product) => {
    soundFx.playClick();
    try {
      const newId = `prod-${Date.now()}`;
      const clone: Product = {
        ...prod,
        id: newId,
        name: `${prod.name} (Copy)`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'products', newId), clone);
      soundFx.playSaveSuccess();
      toast.success(`Duplicated "${prod.name}"`);
    } catch (e: any) {
      soundFx.playError();
      toast.error('Failed to duplicate: ' + e.message);
    }
  };

  const handleToggleProductActive = async (prod: Product) => {
    soundFx.playClick();
    try {
      const newActive = !prod.active;
      await updateDoc(doc(db, 'products', prod.id), {
        active: newActive,
        updatedAt: serverTimestamp()
      });
      toast.info(`Product is now ${newActive ? 'visible' : 'hidden'}`);
    } catch (e: any) {
      soundFx.playError();
      toast.error('Could not update status');
    }
  };

  const handleToggleProductBestseller = async (prod: Product) => {
    soundFx.playClick();
    try {
      const newVal = !prod.bestseller;
      await updateDoc(doc(db, 'products', prod.id), {
        bestseller: newVal,
        updatedAt: serverTimestamp()
      });
      toast.info(`Bestseller badge ${newVal ? 'added' : 'removed'}`);
    } catch (e: any) {
      soundFx.playError();
      toast.error('Could not update bestseller status');
    }
  };

  const handleDeleteProduct = async (id: string, name?: string) => {
    soundFx.playDelete();
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success(`Product "${name || 'item'}" deleted successfully`);
    } catch (e: any) {
      console.error(e);
      soundFx.playError();
      toast.error('Failed to delete product: ' + e.message);
    }
  };

  const confirmAndExecuteDelete = async () => {
    if (!deleteModalItem) return;
    const { type, id, name } = deleteModalItem;
    setDeleteModalItem(null);
    if (type === 'product') {
      await handleDeleteProduct(id, name);
    } else if (type === 'deal') {
      await handleDeleteDeal(id, name);
    }
  };

  // Deal Operations
  const handleSaveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeal?.name) return;
    try {
      const dealId = editingDeal.id || `deal-${Date.now()}`;
      const payload: Deal = {
        id: dealId,
        name: editingDeal.name,
        description: editingDeal.description || '',
        image: editingDeal.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700',
        price: Number(editingDeal.price) || 0,
        originalPrice: Number(editingDeal.originalPrice) || undefined,
        discountBadge: editingDeal.discountBadge || '',
        includedItems: typeof editingDeal.includedItems === 'string' 
          ? (editingDeal.includedItems as string).split(',').map(s => s.trim()) 
          : (editingDeal.includedItems || []),
        active: editingDeal.active !== undefined ? editingDeal.active : true,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'deals', dealId), payload, { merge: true });
      setShowDealModal(false);
      setEditingDeal(null);
      soundFx.playSaveSuccess();
      toast.success(`Deal "${payload.name}" saved successfully!`);
    } catch (e: any) {
      console.error(e);
      soundFx.playError();
      toast.error('Failed to save deal');
    }
  };

  const handleDuplicateDeal = async (deal: Deal) => {
    soundFx.playClick();
    try {
      const newId = `deal-${Date.now()}`;
      const clone: Deal = {
        ...deal,
        id: newId,
        name: `${deal.name} (Copy)`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'deals', newId), clone);
      soundFx.playSaveSuccess();
      toast.success(`Duplicated "${deal.name}"`);
    } catch (e: any) {
      soundFx.playError();
      toast.error('Failed to duplicate deal');
    }
  };

  const handleToggleDealActive = async (deal: Deal) => {
    soundFx.playClick();
    try {
      const newActive = !deal.active;
      await updateDoc(doc(db, 'deals', deal.id), {
        active: newActive,
        updatedAt: serverTimestamp()
      });
      toast.info(`Deal is now ${newActive ? 'active' : 'inactive'}`);
    } catch (e: any) {
      soundFx.playError();
      toast.error('Could not update deal');
    }
  };

  const handleDeleteDeal = async (id: string, name?: string) => {
    soundFx.playDelete();
    try {
      await deleteDoc(doc(db, 'deals', id));
      toast.success(`Deal "${name || 'item'}" deleted successfully`);
    } catch (e: any) {
      console.error(e);
      soundFx.playError();
      toast.error('Failed to delete deal: ' + e.message);
    }
  };

  // Banner Operations
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.title) return;
    try {
      const bannerId = editingBanner.id || `banner-${Date.now()}`;
      const payload: HomepageBanner = {
        id: bannerId,
        title: editingBanner.title,
        subtitle: editingBanner.subtitle || '',
        badge: editingBanner.badge || 'PROMO',
        image: editingBanner.image || 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=1200',
        buttonText: editingBanner.buttonText || 'ORDER NOW',
        buttonLink: editingBanner.buttonLink || '#menu',
        order: Number(editingBanner.order) || 1,
        active: editingBanner.active !== undefined ? editingBanner.active : true,
      };

      await setDoc(doc(db, 'banners', bannerId), payload, { merge: true });
      setShowBannerModal(false);
      setEditingBanner(null);
      soundFx.playSaveSuccess();
      toast.success('Homepage banner saved!');
    } catch (e: any) {
      console.error(e);
      soundFx.playError();
      toast.error('Failed to save banner');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Delete this promotional banner?')) return;
    soundFx.playDelete();
    try {
      await deleteDoc(doc(db, 'banners', id));
      toast.success('Banner deleted');
    } catch (e) {
      console.error(e);
    }
  };

  // ================= Homepage Offers Operations =================
  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer?.title || !editingOffer?.mediaUrl) {
      flashMessage('Please provide title and media URL');
      return;
    }
    try {
      const offerId = editingOffer.id || `offer-${Date.now()}`;
      const payload: HomepageOffer = {
        id: offerId,
        title: (editingOffer.title || '').trim(),
        description: (editingOffer.description || '').trim(),
        mediaType: editingOffer.mediaType || 'image',
        mediaUrl: (editingOffer.mediaUrl || '').trim(),
        fallbackImageUrl: (editingOffer.fallbackImageUrl || editingOffer.mediaUrl || '').trim(),
        ctaText: (editingOffer.ctaText || 'ORDER NOW').trim().toUpperCase(),
        ctaLink: (editingOffer.ctaLink || 'menu').trim(),
        promoCode: editingOffer.promoCode ? editingOffer.promoCode.trim().toUpperCase() : '',
        displayOrder: Number(editingOffer.displayOrder) || (offers.length + 1),
        active: editingOffer.active !== undefined ? editingOffer.active : true,
        startDate: editingOffer.startDate || null,
        endDate: editingOffer.endDate || null,
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'homepageOffers', offerId), {
        ...payload,
        createdAt: editingOffer.createdAt || serverTimestamp(),
      }, { merge: true });

      setShowOfferModal(false);
      setEditingOffer(null);
      flashMessage('Homepage offer saved successfully!');
    } catch (e: any) {
      console.error(e);
      flashMessage('Failed to save offer: ' + (e.message || 'Error'));
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('Delete this offer slide?')) return;
    try {
      await deleteDoc(doc(db, 'homepageOffers', id));
      flashMessage('Offer deleted');
    } catch (e: any) {
      console.error(e);
      flashMessage('Failed to delete offer');
    }
  };

  const handleToggleOfferActive = async (offer: HomepageOffer) => {
    try {
      await updateDoc(doc(db, 'homepageOffers', offer.id), {
        active: !offer.active,
        updatedAt: serverTimestamp()
      });
      flashMessage(`Offer ${!offer.active ? 'activated' : 'deactivated'}`);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleMoveOffer = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= offers.length) return;

    const currentItem = offers[index];
    const targetItem = offers[targetIdx];

    const currentOrder = currentItem.displayOrder ?? (index + 1);
    const targetOrder = targetItem.displayOrder ?? (targetIdx + 1);

    try {
      await updateDoc(doc(db, 'homepageOffers', currentItem.id), {
        displayOrder: targetOrder,
        updatedAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'homepageOffers', targetItem.id), {
        displayOrder: currentOrder,
        updatedAt: serverTimestamp()
      });
      flashMessage('Display order updated');
    } catch (e: any) {
      console.error(e);
      flashMessage('Could not reorder');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'mediaUrl' | 'fallbackImageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    setUploadProgress(`Uploading ${file.name}...`);

    try {
      const result = await processAndUploadMedia(file, {
        allowVideo: field === 'mediaUrl',
        onProgress: (info) => {
          setUploadProgress(`${info.message} (${info.percent}%)`);
        }
      });

      setEditingOffer(prev => ({
        ...prev,
        [field]: result.url,
        ...(field === 'mediaUrl' && !prev?.fallbackImageUrl && file.type.startsWith('image/') ? { fallbackImageUrl: result.url } : {})
      }));
      flashMessage('Media uploaded successfully!');
    } catch (err: any) {
      console.error('Upload error in offer:', err);
      toast.error(err.message || 'Media upload failed.');
      flashMessage('Upload failed');
    } finally {
      setUploadingMedia(false);
      setUploadProgress(null);
      if (e.target) e.target.value = '';
    }
  };

  // Homepage Hero Section Save
  const handleSaveHeroSection = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    try {
      await setDoc(doc(db, 'settings', 'restaurant'), {
        hero: heroForm,
        updatedAt: serverTimestamp()
      }, { merge: true });
      soundFx.playSaveSuccess();
      toast.success('Homepage Hero Section updated successfully!');
    } catch (e: any) {
      console.error(e);
      soundFx.playError();
      toast.error('Failed to update hero: ' + e.message);
    }
  };

  // Media Library Operations
  const handleDeleteMedia = async (item: MediaItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    soundFx.playDelete();
    try {
      await deleteDoc(doc(db, 'media', item.id));
      soundFx.playDelete();
      toast.success('Media removed from library');
    } catch (e: any) {
      soundFx.playError();
      toast.error('Failed to delete media');
    }
  };

  const handleUploadMediaDirect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    soundFx.playClick();

    try {
      toast.info(`Uploading ${file.name}...`);
      await processAndUploadMedia(file, {
        allowVideo: true,
        onProgress: (info) => {
          console.log(`Media upload direct: ${info.percent}% - ${info.message}`);
        }
      });
      soundFx.playUploadSuccess();
      toast.success('Media uploaded successfully');
    } catch (err: any) {
      console.error('Direct media upload error:', err);
      soundFx.playError();
      toast.error(err.message || 'Failed to upload media. Please try again.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    try {
      await setDoc(doc(db, 'settings', 'restaurant'), {
        ...editableSettings,
        updatedAt: serverTimestamp()
      }, { merge: true });
      soundFx.playSaveSuccess();
      toast.success('Restaurant settings updated successfully!');
    } catch (e: any) {
      console.error(e);
      soundFx.playError();
      toast.error('Failed to update settings');
    }
  };

  // Dashboard KPI Calculations
  const todayOrders = orders.filter(o => {
    if (!o.createdAt) return false;
    const date = o.createdAt.toDate ? o.createdAt.toDate() : new Date();
    const today = new Date();
    return date.toDateString() === today.toDateString();
  });

  const newOrdersCount = orders.filter(o => o.status === 'NEW').length;
  const preparingCount = orders.filter(o => o.status === 'PREPARING' || o.status === 'CONFIRMED').length;
  const completedCount = orders.filter(o => o.status === 'DELIVERED').length;
  const todaySales = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalSales = orders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="w-full max-w-full min-w-0 min-h-screen bg-[#0a0a0c] text-zinc-200 flex flex-col md:flex-row">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#111114] border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col shrink-0 min-w-0">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-['Teko'] text-3xl font-bold tracking-wider text-amber-500 uppercase">
              BONFIRE
            </span>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              Admin
            </span>
          </div>

          <button
            onClick={onBackToCustomerSite}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            title="View Live Site"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-3 space-y-1 flex-1 min-w-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'dashboard' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'orders' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4" />
              <span>Orders</span>
            </div>
            {newOrdersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white font-black text-[10px] flex items-center justify-center animate-pulse">
                {newOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'products' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'
            }`}
          >
            <Pizza className="w-4 h-4" />
            <span>Products</span>
          </button>

          <button
            onClick={() => setActiveTab('deals')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'deals' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Deals & Combos</span>
          </button>

          <button
            onClick={() => setActiveTab('homepage')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'homepage' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Homepage CMS</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'media' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <HardDrive className="w-4 h-4" />
              <span>Media Library</span>
            </div>
            {mediaList.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                {mediaList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'customers' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customers</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'settings' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Store Settings</span>
          </button>
        </nav>

        {/* User & Exit */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-white truncate max-w-[120px]">{user?.email}</p>
            <span className="text-[10px] text-amber-500 font-bold uppercase">Authorized Admin</span>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-8 overflow-y-auto space-y-6">
        
        {/* Top bar with back to storefront */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              {activeTab} Management
            </h1>
            <p className="text-xs text-zinc-400">
              Multan Branch Central Live Control Console
            </p>
          </div>

          <div className="flex items-center gap-3">
            {feedbackMsg && (
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold animate-fadeIn">
                {feedbackMsg}
              </span>
            )}

            <button
              onClick={onBackToCustomerSite}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-zinc-200 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
          </div>
        </div>

        {/* ================= TAB 1: DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-2xl bg-[#121215] border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Today's Orders</span>
                <p className="text-2xl font-black text-white mt-1">{todayOrders.length}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#121215] border border-amber-500/40 bg-amber-500/5">
                <span className="text-[10px] uppercase font-bold text-amber-400">New Incoming</span>
                <p className="text-2xl font-black text-amber-400 mt-1">{newOrdersCount}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#121215] border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400">In Kitchen</span>
                <p className="text-2xl font-black text-white mt-1">{preparingCount}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#121215] border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Delivered</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">{completedCount}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#121215] border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Today's Sales</span>
                <p className="text-xl font-black text-white mt-1 truncate">PKR {todaySales.toLocaleString()}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#121215] border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Customers</span>
                <p className="text-2xl font-black text-white mt-1">{customers.length}</p>
              </div>
            </div>

            {/* Quick Action incoming orders table */}
            <div className="p-6 rounded-3xl bg-[#121215] border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-['Teko'] text-2xl font-bold tracking-wider text-white uppercase">
                  ACTIVE INCOMING ORDERS (REAL-TIME)
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-amber-400 font-bold hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id || order.orderId}
                  className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-mono text-xs font-bold">
                      {order.orderId}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{order.customerName}</p>
                      <p className="text-xs text-zinc-400">{order.phone} • {order.area}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-white">PKR {order.total.toLocaleString()}</p>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      order.status === 'NEW' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateOrderStatus(order, 'CONFIRMED')}
                      className="px-2.5 py-1 rounded bg-amber-500 text-black text-xs font-bold uppercase hover:bg-amber-400"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order, 'PREPARING')}
                      className="px-2.5 py-1 rounded bg-orange-600 text-white text-xs font-bold uppercase hover:bg-orange-500"
                    >
                      Cook
                    </button>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                      title="Inspect full details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2 items-center">
              {[
                { label: 'All Orders', value: 'ALL', count: orders.length },
                { label: 'New', value: 'NEW', count: orders.filter(o => o.status === 'NEW').length, badge: 'bg-red-500 text-white' },
                { label: 'Confirmed', value: 'CONFIRMED', count: orders.filter(o => o.status === 'CONFIRMED').length },
                { label: 'Preparing', value: 'PREPARING', count: orders.filter(o => o.status === 'PREPARING').length },
                { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY', count: orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length },
                { label: 'Delivered', value: 'DELIVERED', count: orders.filter(o => o.status === 'DELIVERED').length },
                { label: 'Cancelled', value: 'CANCELLED', count: orders.filter(o => o.status === 'CANCELLED').length },
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => {
                    soundFx.playClick();
                    setOrderStatusFilter(tab.value);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    orderStatusFilter === tab.value
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'bg-[#121215] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    tab.badge || (orderStatusFilter === tab.value ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-300')
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-6 rounded-3xl bg-[#121215] border border-zinc-800 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Items</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {orders
                      .filter(o => orderStatusFilter === 'ALL' || o.status === orderStatusFilter)
                      .map((o) => (
                      <tr key={o.id || o.orderId} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-amber-400">#{o.orderId}</td>
                        <td className="p-3">
                          <p className="font-bold text-white">{o.customerName}</p>
                          <p className="text-[11px] text-zinc-400 truncate max-w-[150px]">{o.area || o.deliveryAddress}</p>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-300">{o.phone}</span>
                            {o.phone && (
                              <button
                                onClick={() => openWhatsAppChat(o.phone, `Hi ${o.customerName}, this is Bonfire Restaurant regarding your Order #${o.orderId}.`)}
                                className="p-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-medium">{o.items.length} items</td>
                        <td className="p-3 font-bold text-white">PKR {o.total.toLocaleString()}</td>
                        <td className="p-3 uppercase text-[10px] font-bold text-zinc-400">{o.orderType}</td>
                        <td className="p-3">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o, e.target.value as OrderStatus)}
                            className={`px-2 py-1 rounded text-[11px] font-black uppercase bg-zinc-900 border border-zinc-700 cursor-pointer ${
                              o.status === 'NEW'
                                ? 'text-amber-400 border-amber-500/50'
                                : o.status === 'DELIVERED'
                                ? 'text-emerald-400 border-emerald-500/50'
                                : o.status === 'CANCELLED'
                                ? 'text-red-400 border-red-500/50'
                                : 'text-zinc-200'
                            }`}
                          >
                            <option value="NEW">NEW</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PREPARING">PREPARING</option>
                            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setSelectedOrder(o);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: PRODUCTS ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-white font-['Teko'] text-2xl uppercase tracking-wide">
                  Pizza & Fast Food Catalog ({products.length})
                </h3>
                <p className="text-xs text-zinc-400">Edit, duplicate, reprice, toggle bestseller status, or upload high-res food photos.</p>
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setEditingProduct({
                    name: '',
                    category: 'pizza',
                    description: '',
                    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700',
                    smallPrice: 700,
                    mediumPrice: 1300,
                    largePrice: 1800,
                    availableSizes: ['Small', 'Medium', 'Large'],
                    active: true,
                    bestseller: false
                  });
                  setShowProductModal(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-['Teko'] text-xl font-bold uppercase hover:bg-amber-400 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>ADD NEW PRODUCT</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => (
                <div 
                  key={p.id} 
                  className={`p-4 rounded-2xl bg-[#121215] border transition-all flex flex-col justify-between gap-3 ${
                    p.active !== false ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-900 opacity-60'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700';
                        }}
                      />
                      {p.bestseller && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-black text-[9px] font-black uppercase flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5" />
                          <span>HOT</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-amber-500 font-mono tracking-wider">{p.category}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          p.active !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          {p.active !== false ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate" title={p.name}>{p.name}</h4>
                      <p className="text-xs text-zinc-400 font-medium">
                        PKR {p.smallPrice || p.singlePrice || 0}
                        {p.mediumPrice && ` • M: ${p.mediumPrice}`}
                        {p.largePrice && ` • L: ${p.largePrice}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      {/* Bestseller Toggle */}
                      <button
                        onClick={() => handleToggleProductBestseller(p)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          p.bestseller 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                        title={p.bestseller ? 'Remove Bestseller' : 'Mark as Bestseller'}
                      >
                        <Flame className="w-3.5 h-3.5" />
                      </button>

                      {/* Active Visibility Toggle */}
                      <button
                        onClick={() => handleToggleProductActive(p)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          p.active !== false 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-zinc-800 text-zinc-500 hover:text-white'
                        }`}
                        title={p.active !== false ? 'Hide product from store' : 'Publish product to store'}
                      >
                        {p.active !== false ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Duplicate Button */}
                      <button
                        onClick={() => handleDuplicateProduct(p)}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-amber-400 hover:bg-zinc-700 transition-colors"
                        title="Duplicate Product"
                      >
                        <CopyPlus className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setEditingProduct(p);
                          setShowProductModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setDeleteModalItem({ type: 'product', id: p.id, name: p.name });
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: DEALS ================= */}
        {activeTab === 'deals' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-white font-['Teko'] text-2xl uppercase tracking-wide">
                  Exclusive Multan Combos & Deals ({deals.length})
                </h3>
                <p className="text-xs text-zinc-400">Manage savings packages, bundle items, discount badges, and combo artwork.</p>
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setEditingDeal({
                    name: '',
                    description: '',
                    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700',
                    price: 1999,
                    originalPrice: 2500,
                    discountBadge: 'SAVE 20%',
                    includedItems: ['1x Medium Pizza', '2x Drinks', '1x Fries'],
                    active: true
                  });
                  setShowDealModal(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-['Teko'] text-xl font-bold uppercase hover:bg-amber-400 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>CREATE NEW DEAL</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {deals.map((d) => (
                <div 
                  key={d.id} 
                  className={`p-4 rounded-2xl bg-[#121215] border transition-all flex flex-col justify-between gap-3 ${
                    d.active !== false ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-900 opacity-60'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                      <img
                        src={d.image}
                        alt={d.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700';
                        }}
                      />
                      {d.discountBadge && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase">
                          {d.discountBadge}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          d.active !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          {d.active !== false ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate" title={d.name}>{d.name}</h4>
                      <p className="text-xs text-amber-400 font-extrabold">
                        PKR {d.price.toLocaleString()}
                        {d.originalPrice && (
                          <span className="text-zinc-500 line-through text-[11px] font-normal ml-1.5">
                            PKR {d.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">
                        {Array.isArray(d.includedItems) ? d.includedItems.join(' • ') : d.includedItems}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleToggleDealActive(d)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        d.active !== false 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-zinc-800 text-zinc-500 hover:text-white'
                      }`}
                      title={d.active !== false ? 'Disable deal on store' : 'Activate deal on store'}
                    >
                      {d.active !== false ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDuplicateDeal(d)}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-amber-400 hover:bg-zinc-700 transition-colors"
                        title="Duplicate Deal"
                      >
                        <CopyPlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setEditingDeal(d);
                          setShowDealModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                        title="Edit Deal"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setDeleteModalItem({ type: 'deal', id: d.id, name: d.name });
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Deal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: HOMEPAGE OFFERS & CAROUSEL ================= */}
        {activeTab === 'homepage' && (
          <div className="space-y-10 animate-fadeIn min-w-0">
            {/* 0. HOMEPAGE HERO / MAIN BANNER CONFIGURATION */}
            <div className="p-6 rounded-3xl bg-[#121215] border border-zinc-800 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <h3 className="text-xl font-bold text-white uppercase tracking-wide font-['Teko'] text-2xl">
                      Homepage Hero & Main Banner
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Customize the headline, subtitle, and main background/showcase image displayed at the top of the store.
                  </p>
                </div>
                <button
                  onClick={handleSaveHeroSection}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 text-black font-['Teko'] text-xl font-bold uppercase hover:bg-amber-400 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>SAVE HERO CHANGES</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Main Headline
                    </label>
                    <input
                      type="text"
                      value={heroForm.headline || ''}
                      onChange={(e) => setHeroForm(prev => ({ ...prev, headline: e.target.value }))}
                      placeholder="REAL PIZZA. REAL TASTE."
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white font-['Teko'] text-xl tracking-wide focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Subtitle / Tagline
                    </label>
                    <textarea
                      rows={3}
                      value={heroForm.subheadline || ''}
                      onChange={(e) => setHeroForm(prev => ({ ...prev, subheadline: e.target.value }))}
                      placeholder="Multan's favorite wood-fired crusts, melted mozzarella, and fiery sizzling wings delivered in 30 minutes."
                      className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                        Primary Button Text
                      </label>
                      <input
                        type="text"
                        value={heroForm.primaryBtnText || ''}
                        onChange={(e) => setHeroForm(prev => ({ ...prev, primaryBtnText: e.target.value }))}
                        placeholder="ORDER ONLINE"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white uppercase focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                        Secondary Button Text
                      </label>
                      <input
                        type="text"
                        value={heroForm.secondaryBtnText || ''}
                        onChange={(e) => setHeroForm(prev => ({ ...prev, secondaryBtnText: e.target.value }))}
                        placeholder="VIEW TODAY'S DEALS"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white uppercase focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <MediaUploader
                    value={heroForm.heroImage || ''}
                    onChange={(url) => setHeroForm(prev => ({ ...prev, heroImage: url }))}
                    label="Homepage Hero / Main Banner Image"
                    allowVideo={false}
                  />
                </div>
              </div>
            </div>

            {/* 1. OFFERS MEDIA CAROUSEL SECTION */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="text-xl font-bold text-white uppercase tracking-wide font-['Teko'] text-2xl">
                      Homepage Offers Media Carousel
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Manage full-width media slides (images & videos), autoplay banners, discount codes, and order of appearance.
                  </p>
                </div>

                <button
                  id="btn-admin-add-offer"
                  onClick={() => {
                    setEditingOffer({
                      title: 'CRISPY FRIES FREE',
                      description: 'On your first online order across Multan',
                      mediaType: 'image',
                      mediaUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=1600',
                      fallbackImageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=1600',
                      ctaText: 'CLAIM OFFER',
                      ctaLink: 'menu',
                      promoCode: 'BONFIREFREE',
                      displayOrder: offers.length + 1,
                      active: true,
                      startDate: null,
                      endDate: null
                    });
                    setShowOfferModal(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-['Teko'] text-xl font-bold uppercase tracking-wider hover:brightness-110 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                  <span>ADD OFFER</span>
                </button>
              </div>

              {/* Offers List */}
              {offers.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#121215] border border-dashed border-zinc-800 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-amber-500/50 mx-auto" />
                  <p className="text-sm font-semibold text-zinc-300">No offer slides found in Firestore</p>
                  <p className="text-xs text-zinc-500">Click &quot;+ ADD OFFER&quot; above to create your first media carousel slide.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {offers.map((offer, idx) => (
                    <div
                      key={offer.id}
                      className={`p-4 sm:p-5 rounded-2xl bg-[#121215] border transition-all ${
                        offer.active ? 'border-zinc-800 hover:border-zinc-700' : 'border-zinc-900 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        
                        {/* Left: Media Thumbnail + Details */}
                        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                          
                          {/* Reorder Buttons */}
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <button
                              disabled={idx === 0}
                              onClick={() => handleMoveOffer(idx, 'up')}
                              className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-amber-400 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none"
                              title="Move Slide Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] font-bold text-zinc-400 font-mono">
                              #{offer.displayOrder ?? (idx + 1)}
                            </span>
                            <button
                              disabled={idx === offers.length - 1}
                              onClick={() => handleMoveOffer(idx, 'down')}
                              className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-amber-400 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none"
                              title="Move Slide Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Media Preview Box */}
                          <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                            {offer.mediaType === 'video' ? (
                              <>
                                <video
                                  src={offer.mediaUrl}
                                  poster={offer.fallbackImageUrl || offer.mediaUrl}
                                  muted
                                  playsInline
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-amber-400 text-[9px] font-black uppercase flex items-center gap-1">
                                  <Video className="w-2.5 h-2.5" />
                                  <span>VIDEO</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <img
                                  src={offer.mediaUrl || offer.fallbackImageUrl}
                                  alt={offer.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-zinc-300 text-[9px] font-black uppercase">
                                  IMAGE
                                </div>
                              </>
                            )}
                          </div>

                          {/* Offer Metadata */}
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-base font-bold text-white font-['Teko'] text-xl uppercase tracking-wide truncate">
                                {offer.title}
                              </h4>
                              {offer.promoCode && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold">
                                  CODE: {offer.promoCode}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                offer.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                              }`}>
                                {offer.active ? 'Active' : 'Inactive'}
                              </span>
                            </div>

                            <p className="text-xs text-zinc-400 line-clamp-2 max-w-xl">
                              {offer.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400 pt-1">
                              <span>Button: <strong className="text-white">{offer.ctaText || 'ORDER NOW'}</strong></span>
                              <span>•</span>
                              <span>Target: <strong className="text-amber-400">{offer.ctaLink || 'menu'}</strong></span>
                            </div>
                          </div>

                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 self-end lg:self-center shrink-0 pt-2 lg:pt-0">
                          {/* Active / Inactive Switch Button */}
                          <button
                            onClick={() => handleToggleOfferActive(offer)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                              offer.active 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' 
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                            title="Toggle active on homepage"
                          >
                            {offer.active ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                            <span>{offer.active ? 'Active' : 'Disabled'}</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              setEditingOffer({ ...offer });
                              setShowOfferModal(true);
                            }}
                            className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                            title="Edit Offer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete Offer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. SECONDARY PROMOTIONAL BANNERS SECTION */}
            <div className="space-y-4 pt-6 border-t border-zinc-800/80">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-bold text-white font-['Teko'] text-2xl uppercase tracking-wide">
                    Static Promo Notices
                  </h4>
                  <p className="text-xs text-zinc-400">Additional full-width banners shown below categories</p>
                </div>
                <button
                  onClick={() => {
                    setEditingBanner({
                      title: 'HOT MULTAN DEAL OF THE DAY!',
                      subtitle: 'Save flat 20% on all deep dish pizzas tonight.',
                      badge: 'LIMITED TIME',
                      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=1200',
                      buttonText: 'ORDER NOW',
                      buttonLink: 'menu',
                      order: banners.length + 1,
                      active: true
                    });
                    setShowBannerModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold uppercase"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Notice</span>
                </button>
              </div>

              <div className="space-y-3">
                {banners.map((b) => (
                  <div key={b.id} className="p-3.5 rounded-xl bg-[#121215] border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-amber-500">{b.badge}</span>
                      <h4 className="text-sm font-bold text-white">{b.title}</h4>
                      <p className="text-xs text-zinc-400">{b.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingBanner(b);
                          setShowBannerModal(true);
                        }}
                        className="p-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b.id)}
                        className="p-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 6: MEDIA LIBRARY ================= */}
        {activeTab === 'media' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white font-['Teko'] text-2xl uppercase tracking-wide">
                  Media Library Assets ({mediaList.length})
                </h3>
                <p className="text-xs text-zinc-400">
                  Upload, organize, and reuse food photos, deal banners, and video clips across your restaurant website.
                </p>
              </div>

              <label className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-['Teko'] text-xl font-bold uppercase hover:bg-amber-400 shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95 transition-all">
                <Upload className="w-5 h-5" />
                <span>UPLOAD FROM DEVICE</span>
                <input
                  type="file"
                  accept="image/*,video/mp4,video/webm"
                  onChange={handleUploadMediaDirect}
                  className="hidden"
                />
              </label>
            </div>

            {mediaList.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#121215] border border-dashed border-zinc-800 text-center space-y-3">
                <Image className="w-12 h-12 text-zinc-600 mx-auto" />
                <p className="text-sm font-bold text-zinc-300">No media uploaded yet</p>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Click &quot;UPLOAD FROM DEVICE&quot; above to add high-resolution pizza, burger, and deal pictures to your asset catalog.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mediaList.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl bg-[#121215] border border-zinc-800 hover:border-amber-500/50 overflow-hidden flex flex-col transition-all"
                  >
                    <div className="relative aspect-square bg-zinc-900 overflow-hidden">
                      {item.type === 'video' ? (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700';
                          }}
                        />
                      )}
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-zinc-300 uppercase">
                        {item.type}
                      </span>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                      <p className="text-xs font-semibold text-white truncate" title={item.name}>
                        {item.name}
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/80">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.url);
                            soundFx.playClick();
                            toast.success('Media URL copied to clipboard!');
                          }}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-bold flex items-center gap-1"
                          title="Copy direct URL"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy URL</span>
                        </button>
                        <button
                          onClick={() => handleDeleteMedia(item)}
                          className="p-1 rounded bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
                          title="Delete media"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 7: CUSTOMERS ================= */}
        {activeTab === 'customers' && (
          <div className="p-6 rounded-3xl bg-[#121215] border border-zinc-800 animate-fadeIn space-y-4">
            <h3 className="text-lg font-bold text-white">Registered Customer Accounts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {customers.map((c) => (
                    <tr key={c.id || c.uid}>
                      <td className="p-3 font-bold text-white">{c.name || 'Anonymous Customer'}</td>
                      <td className="p-3">{c.email}</td>
                      <td className="p-3">{c.phone || 'N/A'}</td>
                      <td className="p-3 uppercase font-bold text-amber-400">{c.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 7: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="max-w-3xl p-6 rounded-3xl bg-[#121215] border border-zinc-800 space-y-6 animate-fadeIn">
            <h3 className="text-lg font-bold text-white">Restaurant Operational Configuration</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={editableSettings.name}
                  onChange={(e) => setEditableSettings({ ...editableSettings, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">WhatsApp Hotline</label>
                <input
                  type="text"
                  value={editableSettings.whatsapp}
                  onChange={(e) => setEditableSettings({ ...editableSettings, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Minimum Order (PKR)</label>
                <input
                  type="number"
                  value={editableSettings.minimumOrder}
                  onChange={(e) => setEditableSettings({ ...editableSettings, minimumOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Standard Delivery Fee (PKR)</label>
                <input
                  type="number"
                  value={editableSettings.deliveryFee}
                  onChange={(e) => setEditableSettings({ ...editableSettings, deliveryFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Opening Time</label>
                <input
                  type="text"
                  value={editableSettings.openingTime}
                  onChange={(e) => setEditableSettings({ ...editableSettings, openingTime: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Closing Time</label>
                <input
                  type="text"
                  value={editableSettings.closingTime}
                  onChange={(e) => setEditableSettings({ ...editableSettings, closingTime: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-500 text-black font-['Teko'] text-xl font-bold uppercase hover:bg-amber-400 flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>SAVE CONFIGURATION</span>
            </button>
          </form>
        )}

      </main>

      {/* Detail Modal for Selected Order */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto overscroll-y-contain p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn flex items-center justify-center touch-scroll"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              soundFx.playClick();
              setSelectedOrder(null);
            }
          }}
        >
          <div className="w-full max-w-lg max-h-[92dvh] sm:max-h-[88vh] bg-[#121215] border border-zinc-800 rounded-3xl shadow-2xl flex flex-col my-auto overflow-hidden animate-scaleUp text-left">
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-800 bg-[#121215]">
              <div>
                <span className="text-xs text-zinc-500 font-mono">ORDER #{selectedOrder.orderId}</span>
                <h3 className="text-xl font-bold text-white font-['Teko'] text-2xl uppercase tracking-wide">{selectedOrder.customerName}</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedOrder(null);
                }}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto overscroll-y-contain p-5 sm:p-6 space-y-4 touch-scroll text-xs">
              <p><strong className="text-white">Phone:</strong> {selectedOrder.phone}</p>
              <p><strong className="text-white">Address:</strong> {selectedOrder.deliveryAddress} ({selectedOrder.area})</p>
              <p><strong className="text-white">Order Notes:</strong> {selectedOrder.notes || 'None'}</p>
              
              <div className="border-t border-zinc-800 pt-3">
                <p className="font-bold text-white mb-2">Items Ordered:</p>
                <div className="space-y-1.5">
                  {selectedOrder.items.map((it, i) => (
                    <div key={i} className="flex justify-between py-1 px-2.5 rounded-lg bg-zinc-900/60 text-zinc-400">
                      <span>{it.quantity}x {it.name} {it.selectedSize && `(${it.selectedSize})`}</span>
                      <span className="text-zinc-300 font-mono">PKR {(it.itemPrice * it.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-3 flex justify-between font-bold text-white text-sm">
                <span>Total Amount:</span>
                <span className="text-amber-400 font-mono">PKR {selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="shrink-0 p-4 sm:p-5 border-t border-zinc-800 bg-[#141418] space-y-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Change Status:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateOrderStatus(selectedOrder, 'CONFIRMED')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold"
                >
                  CONFIRM
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrder, 'PREPARING')}
                  className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold"
                >
                  PREPARING
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrder, 'OUT_FOR_DELIVERY')}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold"
                >
                  OUT FOR DELIVERY
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrder, 'DELIVERED')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold"
                >
                  DELIVERED
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrder, 'CANCELLED')}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && editingProduct && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto overscroll-y-contain p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn flex items-center justify-center touch-scroll"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              soundFx.playClick();
              setShowProductModal(false);
            }
          }}
        >
          <form 
            onSubmit={handleSaveProduct} 
            className="w-full max-w-lg max-h-[92dvh] sm:max-h-[88vh] bg-[#121215] border border-zinc-800 rounded-3xl shadow-2xl flex flex-col my-auto overflow-hidden animate-scaleUp text-left"
          >
            {/* Sticky Header */}
            <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-800 bg-[#121215]">
              <div className="flex items-center gap-2.5">
                <Pizza className="w-5 h-5 text-amber-500" />
                <h3 className="text-xl font-bold text-white font-['Teko'] text-2xl uppercase tracking-wide">
                  {editingProduct.id ? 'Edit Product' : 'Add New Product'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setShowProductModal(false);
                }}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto overscroll-y-contain p-5 sm:p-6 space-y-4 touch-scroll">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Product Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Firehouse Supreme Pizza"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Category Slug (e.g. pizza, burgers, wings, fries, beverages)</label>
                <input
                  type="text"
                  required
                  value={editingProduct.category || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  placeholder="pizza"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <MediaUploader
                value={editingProduct.image || ''}
                onChange={(url) => setEditingProduct({ ...editingProduct, image: url })}
                label="Product Image"
                allowVideo={false}
              />

              <div>
                <label className="text-xs text-zinc-400 block mb-1.5 font-medium">Pricing (PKR)</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 font-semibold uppercase">Small / Single</label>
                    <input
                      type="number"
                      value={editingProduct.smallPrice || editingProduct.singlePrice || ''}
                      onChange={(e) => setEditingProduct({ 
                        ...editingProduct, 
                        smallPrice: Number(e.target.value),
                        singlePrice: Number(e.target.value) 
                      })}
                      placeholder="699"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 font-semibold uppercase">Medium</label>
                    <input
                      type="number"
                      value={editingProduct.mediumPrice || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, mediumPrice: Number(e.target.value) })}
                      placeholder="1199"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 font-semibold uppercase">Large</label>
                    <input
                      type="number"
                      value={editingProduct.largePrice || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, largePrice: Number(e.target.value) })}
                      placeholder="1699"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Description</label>
                <textarea
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Ingredients, toppings, preparation notes..."
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none h-24 resize-y"
                />
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="shrink-0 px-5 sm:px-6 py-4 border-t border-zinc-800 bg-[#141418] flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-['Teko'] text-xl font-bold uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-amber-500/20"
              >
                Save Product
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setShowProductModal(false);
                }}
                className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dedicated Remove / Delete Item Confirmation Modal */}
      {deleteModalItem && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto overscroll-y-contain p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn flex items-center justify-center touch-scroll"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              soundFx.playClick();
              setDeleteModalItem(null);
            }
          }}
        >
          <div className="w-full max-w-md max-h-[92dvh] sm:max-h-[88vh] bg-[#121215] border border-red-500/30 rounded-3xl shadow-2xl flex flex-col my-auto overflow-hidden animate-scaleUp text-left">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-800 bg-[#121215]">
              <div className="flex items-center gap-2.5 text-red-400">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-xl font-bold text-white font-['Teko'] text-2xl uppercase tracking-wide">
                  Remove {deleteModalItem.type === 'product' ? 'Product' : 'Deal'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setDeleteModalItem(null);
                }}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto overscroll-y-contain p-5 sm:p-6 space-y-4 touch-scroll">
              <p className="text-sm text-zinc-200">
                Are you sure you want to permanently delete <strong className="text-white">&quot;{deleteModalItem.name}&quot;</strong>?
              </p>
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 leading-relaxed">
                This {deleteModalItem.type} will be removed from your store menu, active listings, and ordering system immediately. This action cannot be undone.
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="shrink-0 px-5 sm:px-6 py-4 border-t border-zinc-800 bg-[#141418] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setDeleteModalItem(null);
                }}
                className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAndExecuteDelete}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-['Teko'] text-xl font-bold uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-red-500/20"
              >
                Delete {deleteModalItem.type === 'product' ? 'Product' : 'Deal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Deal Modal */}
      {showDealModal && editingDeal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto overscroll-y-contain p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn flex items-center justify-center touch-scroll"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              soundFx.playClick();
              setShowDealModal(false);
            }
          }}
        >
          <form 
            onSubmit={handleSaveDeal} 
            className="w-full max-w-lg max-h-[92dvh] sm:max-h-[88vh] bg-[#121215] border border-zinc-800 rounded-3xl shadow-2xl flex flex-col my-auto overflow-hidden animate-scaleUp text-left"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-800 bg-[#121215]">
              <div className="flex items-center gap-2.5">
                <Tag className="w-5 h-5 text-amber-500" />
                <h3 className="text-xl font-bold text-white font-['Teko'] text-2xl uppercase tracking-wide">
                  {editingDeal.id ? 'Edit Deal / Combo' : 'Create New Deal'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setShowDealModal(false);
                }}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto overscroll-y-contain p-5 sm:p-6 space-y-4 touch-scroll">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Deal Title</label>
                <input
                  type="text"
                  required
                  value={editingDeal.name || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, name: e.target.value })}
                  placeholder="e.g. Bonfire Midnight Feast"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <MediaUploader
                value={editingDeal.image || ''}
                onChange={(url) => setEditingDeal({ ...editingDeal, image: url })}
                label="Deal / Combo Image"
                allowVideo={false}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Deal Price (PKR)</label>
                  <input
                    type="number"
                    required
                    value={editingDeal.price || ''}
                    onChange={(e) => setEditingDeal({ ...editingDeal, price: Number(e.target.value) })}
                    placeholder="1499"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Original Price (PKR)</label>
                  <input
                    type="number"
                    value={editingDeal.originalPrice || ''}
                    onChange={(e) => setEditingDeal({ ...editingDeal, originalPrice: Number(e.target.value) })}
                    placeholder="1999"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Discount Badge (e.g. SAVE 25%)</label>
                <input
                  type="text"
                  value={editingDeal.discountBadge || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, discountBadge: e.target.value })}
                  placeholder="SAVE 25%"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Included Items (comma separated)</label>
                <input
                  type="text"
                  value={Array.isArray(editingDeal.includedItems) ? editingDeal.includedItems.join(', ') : editingDeal.includedItems || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, includedItems: e.target.value as any })}
                  placeholder="1 Large Pizza, 2 Garlic Breads, 1.5L Drink"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="shrink-0 px-5 sm:px-6 py-4 border-t border-zinc-800 bg-[#141418] flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-['Teko'] text-xl font-bold uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-amber-500/20"
              >
                Save Deal
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setShowDealModal(false);
                }}
                className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Banner Modal */}
      {showBannerModal && editingBanner && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto overscroll-y-contain p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn flex items-center justify-center touch-scroll"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              soundFx.playClick();
              setShowBannerModal(false);
            }
          }}
        >
          <form 
            onSubmit={handleSaveBanner} 
            className="w-full max-w-lg max-h-[92dvh] sm:max-h-[88vh] bg-[#121215] border border-zinc-800 rounded-3xl shadow-2xl flex flex-col my-auto overflow-hidden animate-scaleUp text-left"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-800 bg-[#121215]">
              <div className="flex items-center gap-2.5">
                <Image className="w-5 h-5 text-amber-500" />
                <h3 className="text-xl font-bold text-white font-['Teko'] text-2xl uppercase tracking-wide">
                  Configure Homepage Banner
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setShowBannerModal(false);
                }}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto overscroll-y-contain p-5 sm:p-6 space-y-4 touch-scroll">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Banner Title</label>
                <input
                  type="text"
                  required
                  value={editingBanner.title || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  placeholder="e.g. Sizzling Wood-Fired Pizzas"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Subtitle</label>
                <input
                  type="text"
                  value={editingBanner.subtitle || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  placeholder="e.g. Freshly Baked with Premium Ingredients"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <MediaUploader
                value={editingBanner.image || ''}
                onChange={(url) => setEditingBanner({ ...editingBanner, image: url })}
                label="Banner Image"
                aspectRatio="banner"
                allowVideo={false}
              />
            </div>

            {/* Sticky Actions Footer */}
            <div className="shrink-0 px-5 sm:px-6 py-4 border-t border-zinc-800 bg-[#141418] flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-['Teko'] text-xl font-bold uppercase tracking-wider active:scale-95 transition-all shadow-lg shadow-amber-500/20"
              >
                Save Banner
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setShowBannerModal(false);
                }}
                className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= Add/Edit Homepage Offer Modal ================= */}
      {showOfferModal && editingOffer && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto overscroll-y-contain p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn flex items-center justify-center touch-scroll"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              soundFx.playClick();
              setShowOfferModal(false);
            }
          }}
        >
          <form
            onSubmit={handleSaveOffer}
            className="w-full max-w-2xl max-h-[92dvh] sm:max-h-[88vh] bg-[#121215] border border-zinc-800 rounded-3xl shadow-2xl flex flex-col my-auto overflow-hidden animate-scaleUp text-left"
          >
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between px-5 sm:px-7 py-4 border-b border-zinc-800 bg-[#121215]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-xl font-bold text-white font-['Teko'] uppercase tracking-wider text-2xl">
                  {editingOffer.id ? 'Edit Homepage Offer Slide' : 'Create New Offer Slide'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setShowOfferModal(false);
                }}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto overscroll-y-contain p-5 sm:p-7 space-y-5 touch-scroll">

            {/* Offer Title & Promo Code Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8">
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Offer Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FREE CRISPY FRIES"
                  value={editingOffer.title || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Promo Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BONFIREFREE"
                  value={editingOffer.promoCode || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, promoCode: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-amber-400 font-mono font-bold focus:border-amber-500 focus:outline-none uppercase"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Short Description / Tagline <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. On your first online order across Multan"
                value={editingOffer.description || ''}
                onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Media Type Toggle */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  Media Type
                </label>
                <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setEditingOffer({ ...editingOffer, mediaType: 'image' })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      editingOffer.mediaType !== 'video'
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Image className="w-3.5 h-3.5" />
                    <span>Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingOffer({ ...editingOffer, mediaType: 'video' })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      editingOffer.mediaType === 'video'
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video</span>
                  </button>
                </div>
              </div>

              {/* Media URL and File Upload */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-zinc-300">
                      {editingOffer.mediaType === 'video' ? 'Video URL (.mp4, .webm)' : 'Image URL'} <span className="text-red-400">*</span>
                    </label>
                    <label className="cursor-pointer text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept={editingOffer.mediaType === 'video' ? 'video/mp4,video/webm' : 'image/*'}
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'mediaUrl')}
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    required
                    placeholder={editingOffer.mediaType === 'video' ? 'https://.../video.mp4' : 'https://images.unsplash.com/...'}
                    value={editingOffer.mediaUrl || ''}
                    onChange={(e) => setEditingOffer({ ...editingOffer, mediaUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                  {uploadProgress && (
                    <p className="text-[11px] text-amber-400 mt-1 animate-pulse">{uploadProgress}</p>
                  )}
                </div>

                {/* Video Fallback Image / Poster */}
                {editingOffer.mediaType === 'video' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-zinc-300">
                        Fallback / Poster Image URL (Recommended)
                      </label>
                      <label className="cursor-pointer text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Upload Poster</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'fallbackImageUrl')}
                        />
                      </label>
                    </div>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={editingOffer.fallbackImageUrl || ''}
                      onChange={(e) => setEditingOffer({ ...editingOffer, fallbackImageUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Live Preview */}
                {editingOffer.mediaUrl && (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden bg-black border border-zinc-800 mt-2">
                    {editingOffer.mediaType === 'video' ? (
                      <video
                        src={editingOffer.mediaUrl}
                        poster={editingOffer.fallbackImageUrl || editingOffer.mediaUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={editingOffer.mediaUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-zinc-300 font-mono">
                      Live Preview
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. CLAIM OFFER or ORDER NOW"
                  value={editingOffer.ctaText || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, ctaText: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white uppercase focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Destination Page / Link
                </label>
                <select
                  value={editingOffer.ctaLink || 'menu'}
                  onChange={(e) => setEditingOffer({ ...editingOffer, ctaLink: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="menu">Explore Menu (Default)</option>
                  <option value="deals">Deals & Combos</option>
                  <option value="about">About Bonfire</option>
                  <option value="contact">Contact & Locations</option>
                </select>
              </div>
            </div>

            {/* Order & Active Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={editingOffer.displayOrder || 1}
                  onChange={(e) => setEditingOffer({ ...editingOffer, displayOrder: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="offerActiveCheck"
                  checked={editingOffer.active !== false}
                  onChange={(e) => setEditingOffer({ ...editingOffer, active: e.target.checked })}
                  className="w-5 h-5 rounded text-amber-500 bg-zinc-900 border-zinc-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="offerActiveCheck" className="text-xs font-semibold text-zinc-200 cursor-pointer select-none">
                  Active (Visible on Homepage Carousel)
                </label>
              </div>
            </div>
            </div>

            {/* Sticky Modal Actions Footer */}
            <div className="shrink-0 px-5 sm:px-7 py-4 border-t border-zinc-800 bg-[#141418] flex gap-3">
              <button
                type="submit"
                disabled={uploadingMedia}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-['Teko'] text-xl font-bold uppercase tracking-wider hover:brightness-110 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {uploadingMedia ? 'Uploading media...' : 'SAVE OFFER SLIDE'}
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setShowOfferModal(false);
                }}
                className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
