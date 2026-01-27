import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Filter } from 'lucide-react';

export const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('cat');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from('products').select('*');
      
      if (activeCategory) {
        query = query.ilike('category', `%${activeCategory}%`);
      }
      
      const { data, error } = await query;
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [activeCategory]);

  const categories = ['All', 'Mango', 'Lemon', 'Tomato', 'Gongura', 'Chili'];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {activeCategory ? `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Pickles` : 'All Products'}
        </h1>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          <Filter size={20} className="text-gray-400 mr-2 flex-shrink-0" />
          {categories.map(cat => (
             <button
               key={cat}
               onClick={() => {
                 if (cat === 'All') setSearchParams({});
                 else setSearchParams({ cat: cat.toLowerCase() });
               }}
               className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition
                 ${(cat === 'All' && !activeCategory) || (activeCategory?.toLowerCase() === cat.toLowerCase())
                   ? 'bg-brand-600 text-white shadow-md'
                   : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
             >
               {cat}
             </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No pickles found in this category.</p>
          <button onClick={() => setSearchParams({})} className="mt-4 text-brand-600 font-semibold hover:underline">
            View all products
          </button>
        </div>
      )}
    </div>
  );
};
