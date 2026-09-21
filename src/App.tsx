import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { HomeSections } from './components/HomeSections';
import { MenuView } from './components/MenuView';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutView } from './components/CheckoutView';
import { OrderTrackingView } from './components/OrderTrackingView';
import { CustomerAccountView } from './components/CustomerAccountView';
import { AdminDashboard } from './components/AdminDashboard';
import { AboutContactViews } from './components/AboutContactViews';
import { Footer } from './components/Footer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { AuthModal } from './components/AuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Product } from './types';

type ActivePage = 'home' | 'menu' | 'deals' | 'about' | 'contact' | 'checkout' | 'account' | 'admin' | 'tracking';

function MainAppContent() {
  const [activeView, setActiveView] = useState<ActivePage>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | undefined>(undefined);
  const { setIsCartOpen } = useCart();

  const handleNavigate = (view: ActivePage) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (orderId: string) => {
    setActiveTrackingOrderId(orderId);
    setActiveView('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackSpecificOrder = (orderId: string) => {
    setActiveTrackingOrderId(orderId);
    setActiveView('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in admin mode, show full admin dashboard
  if (activeView === 'admin') {
    return (
      <AdminDashboard onBackToCustomerSite={() => handleNavigate('home')} />
    );
  }

  return (
    <div className="w-full max-w-full min-w-0 min-h-screen bg-[#0c0c0e] text-[#f4f4f5] flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar 
        onNavigate={handleNavigate} 
        activeView={activeView}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="w-full max-w-full min-w-0 flex-1 pb-16 md:pb-0">
        {activeView === 'home' && (
          <HomeSections
            onSelectProduct={(p) => setSelectedProduct(p)}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'menu' && (
          <MenuView onSelectProduct={(p) => setSelectedProduct(p)} />
        )}

        {activeView === 'deals' && (
          <div className="pt-4">
            <MenuView onSelectProduct={(p) => setSelectedProduct(p)} />
          </div>
        )}

        {activeView === 'checkout' && (
          <CheckoutView
            onBackToMenu={() => handleNavigate('menu')}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {activeView === 'tracking' && (
          <OrderTrackingView
            initialOrderId={activeTrackingOrderId}
            onBackToMenu={() => handleNavigate('menu')}
          />
        )}

        {activeView === 'account' && (
          <CustomerAccountView
            onTrackOrder={handleTrackSpecificOrder}
            onBrowseMenu={() => handleNavigate('menu')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {(activeView === 'about' || activeView === 'contact') && (
          <AboutContactViews
            view={activeView}
            onOrderNow={() => handleNavigate('menu')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Floating WhatsApp Action Button */}
      <WhatsAppFloatingButton />

      {/* Mobile Bottom Bar for touch navigation */}
      <MobileBottomNav
        activeView={activeView}
        onNavigate={(v) => handleNavigate(v)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Modals & Drawers */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer
        onCheckout={() => handleNavigate('checkout')}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAdminLoginSuccess={() => handleNavigate('admin')}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <RestaurantProvider>
            <MainAppContent />
          </RestaurantProvider>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
