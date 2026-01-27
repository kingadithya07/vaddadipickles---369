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
      <nav className="bg-brand-700 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <span className="text-3xl">🥭</span> Vaddadi Pickles
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="hover:text-brand-100 font-medium">Home</Link>
              <Link to="/shop" className="hover:text-brand-100 font-medium">Shop</Link>
              {user && <Link to="/orders" className="hover:text-brand-100 font-medium">My Orders</Link>}
              {user?.role === 'admin' && (
                <Link to="/admin" className="hover:text-brand-100 font-medium flex items-center gap-1">
                  <ShieldCheck size={18} /> Admin
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/cart" className="relative p-2 hover:bg-brand-600 rounded-full transition">
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-brand-700 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 hover:text-brand-100">
                    <User size={24} />
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
                <Link to="/login" className="hover:text-brand-100 font-medium">Login</Link>
              )}
              
              <button 
                className="md:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-brand-800 pb-4">
             <Link to="/" className="block px-4 py-2 hover:bg-brand-700" onClick={() => setIsMenuOpen(false)}>Home</Link>
             <Link to="/shop" className="block px-4 py-2 hover:bg-brand-700" onClick={() => setIsMenuOpen(false)}>Shop</Link>
             {user && <Link to="/orders" className="block px-4 py-2 hover:bg-brand-700" onClick={() => setIsMenuOpen(false)}>My Orders</Link>}
             {user?.role === 'admin' && <Link to="/admin" className="block px-4 py-2 hover:bg-brand-700" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>}
             {!user && <Link to="/login" className="block px-4 py-2 hover:bg-brand-700" onClick={() => setIsMenuOpen(false)}>Login</Link>}
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