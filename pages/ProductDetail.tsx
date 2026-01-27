import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ChevronLeft, Minus, Plus, ShoppingBag } from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) setProduct(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      // Add quantity times
      for(let i=0; i<quantity; i++) addToCart(product);
    }
  };

  if (loading) return <div className="animate-pulse bg-gray-100 h-96 rounded-2xl"></div>;
  if (!product) return <div className="text-center py-12">Product not found</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/shop" className="inline-flex items-center text-gray-500 hover:text-brand-600 mb-6">
        <ChevronLeft size={20} /> Back to Shop
      </Link>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="h-96 md:h-[600px] bg-gray-100">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="text-sm font-bold text-brand-600 uppercase tracking-wide mb-2">{product.category}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-2xl font-bold text-gray-900 mb-6">₹{product.price}</p>
            
            <div className="prose text-gray-600 mb-8">
              <p>{product.description}</p>
              <ul className="list-disc pl-5 mt-4 space-y-2 text-sm">
                <li>Homemade Recipe</li>
                <li>No Artificial Preservatives</li>
                <li>Shelf Life: 6 Months</li>
                <li>Made in Small Batches</li>
              </ul>
            </div>

            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
               <div className="flex items-center border border-gray-300 rounded-lg">
                 <button 
                   onClick={() => setQuantity(q => Math.max(1, q-1))}
                   className="p-3 hover:bg-gray-50 text-gray-600"
                 >
                   <Minus size={18} />
                 </button>
                 <span className="w-12 text-center font-medium">{quantity}</span>
                 <button 
                   onClick={() => setQuantity(q => q+1)}
                   className="p-3 hover:bg-gray-50 text-gray-600"
                 >
                   <Plus size={18} />
                 </button>
               </div>
               
               <button 
                 onClick={handleAddToCart}
                 disabled={product.stock <= 0}
                 className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold text-lg transition
                   ${product.stock > 0 
                     ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-600/30' 
                     : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
               >
                 <ShoppingBag size={20} />
                 {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
               </button>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Availability: <span className={product.stock > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};