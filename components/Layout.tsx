import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, User, LogOut, Package, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabase';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile | null;
}

export const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900">
      <nav className="bg-brand-700 text-white sticky top-0 z-50 shadow-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-32 items-center">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-4 group">
                <img 
                  src="https://i.ibb.co/vxZ4c3sw/Whats-App-Image-2026-01-23-at-20-42-40.jpg" 
                  alt="Vaddadi Pickles Logo" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-lg group-hover:scale-105 transition-transform duration-300"
                />
                <span className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">Vaddadi Pickles</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="hover:text-brand-100 font-bold text-lg">Home</Link>
              <Link to="/shop" className="hover:text-brand-100 font-bold text-lg">Shop</Link>
              {user && <Link to="/orders" className="hover:text-brand-100 font-bold text-lg">My Orders</Link>}
              {user?.role === 'admin' && (
                <Link to="/admin" className="hover:text-brand-100 font-bold flex items-center gap-1 text-lg">
                  <ShieldCheck size={20} /> Admin
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-6">
              <Link to="/cart" className="relative p-2 hover:bg-brand-600 rounded-full transition">
                <ShoppingCart size={32} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-brand-700 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 hover:text-brand-100">
                    <User size={32} />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white text-neutral-800 rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-100">
                    <div className="px-4 py-2 border-b text-sm font-semibold text-gray-500">{user.email}</div>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100 flex items-center gap-2"><Package size={16}/> Orders</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 flex items-center gap-2">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="hover:text-brand-100 font-bold text-lg">Login</Link>
              )}
              
              <button 
                className="md:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu size={32} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-brand-800 pb-4">
             <Link to="/" className="block px-4 py-3 hover:bg-brand-700 text-xl font-medium" onClick={() => setIsMenuOpen(false)}>Home</Link>
             <Link to="/shop" className="block px-4 py-3 hover:bg-brand-700 text-xl font-medium" onClick={() => setIsMenuOpen(false)}>Shop</Link>
             {user && <Link to="/orders" className="block px-4 py-3 hover:bg-brand-700 text-xl font-medium" onClick={() => setIsMenuOpen(false)}>My Orders</Link>}
             {user?.role === 'admin' && <Link to="/admin" className="block px-4 py-3 hover:bg-brand-700 text-xl font-medium" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>}
             {!user && <Link to="/login" className="block px-4 py-3 hover:bg-brand-700 text-xl font-medium" onClick={() => setIsMenuOpen(false)}>Login</Link>}
          </div>
        )}
      </nav>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="text-sm text-center py-6 text-neutral-500 border-t border-neutral-200 mt-auto">
        <div className="mb-2">
          <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link> ·{' '}
          <Link to="/terms-conditions" className="hover:underline">Terms</Link> ·{' '}
          <Link to="/refund-policy" className="hover:underline">Refund Policy</Link>
        </div>
        <div>
          &copy; {new Date().getFullYear()} Vaddadi Pickles. All rights reserved.
        </div>
      </footer>
    </div>
  );
};