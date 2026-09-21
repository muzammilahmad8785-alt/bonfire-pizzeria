import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Category, Product, Deal, HomepageBanner, HomepageOffer, RestaurantSettings } from '../types';

export const INITIAL_SETTINGS: RestaurantSettings = {
  name: 'BONFIRE PIZZERIA',
  tagline: 'REAL PIZZA. REAL TASTE.',
  logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&auto=format&fit=crop&q=80',
  phone: '0306-7451542',
  whatsapp: '0306-7451542',
  openingTime: '10:00 AM',
  closingTime: '04:00 AM',
  minimumOrder: 500,
  deliveryFee: 150,
  freeDeliveryThreshold: 2500,
  pickupAvailable: true,
  deliveryAvailable: true,
  address: 'Main Bosan Road, Gulgasht Colony, Multan, Pakistan',
  city: 'Multan',
  googleMapsLink: 'https://maps.google.com/?q=Multan+Pakistan',
  hero: {
    headline: 'REAL PIZZA. REAL TASTE.',
    subheadline: 'Freshly made stone-baked pizzas, double-smashed smash burgers, hot wings, and cheesy loaded favorites in Multan.',
    heroImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80',
    primaryBtnText: 'ORDER ONLINE',
    primaryBtnLink: 'menu',
    secondaryBtnText: 'VIEW FULL MENU',
    secondaryBtnLink: 'menu',
  },
  socials: {
    facebook: 'https://facebook.com/bonfirepizzeriamultan',
    instagram: 'https://instagram.com/bonfirepizzeriamultan',
    tiktok: 'https://tiktok.com/@bonfirepizzeria',
  }
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'pizza',
    name: 'PIZZAS',
    slug: 'pizza',
    order: 1,
    active: true,
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=80',
    icon: 'Pizza'
  },
  {
    id: 'deep-dish',
    name: 'DEEP DISH',
    slug: 'deep-dish',
    order: 2,
    active: true,
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500&auto=format&fit=crop&q=80',
    icon: 'Flame'
  },
  {
    id: 'stuff-crust',
    name: 'STUFF CRUST',
    slug: 'stuff-crust',
    order: 3,
    active: true,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80',
    icon: 'Sparkles'
  },
  {
    id: 'burgers',
    name: 'BURGERS',
    slug: 'burgers',
    order: 4,
    active: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    icon: 'Sandwich'
  },
  {
    id: 'wings',
    name: 'WINGS',
    slug: 'wings',
    order: 5,
    active: true,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80',
    icon: 'Drumstick'
  },
  {
    id: 'fries',
    name: 'FRIES',
    slug: 'fries',
    order: 6,
    active: true,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
    icon: 'Utensils'
  },
  {
    id: 'drinks',
    name: 'DRINKS',
    slug: 'drinks',
    order: 7,
    active: true,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80',
    icon: 'CupSoda'
  },
  {
    id: 'deals',
    name: 'DEALS',
    slug: 'deals',
    order: 8,
    active: true,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    icon: 'Tag'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'bonfire-special-pizza',
    name: 'Bonfire Fiery Special Pizza',
    category: 'pizza',
    description: 'Tender spicy peri-peri chicken, smoked sausages, black olives, jalapenos, mushrooms, capsicum & signature Bonfire molten cheese sauce.',
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=700&auto=format&fit=crop&q=80',
    smallPrice: 750,
    mediumPrice: 1350,
    largePrice: 1850,
    availableSizes: ['Small', 'Medium', 'Large'],
    addons: [
      { id: 'extra-cheese', name: 'Extra Mozzarella Melt', price: 180 },
      { id: 'garlic-dip', name: 'Creamy Garlic Ranch Dip', price: 90 },
      { id: 'jalapeno-popper', name: 'Spicy Jalapeno Blast', price: 80 }
    ],
    bestseller: true,
    featured: true,
    active: true,
    rating: 4.9
  },
  {
    id: 'smoky-bbq-tikka-pizza',
    name: 'Smoky BBQ Tikka Pizza',
    category: 'pizza',
    description: 'Traditional charcoal grilled chicken tikka chunks, caramelized red onions, bell peppers with our artisan BBQ glaze.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=700&auto=format&fit=crop&q=80',
    smallPrice: 690,
    mediumPrice: 1250,
    largePrice: 1750,
    availableSizes: ['Small', 'Medium', 'Large'],
    addons: [
      { id: 'extra-cheese', name: 'Extra Mozzarella Melt', price: 180 },
      { id: 'bbq-sauce', name: 'Smoked Chipotle BBQ Dip', price: 90 }
    ],
    bestseller: true,
    featured: true,
    active: true,
    rating: 4.8
  },
  {
    id: 'chicago-deep-dish-overload',
    name: 'Chicago Meat Overload Deep Dish',
    category: 'deep-dish',
    description: 'Two-inch thick buttery crust loaded with 400g strings of mozzarella, pepperoni slices, beef salami, garlic herb marinara & parmesan.',
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=700&auto=format&fit=crop&q=80',
    smallPrice: 1200,
    mediumPrice: 1950,
    largePrice: 2600,
    availableSizes: ['Small', 'Medium', 'Large'],
    addons: [
      { id: 'garlic-dip', name: 'Creamy Garlic Ranch Dip', price: 90 },
      { id: 'hot-honey', name: 'Hot Honey Drizzle', price: 120 }
    ],
    bestseller: true,
    featured: true,
    active: true,
    rating: 5.0
  },
  {
    id: 'stuff-crust-kebab-blast',
    name: 'Kebab Crust Extravaganza',
    category: 'stuff-crust',
    description: 'Crown crust stuffed with juicy spicy seekh kebab and melted cheddar. Topped with creamy chicken fajita, sweet corn & herbs.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&auto=format&fit=crop&q=80',
    mediumPrice: 1490,
    largePrice: 2050,
    availableSizes: ['Medium', 'Large'],
    bestseller: true,
    featured: false,
    active: true,
    rating: 4.7
  },
  {
    id: 'the-bonfire-double-smash-burger',
    name: 'The Bonfire Beast Smash Burger',
    category: 'burgers',
    description: 'Double 100% smashed beef/chicken patties, crispy onion ring tower, double aged cheddar, smoked beef bacon, and secret flame sauce in a butter toasted brioche bun.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80',
    singlePrice: 650,
    availableSizes: ['Single'],
    addons: [
      { id: 'extra-patty', name: 'Extra Patty', price: 220 },
      { id: 'extra-cheese-slice', name: 'Aged Cheddar Slice', price: 70 },
      { id: 'jalapenos', name: 'Pickled Jalapenos', price: 50 }
    ],
    bestseller: true,
    featured: true,
    active: true,
    rating: 4.9
  },
  {
    id: 'crispy-zinger-crunch',
    name: 'Firehouse Crispy Zinger',
    category: 'burgers',
    description: 'Golden super-crunchy hand-breaded chicken breast fillet drenched in dynamite mayo, crisp iceberg lettuce and cheese sauce.',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=700&auto=format&fit=crop&q=80',
    singlePrice: 480,
    availableSizes: ['Single'],
    addons: [
      { id: 'cheese-slice', name: 'Melted Cheese Slice', price: 60 },
      { id: 'peri-mayo', name: 'Extra Peri Mayo', price: 60 }
    ],
    bestseller: true,
    featured: false,
    active: true,
    rating: 4.7
  },
  {
    id: 'honey-glazed-bbq-wings',
    name: 'Honey Glazed Smoky Wings (6 Pcs)',
    category: 'wings',
    description: 'Oven-roasted then flame-kissed chicken wings tossed in sticky honey BBQ reduction with toasted sesame seeds and cool ranch.',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=700&auto=format&fit=crop&q=80',
    singlePrice: 480,
    availableSizes: ['Single'],
    addons: [
      { id: 'ranch-dip', name: 'Garlic Ranch Dip', price: 80 }
    ],
    bestseller: true,
    featured: true,
    active: true,
    rating: 4.8
  },
  {
    id: 'loaded-dynamite-curly-fries',
    name: 'Bonfire Loaded Queso Curly Fries',
    category: 'fries',
    description: 'Crispy seasoned curly and waffle fries drenched in warm molten cheddar cheese, crispy chicken bits, jalapeno rings & spicy drizzle.',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=700&auto=format&fit=crop&q=80',
    singlePrice: 420,
    availableSizes: ['Single'],
    bestseller: true,
    featured: true,
    active: true,
    rating: 4.9
  },
  {
    id: 'mint-margarita-chiller',
    name: 'Multan Mint Margherita Cooler',
    category: 'drinks',
    description: 'Fresh crushed garden mint, zesty lemons, ice crystals and sparkling fizz. Refreshing Multan heat buster.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=700&auto=format&fit=crop&q=80',
    singlePrice: 220,
    availableSizes: ['Single'],
    active: true,
    rating: 4.6
  },
  {
    id: 'gourmet-chocolate-shake',
    name: 'Thick Belgian Fudge Shake',
    category: 'drinks',
    description: 'Rich Belgian chocolate ganache blended with premium dairy gelato, topped with whipped mountain and cocoa flakes.',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=700&auto=format&fit=crop&q=80',
    singlePrice: 380,
    availableSizes: ['Single'],
    active: true,
    rating: 4.9
  }
];

export const INITIAL_DEALS: Deal[] = [
  {
    id: 'bonfire-duo-feast',
    name: 'Bonfire Duo Feast',
    description: '1 Medium Pizza (Any Flavor) + 2 Crispy Zinger Burgers + 1 Regular Curly Fries + 1.5L Soft Drink.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&auto=format&fit=crop&q=80',
    includedItems: [
      '1x Medium Pizza',
      '2x Crispy Zinger Burgers',
      '1x Curly Fries',
      '1x 1.5L Cold Drink'
    ],
    price: 2199,
    originalPrice: 2850,
    discountBadge: 'SAVE 23%',
    featured: true,
    active: true
  },
  {
    id: 'multan-midnight-craver',
    name: 'Multan Midnight Craver',
    description: '1 Large Pan Pizza + 6 Smoky Honey BBQ Wings + 2 Garlic Ranch Dips + 2 Drinks. Perfect for midnight hunger.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=700&auto=format&fit=crop&q=80',
    includedItems: [
      '1x Large Special Pizza',
      '6x Smoky BBQ Wings',
      '2x Ranch Dips',
      '2x 345ml Soft Drinks'
    ],
    price: 2350,
    originalPrice: 2950,
    discountBadge: 'BEST VALUE',
    featured: true,
    active: true
  },
  {
    id: 'solo-smash-box',
    name: 'Solo Beast Combo Box',
    description: '1 The Bonfire Beast Smash Burger + 1 Crispy Fries + 1 Chilled Soft Drink.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80',
    includedItems: [
      '1x Bonfire Beast Smash Burger',
      '1x Crisp Fries',
      '1x Soft Drink Can'
    ],
    price: 899,
    originalPrice: 1100,
    discountBadge: 'POPULAR',
    featured: true,
    active: true
  }
];

export const INITIAL_BANNERS: HomepageBanner[] = [
  {
    id: 'banner-first-order',
    title: 'HUNGRY? FREE CRISPY FRIES ON YOUR FIRST ORDER!',
    subtitle: 'Use code FREESIDE at checkout on orders over PKR 1,000.',
    badge: 'EXCLUSIVE ONLINE OFFER',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'CLAIM NOW',
    buttonLink: '#menu',
    order: 1,
    active: true
  },
  {
    id: 'banner-late-night',
    title: 'MULTAN OPEN LATE TILL 4:00 AM!',
    subtitle: 'Hot, piping pizzas delivered right to your doorstep across Multan.',
    badge: 'NIGHT OWLS SPECIAL',
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=1200&auto=format&fit=crop&q=80',
    buttonText: 'ORDER LATE NIGHT',
    buttonLink: '#menu',
    order: 2,
    active: true
  }
];

export const INITIAL_HOMEPAGE_OFFERS: HomepageOffer[] = [
  {
    id: 'offer-free-fries',
    title: 'FREE CRISPY FRIES',
    description: 'Enjoy complimentary golden seasoned fries on your first online order across Multan.',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=1600&auto=format&fit=crop&q=80',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=1600&auto=format&fit=crop&q=80',
    ctaText: 'CLAIM OFFER',
    ctaLink: 'menu',
    promoCode: 'BONFIREFREE',
    displayOrder: 1,
    active: true,
    startDate: null,
    endDate: null
  },
  {
    id: 'offer-family-deal',
    title: 'FAMILY PIZZA DEAL',
    description: '2 Large 14-inch pizzas + 8 fire wings + 1.5L soft drink for the ultimate feast.',
    mediaType: 'video',
    // High-performance royalty-free stream with instant video playback
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-slice-of-pizza-with-cheese-stretching-42999-large.mp4',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&auto=format&fit=crop&q=80',
    ctaText: 'ORDER NOW',
    ctaLink: 'deals',
    promoCode: 'FAMILYFEAST',
    displayOrder: 2,
    active: true,
    startDate: null,
    endDate: null
  },
  {
    id: 'offer-weekend-special',
    title: 'WEEKEND SPECIAL',
    description: 'Limited time chef special with double melted mozzarella and signature fire crust.',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1600&auto=format&fit=crop&q=80',
    fallbackImageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1600&auto=format&fit=crop&q=80',
    ctaText: 'ORDER NOW',
    ctaLink: 'menu',
    promoCode: 'WEEKEND20',
    displayOrder: 3,
    active: true,
    startDate: null,
    endDate: null
  }
];

/**
 * Initializes Firestore with real default restaurant data if collections are empty.
 */
export async function seedInitialFirestoreDataIfEmpty(): Promise<void> {
  try {
    // 0. Check & Seed Homepage Offers independently so existing deployments get offers
    const offersSnapshot = await getDocs(collection(db, 'homepageOffers'));
    if (offersSnapshot.empty) {
      console.log('Seeding initial Homepage Offers into Firestore...');
      const offerBatch = writeBatch(db);
      for (const offer of INITIAL_HOMEPAGE_OFFERS) {
        offerBatch.set(doc(db, 'homepageOffers', offer.id), {
          ...offer,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      await offerBatch.commit();
      console.log('Homepage offers seeded!');
    }

    // Check if products exist
    const productsSnapshot = await getDocs(collection(db, 'products'));
    if (!productsSnapshot.empty) {
      return; // Already initialized
    }

    console.log('Seeding initial Bonfire Pizzeria data into Firestore...');

    // 1. Settings
    await setDoc(doc(db, 'settings', 'restaurant'), {
      ...INITIAL_SETTINGS,
      updatedAt: serverTimestamp()
    });

    // 2. Categories
    const catBatch = writeBatch(db);
    for (const cat of INITIAL_CATEGORIES) {
      catBatch.set(doc(db, 'categories', cat.id), cat);
    }
    await catBatch.commit();

    // 3. Products
    const prodBatch = writeBatch(db);
    for (const prod of INITIAL_PRODUCTS) {
      prodBatch.set(doc(db, 'products', prod.id), {
        ...prod,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    await prodBatch.commit();

    // 4. Deals
    const dealBatch = writeBatch(db);
    for (const deal of INITIAL_DEALS) {
      dealBatch.set(doc(db, 'deals', deal.id), {
        ...deal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    await dealBatch.commit();

    // 5. Banners
    const bannerBatch = writeBatch(db);
    for (const banner of INITIAL_BANNERS) {
      bannerBatch.set(doc(db, 'banners', banner.id), banner);
    }
    await bannerBatch.commit();

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.warn('Auto-seeding check encountered non-fatal error:', error);
  }
}
