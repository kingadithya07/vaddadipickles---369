import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { OrderSuccess } from './pages/OrderSuccess';
import { PaymentStatus } from './pages/PaymentStatus';
import { OrderInvoice } from './pages/OrderInvoice';
import { ShippingLabel } from './pages/ShippingLabel';
import { BulkLabels } from './pages/BulkLabels';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { AuthSuccess } from './pages/AuthSuccess';
import { PasswordChanged } from './pages/PasswordChanged';
import { ForgotPassword } from './pages/ForgotPassword';
import { UpdatePassword } from './pages/UpdatePassword';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { RefundPolicy } from './pages/RefundPolicy';
import { TermsConditions } from './pages/TermsConditions';
import { supabase } from './supabase';
import { UserProfile } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session?.user?.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId?: string) => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) {
      setUser(data);
    } else {
       // Profile might not exist yet if trigger hasn't finished
       const { data: { session } } = await supabase.auth.getSession();
       setUser({ 
         id: userId, 
         email: session?.user?.email || '', 
         role: 'customer' 
       });
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-brand-600 font-bold">Loading Vaddadi Pickles...</p>
      </div>
    </div>
  );

  return (
    <CartProvider>
      <HashRouter>
        <Layout user={user}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/auth/password-changed" element={<PasswordChanged />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            
            {/* Protected Routes */}
            <Route path="/checkout" element={user ? <Checkout user={user} /> : <Navigate to="/login" replace />} />
            <Route path="/order/success" element={user ? <OrderSuccess /> : <Navigate to="/login" replace />} />
            <Route path="/payment/status" element={user ? <PaymentStatus /> : <Navigate to="/login" replace />} />
            <Route path="/orders" element={user ? <Orders user={user} /> : <Navigate to="/login" replace />} />
            <Route path="/order/:id/invoice" element={user ? <OrderInvoice /> : <Navigate to="/login" replace />} />
            <Route path="/order/:id/label" element={user?.role === 'admin' ? <ShippingLabel /> : <Navigate to="/" replace />} />
            <Route path="/admin/bulk-labels" element={user?.role === 'admin' ? <BulkLabels /> : <Navigate to="/" replace />} />
            
            {/* Admin Route */}
            <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} />
            
            {/* Legal Pages */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </CartProvider>
  );
};

export default App;