
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Star, Package, ShieldCheck, AlertTriangle } from 'lucide-react';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(4);
        
        if (error) throw error;
        
        if (data) {
          setFeaturedProducts(data);
        }
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to load products. Make sure you have run the database schema.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-brand-900 text-white min-h-[400px] flex items-center">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1621996659556-22441c9ecb3c?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="Spices"
        />
        <div className="relative z-20 max-w-2xl px-8 md:px-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Taste the Tradition of <span className="text-brand-400">Andhra</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-lg">
            Handcrafted pickles made with authentic family recipes. No preservatives, just pure love and spices.
          </p>
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-full font-bold transition shadow-lg shadow-brand-900/50"
          >
            Shop Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Explore by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Mango', img: 'https://images.unsplash.com/photo-1616645258469-ec681c17f3ee?auto=format&fit=crop&q=80&w=400' },
            { name: 'Lemon', img: 'https://images.unsplash.com/photo-1599307767316-77f8646b2b41?auto=format&fit=crop&q=80&w=400' },
            { name: 'Tomato', img: 'https://images.unsplash.com/photo-1606923829579-0cb9d46a6db5?auto=format&fit=crop&q=80&w=400' },
            { name: 'Gongura', img: 'https://images.unsplash.com/photo-1589135233689-d53f6804a37f?auto=format&fit=crop&q=80&w=400' }
          ].map((cat) => (
            <Link 
              key={cat.name} 
              to={`/shop?cat=${cat.name.toLowerCase()}`}
              className="group relative h-32 rounded-xl overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition z-10"></div>
              <img 
                src={cat.img} 
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <span className="text-white font-bold text-xl">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Best Sellers</h2>
          <Link to="/shop" className="text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1">
            View All <ArrowRight size={16}/>
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-orange-50 border border-orange-200 p-8 rounded-2xl text-center">
            <AlertTriangle className="mx-auto text-orange-500 mb-4" size={48} />
            <p className="text-orange-900 font-semibold mb-2">Connection Issue</p>
            <p className="text-orange-700 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section className="bg-brand-50 rounded-2xl p-8 grid md:grid-cols-3 gap-8 text-center">
        <div>
          <div className="bg-brand-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
             <Star size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">Premium Quality</h3>
          <p className="text-gray-600 text-sm">Made with hand-picked ingredients and traditional methods.</p>
        </div>
        <div>
          <div className="bg-brand-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
             <Package size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">Secure Packaging</h3>
          <p className="text-gray-600 text-sm">Leak-proof packaging ensuring freshness upon delivery.</p>
        </div>
        <div>
          <div className="bg-brand-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
             <ShieldCheck size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">100% Authentic</h3>
          <p className="text-gray-600 text-sm">No artificial colors or preservatives added.</p>
        </div>
      </section>
    </div>
  );
};
