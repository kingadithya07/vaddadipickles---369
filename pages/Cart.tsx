import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-4">
        <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={40} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any delicious pickles yet.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition">
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4 items-center">
              <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
              <div className="flex-grow">
                <Link to={`/product/${item.id}`} className="font-bold text-gray-900 hover:text-brand-600 block mb-1">
                  {item.name}
                </Link>
                <div className="text-brand-600 font-medium">₹{item.price}</div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-md">
                   <button 
                     onClick={() => updateQuantity(item.id, item.quantity - 1)}
                     className="p-1 hover:bg-gray-100 text-gray-600"
                     disabled={item.quantity <= 1}
                   >
                     <Minus size={14} />
                   </button>
                   <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                   <button 
                     onClick={() => updateQuantity(item.id, item.quantity + 1)}
                     className="p-1 hover:bg-gray-100 text-gray-600"
                   >
                     <Plus size={14} />
                   </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear Cart</button>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
            </div>
            <div className="border-t pt-4 mb-6 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition flex items-center justify-center gap-2"
            >
              Checkout <ShieldCheck size={18} />
            </button>
            <p className="text-xs text-gray-400 text-center mt-4">
              Secure UPI Payments supported.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};