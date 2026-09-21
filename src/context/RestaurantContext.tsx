import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Product, 
  Category, 
  Deal, 
  HomepageBanner, 
  HomepageOffer,
  RestaurantSettings 
} from '../types';
import { 
  INITIAL_SETTINGS, 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_DEALS, 
  INITIAL_BANNERS, 
  INITIAL_HOMEPAGE_OFFERS,
  seedInitialFirestoreDataIfEmpty 
} from '../lib/seedData';

interface RestaurantContextType {
  settings: RestaurantSettings;
  categories: Category[];
  products: Product[];
  deals: Deal[];
  banners: HomepageBanner[];
  homepageOffers: HomepageOffer[];
  loading: boolean;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  refreshData: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<RestaurantSettings>(INITIAL_SETTINGS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [banners, setBanners] = useState<HomepageBanner[]>(INITIAL_BANNERS);
  const [homepageOffers, setHomepageOffers] = useState<HomepageOffer[]>(INITIAL_HOMEPAGE_OFFERS);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('pizza');

  useEffect(() => {
    // Attempt auto-seed if first run
    seedInitialFirestoreDataIfEmpty();

    // 1. Settings listener
    const unsubSettings = onSnapshot(doc(db, 'settings', 'restaurant'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as RestaurantSettings);
      }
    }, (err) => console.warn('Settings stream fallback', err));

    // 2. Categories listener
    const catsQuery = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const unsubCats = onSnapshot(catsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category));
        setCategories(list);
      }
    }, (err) => console.warn('Categories stream fallback', err));

    // 3. Products listener
    const unsubProds = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        setProducts(list);
      }
    }, (err) => console.warn('Products stream fallback', err));

    // 4. Deals listener
    const unsubDeals = onSnapshot(collection(db, 'deals'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Deal));
        setDeals(list);
      }
    }, (err) => console.warn('Deals stream fallback', err));

    // 5. Banners listener
    const bannerQuery = query(collection(db, 'banners'), orderBy('order', 'asc'));
    const unsubBanners = onSnapshot(bannerQuery, (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HomepageBanner));
        setBanners(list);
      }
    }, (err) => console.warn('Banners stream fallback', err));

    // 6. Homepage Offers Realtime listener (sorted by displayOrder ASC)
    const offersQuery = query(collection(db, 'homepageOffers'), orderBy('displayOrder', 'asc'));
    const unsubOffers = onSnapshot(offersQuery, (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HomepageOffer));
        setHomepageOffers(list);
      }
      setLoading(false);
    }, (err) => {
      console.warn('Offers stream fallback', err);
      setLoading(false);
    });

    return () => {
      unsubSettings();
      unsubCats();
      unsubProds();
      unsubDeals();
      unsubBanners();
      unsubOffers();
    };
  }, []);

  const refreshData = () => {
    seedInitialFirestoreDataIfEmpty();
  };

  return (
    <RestaurantContext.Provider
      value={{
        settings,
        categories,
        products,
        deals,
        banners,
        homepageOffers,
        loading,
        selectedCategory,
        setSelectedCategory,
        refreshData
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurant must be used within RestaurantProvider');
  return ctx;
};
