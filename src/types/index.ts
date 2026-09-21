export type OrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  addresses?: Array<{
    id: string;
    label: string;
    address: string;
    area: string;
    isDefault?: boolean;
  }>;
  createdAt?: any;
  updatedAt?: any;
}

export interface ProductAddon {
  id: string;
  name: string;
  price: number;
}

export interface ProductSizeOption {
  size: 'Small' | 'Medium' | 'Large' | 'Single';
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  singlePrice?: number;
  smallPrice?: number;
  mediumPrice?: number;
  largePrice?: number;
  availableSizes: Array<'Small' | 'Medium' | 'Large' | 'Single'>;
  addons?: ProductAddon[];
  featured?: boolean;
  bestseller?: boolean;
  active: boolean;
  rating?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface Deal {
  id: string;
  name: string;
  description: string;
  image: string;
  includedItems: string[];
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  featured?: boolean;
  active: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  order: number;
  active: boolean;
}

export interface HomepageBanner {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  order: number;
  active: boolean;
}

export interface HomepageOffer {
  id: string;
  title: string;
  description: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  fallbackImageUrl?: string;
  ctaText: string;
  ctaLink: string;
  promoCode?: string;
  displayOrder: number;
  active: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: any;
  updatedAt?: any;
}

export interface HeroConfig {
  headline: string;
  subheadline: string;
  heroImage: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText: string;
  secondaryBtnLink: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  size?: number;
  category?: string;
  createdAt?: any;
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  logo: string;
  phone: string;
  whatsapp: string;
  openingTime: string;
  closingTime: string;
  minimumOrder: number;
  deliveryFee: number;
  freeDeliveryThreshold?: number;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  address: string;
  city: string;
  googleMapsLink: string;
  hero?: HeroConfig;
  socials: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
}

export interface CartItem {
  id: string; // unique item uuid (product + options)
  productId: string;
  name: string;
  image: string;
  selectedSize?: 'Small' | 'Medium' | 'Large' | 'Single';
  selectedAddons?: ProductAddon[];
  itemPrice: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id?: string;
  orderId: string;
  customerId: string;
  customerName: string;
  phone: string;
  email: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  area: string;
  orderType: 'Delivery' | 'Pickup';
  paymentMethod: 'Cash on Delivery' | 'Pay at Pickup';
  notes?: string;
  status: OrderStatus;
  createdAt: any;
  updatedAt: any;
}
