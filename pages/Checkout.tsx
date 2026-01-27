import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase, PAYMENT_UPI_ID, PAYMENT_MERCHANT_NAME } from '../supabase';
import { UserProfile } from '../types';
import { Smartphone, Upload, CheckCircle } from 'lucide-react';

interface CheckoutProps {
  user: UserProfile | null;
}

export const Checkout: React.FC<CheckoutProps> = ({ user }) => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [utr, setUtr] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);

  // If no user, simple redirect to login or show notice
  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold mb-4">Please login to continue</h2>
        <button onClick={() => navigate('/login')} className="bg-brand-600 text-white px-6 py-2 rounded">Login</button>
      </div>
    );
  }

  // Construct UPI Deep Link
  // pn = Payee Name, pa = Payee Address (VPA), am = Amount, cu = Currency
  const upiLink = `upi://pay?pa=${PAYMENT_UPI_ID}&pn=${encodeURIComponent(PAYMENT_MERCHANT_NAME)}&am=${cartTotal}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr || utr.length !== 12 || isNaN(Number(utr))) {
      alert("Please enter a valid 12-digit UTR/Reference ID.");
      return;
    }
    if (!agreed) {
      alert("Please agree to the Terms & Conditions.");
      return;
    }

    setLoading(true);

    try {
      let screenshotUrl = '';
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(fileName);
          
        screenshotUrl = publicUrl;
      }

      // Create Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: cartTotal,
          status: 'pending',
          shipping_address: address,
          utr_reference: utr,
          payment_screenshot_url: screenshotUrl
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create Order Items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      navigate('/orders');
    } catch (error: any) {
      alert("Error processing order: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
      <div>
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
          <textarea 
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
            rows={3}
            placeholder="Enter your full address with pincode..."
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
          />
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Review Items</h2>
          <ul className="divide-y">
            {cart.map(item => (
              <li key={item.id} className="py-2 flex justify-between text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="border-t mt-4 pt-4 flex justify-between font-bold text-xl">
             <span>Total to Pay</span>
             <span className="text-brand-600">₹{cartTotal}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="bg-brand-50 p-8 rounded-2xl border border-brand-100">
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
             <Smartphone className="text-brand-600"/> Payment via UPI
           </h2>

           <div className="flex flex-col items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
             <img src={qrCodeUrl} alt="UPI QR" className="w-48 h-48 mb-4 border p-2 rounded" />
             <div className="text-center">
               <p className="text-sm text-gray-500 mb-1">Scan with any UPI App</p>
               <p className="font-mono font-bold text-lg">{PAYMENT_UPI_ID}</p>
             </div>
             <a href={upiLink} className="mt-4 md:hidden bg-brand-600 text-white px-6 py-2 rounded-full font-bold">
               Tap to Pay on Mobile
             </a>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 UTR / Reference ID <span className="text-red-500">*</span>
               </label>
               <input 
                 type="text" 
                 pattern="\d{12}"
                 maxLength={12}
                 placeholder="Enter 12-digit UPI Reference ID"
                 className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none font-mono"
                 value={utr}
                 onChange={e => setUtr(e.target.value.replace(/\D/g,''))} // Only numbers
                 autoComplete="off"
                 required
               />
               <p className="text-xs text-gray-500 mt-1">Found in your payment app under transaction details.</p>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Payment Screenshot (Optional)
               </label>
               <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-brand-400 transition cursor-pointer relative bg-white">
                 <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
                 <div className="flex flex-col items-center text-gray-500">
                   {file ? (
                     <>
                       <CheckCircle className="text-green-500 mb-2" />
                       <span className="text-sm text-gray-900 font-medium truncate max-w-full px-2">{file.name}</span>
                     </>
                   ) : (
                     <>
                       <Upload className="mb-2" />
                       <span className="text-sm">Click to upload screenshot</span>
                     </>
                   )}
                 </div>
               </div>
             </div>

             <div className="mt-4">
               <label className="flex items-start gap-2 text-sm">
                 <input
                   type="checkbox"
                   required
                   className="mt-1"
                   checked={agreed}
                   onChange={e => setAgreed(e.target.checked)}
                 />
                 <span>
                   I agree to the{" "}
                   <a href="/terms-conditions" className="text-blue-600 underline" target="_blank" rel="noreferrer">
                     Terms & Conditions
                   </a>{" "}
                   and{" "}
                   <a href="/refund-policy" className="text-blue-600 underline" target="_blank" rel="noreferrer">
                     Refund Policy
                   </a>
                 </span>
               </label>
             </div>

             <button 
               type="submit" 
               disabled={loading || !address || utr.length !== 12 || !agreed}
               className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition
                 ${loading || !address || utr.length !== 12 || !agreed
                   ? 'bg-gray-400 cursor-not-allowed' 
                   : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'}`}
             >
               {loading ? 'Processing...' : `Confirm Order ₹${cartTotal}`}
             </button>
           </form>
        </div>
      </div>
    </div>
  );
};