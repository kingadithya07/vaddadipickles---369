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
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
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

    const { data: { session } } = await supabase.auth.getSession();

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    // Fallback if profile doesn't exist yet (triggers usually handle this, but for safety)
    if (data) {
      setUser(data);
    } else {
       // Temporary mock for new users using session email
       setUser({ 
         id: userId, 
         email: session?.user?.email || '', 
         role: 'customer' 
       });
    }
    setLoading(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-brand-600">Loading Vaddadi Pickles...</div>;

  return (
    <CartProvider>
      <HashRouter>
        <Layout user={user}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            
            {/* Protected Routes */}
            <Route path="/checkout" element={user ? <Checkout user={user} /> : <Navigate to="/login" />} />
            <Route path="/orders" element={user ? <Orders user={user} /> : <Navigate to="/login" />} />
            
            {/* Admin Route */}
            <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
            
            {/* Legal Pages */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
          </Routes>
        </Layout>
      </HashRouter>
    </CartProvider>
  );
};

export default App;