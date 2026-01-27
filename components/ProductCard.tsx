import React from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="block h-48 overflow-hidden bg-gray-100">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition duration-500"
          loading="lazy"
        />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-1">{product.category}</div>
        <Link to={`/product/${product.id}`} className="text-lg font-bold text-gray-900 mb-2 hover:text-brand-600 line-clamp-2">
          {product.name}
        </Link>
        <div className="flex-grow">
          <p className="text-gray-500 text-sm line-clamp-2">{product.description}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
          <button 
            onClick={() => addToCart(product)}
            disabled={product.stock <= 0}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition
              ${product.stock > 0 
                ? 'bg-brand-50 text-brand-700 hover:bg-brand-100' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            <Plus size={16} /> {product.stock > 0 ? 'Add' : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  );
};
