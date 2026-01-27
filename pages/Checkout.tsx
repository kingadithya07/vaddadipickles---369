import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase, PAYMENT_UPI_ID, PAYMENT_MERCHANT_NAME } from '../supabase';
import { UserProfile, Address, Coupon } from '../types';
import { Smartphone, Upload, CheckCircle, MapPin, Plus, Trash2, Phone, Tag, X, Copy } from 'lucide-react';

interface CheckoutProps {
  user: UserProfile | null;
}

export const Checkout: React.FC<CheckoutProps> = ({ user }) => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Address State
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // New Address Form
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    alternate_phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Payment State
  const [utr, setUtr] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    const { data } = await supabase.from('addresses').select('*').order('created_at', { ascending: false });
    if (data) {
      setSavedAddresses(data);
      if (data.length > 0 && !selectedAddressId) {
        // Auto select default or first
        const def = data.find(a => a.is_default);
        setSelectedAddressId(def ? def.id : data[0].id);
      } else if (data.length === 0) {
        setIsAddingNew(true);
      }
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponMessage(null);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setCouponMessage({ type: 'error', text: 'Invalid coupon code' });
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setLoading(false);
        return;
      }

      const coupon = data as Coupon;

      // Check expiry
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        setCouponMessage({ type: 'error', text: 'Coupon has expired' });
        setLoading(false);
        return;
      }

      // Check min order value
      if (cartTotal < coupon.min_order_value) {
        setCouponMessage({ type: 'error', text: `Minimum order value of ₹${coupon.min_order_value} required` });
        setLoading(false);
        return;
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = Math.round((cartTotal * coupon.discount_value) / 100);
      } else {
        discount = coupon.discount_value;
      }

      // Ensure discount doesn't exceed total
      discount = Math.min(discount, cartTotal);

      setAppliedCoupon(coupon);
      setDiscountAmount(discount);
      setCouponMessage({ type: 'success', text: `Coupon applied! You saved ₹${discount}` });

    } catch (err) {
      setCouponMessage({ type: 'error', text: 'Error applying coupon' });
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
    setCouponMessage(null);
  };

  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    try {
      const { data, error } = await supabase.from('addresses').insert({
        user_id: user.id,
        ...newAddress,
        is_default: savedAddresses.length === 0
      }).select().single();

      if (error) throw error;
      
      setSavedAddresses([data, ...savedAddresses]);
      setSelectedAddressId(data.id);
      setIsAddingNew(false);
      setNewAddress({
        name: '', phone: '', alternate_phone: '', address_line1: '', 
        address_line2: '', city: '', state: '', pincode: ''
      });
    } catch (err: any) {
      alert("Error saving address: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (!error) {
      const remaining = savedAddresses.filter(a => a.id !== id);
      setSavedAddresses(remaining);
      if (selectedAddressId === id) {
        setSelectedAddressId(remaining.length > 0 ? remaining[0].id : null);
        if (remaining.length === 0) setIsAddingNew(true);
      }
    }
  };

  // Construct UPI Deep Link
  const amountString = finalTotal.toFixed(2);
  const upiLink = `upi://pay?pa=${PAYMENT_UPI_ID}&pn=${encodeURIComponent(PAYMENT_MERCHANT_NAME)}&am=${amountString}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(PAYMENT_UPI_ID);
    // Could add a toast notification here
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!selectedAddressId) {
      alert("Please select or add a delivery address.");
      return;
    }
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
      const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId);
      if (!selectedAddr) throw new Error("Selected address not found");

      // Format address for order history snapshot
      const shippingString = `
${selectedAddr.name}
${selectedAddr.address_line1}, ${selectedAddr.address_line2 || ''}
${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.pincode}
Phone: ${selectedAddr.phone}
${selectedAddr.alternate_phone ? `Alt Phone: ${selectedAddr.alternate_phone}` : ''}
      `.trim();

      let screenshotUrl = '';
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        
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
          total_amount: finalTotal, // Use final total after discount
          status: 'pending',
          payment_method: 'upi', // Explicitly set payment method
          shipping_address: shippingString,
          utr_reference: utr,
          payment_screenshot_url: screenshotUrl,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
          discount_amount: discountAmount
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      navigate('/order/success');
    } catch (error: any) {
      alert("Error processing order: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold mb-4">Please login to continue</h2>
        <button onClick={() => navigate('/login')} className="bg-brand-600 text-white px-6 py-2 rounded">Login</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>
          
          {/* Address Section */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MapPin size={20} className="text-brand-600"/> Delivery Address
              </h2>
              {!isAddingNew && savedAddresses.length > 0 && (
                <button 
                  onClick={() => setIsAddingNew(true)}
                  className="text-sm font-bold text-brand-600 hover:bg-brand-50 px-3 py-1 rounded-full transition flex items-center gap-1"
                >
                  <Plus size={16}/> New Address
                </button>
              )}
            </div>

            {isAddingNew ? (
              <form onSubmit={handleSaveAddress} className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Recipient Name</label>
                    <input 
                      required
                      className="w-full border rounded p-2 text-sm"
                      value={newAddress.name}
                      onChange={e => setNewAddress({...newAddress, name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
                    <input 
                      required
                      className="w-full border rounded p-2 text-sm"
                      value={newAddress.phone}
                      onChange={e => setNewAddress({...newAddress, phone: e.target.value.replace(/\D/g,'')})}
                      placeholder="9999999999"
                      maxLength={10}
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">Alternate Phone (Optional)</label>
                   <input 
                     className="w-full border rounded p-2 text-sm"
                     value={newAddress.alternate_phone}
                     onChange={e => setNewAddress({...newAddress, alternate_phone: e.target.value.replace(/\D/g,'')})}
                     placeholder="8888888888"
                     maxLength={10}
                   />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Address Line 1</label>
                  <input 
                    required
                    className="w-full border rounded p-2 text-sm"
                    value={newAddress.address_line1}
                    onChange={e => setNewAddress({...newAddress, address_line1: e.target.value})}
                    placeholder="House No, Building, Street"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Address Line 2 (Optional)</label>
                  <input 
                    className="w-full border rounded p-2 text-sm"
                    value={newAddress.address_line2}
                    onChange={e => setNewAddress({...newAddress, address_line2: e.target.value})}
                    placeholder="Landmark, Area"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">City</label>
                    <input 
                      required
                      className="w-full border rounded p-2 text-sm"
                      value={newAddress.city}
                      onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">State</label>
                    <input 
                      required
                      className="w-full border rounded p-2 text-sm"
                      value={newAddress.state}
                      onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Pincode</label>
                    <input 
                      required
                      className="w-full border rounded p-2 text-sm"
                      value={newAddress.pincode}
                      onChange={e => setNewAddress({...newAddress, pincode: e.target.value.replace(/\D/g,'')})}
                      maxLength={6}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={loading} className="bg-brand-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-brand-700">Save Address</button>
                  {savedAddresses.length > 0 && (
                    <button type="button" onClick={() => setIsAddingNew(false)} className="text-gray-600 px-4 py-2 text-sm hover:underline">Cancel</button>
                  )}
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {savedAddresses.map(addr => (
                  <label 
                    key={addr.id} 
                    className={`block relative border rounded-lg p-4 cursor-pointer transition-all hover:border-brand-300
                      ${selectedAddressId === addr.id ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-gray-200'}`}
                  >
                    <div className="flex items-start gap-3">
                      <input 
                        type="radio" 
                        name="address" 
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 text-brand-600 focus:ring-brand-500"
                      />
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-gray-900">{addr.name}</span>
                          <button 
                            onClick={(e) => handleDeleteAddress(addr.id, e)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="Delete Address"
                          >
                            <Trash2 size={14}/>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {addr.address_line1}, {addr.address_line2 ? addr.address_line2 + ',' : ''} {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                          <Phone size={12}/> {addr.phone}
                          {addr.alternate_phone && <span className="text-gray-400">| Alt: {addr.alternate_phone}</span>}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            
            {/* Coupon Section */}
            <div className="mb-6 bg-brand-50 p-4 rounded-lg border border-brand-100">
               <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                 <Tag size={16} /> Have a Coupon?
               </label>
               
               {appliedCoupon ? (
                 <div className="flex justify-between items-center bg-white p-3 rounded border border-green-200">
                   <div>
                     <span className="font-bold text-green-700 block">{appliedCoupon.code}</span>
                     <span className="text-xs text-green-600">
                       {appliedCoupon.discount_type === 'percentage' 
                         ? `${appliedCoupon.discount_value}% OFF` 
                         : `₹${appliedCoupon.discount_value} OFF`} applied
                     </span>
                   </div>
                   <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500">
                     <X size={18} />
                   </button>
                 </div>
               ) : (
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     placeholder="Enter code" 
                     className="flex-grow border rounded-md px-3 py-2 text-sm uppercase"
                     value={couponCode}
                     onChange={e => setCouponCode(e.target.value)}
                   />
                   <button 
                     onClick={handleApplyCoupon}
                     disabled={!couponCode || loading}
                     className="bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-brand-700 disabled:opacity-50"
                   >
                     Apply
                   </button>
                 </div>
               )}
               {couponMessage && (
                 <p className={`text-xs mt-2 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                   {couponMessage.text}
                 </p>
               )}
            </div>

            <ul className="divide-y max-h-60 overflow-y-auto mb-4">
              {cart.map(item => (
                <li key={item.id} className="py-2 flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span className="font-medium">₹{item.price * item.quantity}</span>
                </li>
              ))}
            </ul>
            
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-gray-600">
                 <span>Subtotal</span>
                 <span>₹{cartTotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                   <span>Discount</span>
                   <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl mt-2">
                 <span>Total to Pay</span>
                 <span className="text-brand-600">₹{finalTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="bg-brand-50 p-8 rounded-2xl border border-brand-100 sticky top-24">
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
             <Smartphone className="text-brand-600"/> Payment via UPI
           </h2>

           <div className="flex flex-col items-center mb-8 bg-white p-6 rounded-xl shadow-sm w-full">
             <img src={qrCodeUrl} alt="UPI QR" className="w-48 h-48 mb-4 border p-2 rounded shadow-inner" />
             <div className="text-center w-full">
               <p className="text-sm text-gray-500 mb-2">Scan with any UPI App</p>
               <div className="flex justify-center items-center gap-2 bg-gray-100 p-2 rounded-lg mb-4">
                 <p className="font-mono font-bold text-lg text-gray-800 break-all">{PAYMENT_UPI_ID}</p>
                 <button 
                   onClick={copyUpiId}
                   className="text-gray-500 hover:text-brand-600 p-1 transition"
                   title="Copy UPI ID"
                 >
                   <Copy size={18} />
                 </button>
               </div>
             </div>
             <a 
               href={upiLink} 
               className="md:hidden w-full bg-brand-600 text-white px-6 py-3 rounded-full font-bold text-center shadow-lg active:scale-95 transition"
             >
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
                 className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none font-mono text-lg tracking-widest"
                 value={utr}
                 onChange={e => setUtr(e.target.value.replace(/\D/g,''))} // Only numbers
                 autoComplete="off"
                 required
               />
               <p className="text-xs text-gray-500 mt-1">Found in your payment app (GooglePay/PhonePe/Paytm) details.</p>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Payment Screenshot (Optional)
               </label>
               <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-brand-400 transition cursor-pointer relative bg-white group">
                 <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                 />
                 <div className="flex flex-col items-center text-gray-500 group-hover:text-brand-500 transition">
                   {file ? (
                     <>
                       <CheckCircle className="text-green-500 mb-2" size={32} />
                       <span className="text-sm text-gray-900 font-medium truncate max-w-full px-2">{file.name}</span>
                     </>
                   ) : (
                     <>
                       <Upload className="mb-2" size={32} />
                       <span className="text-sm">Click to upload screenshot</span>
                     </>
                   )}
                 </div>
               </div>
             </div>

             <div className="mt-4">
               <label className="flex items-start gap-2 text-sm cursor-pointer">
                 <input
                   type="checkbox"
                   required
                   className="mt-1 w-4 h-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                   checked={agreed}
                   onChange={e => setAgreed(e.target.checked)}
                 />
                 <span className="text-gray-600">
                   I agree to the{" "}
                   <a href="/terms-conditions" className="text-brand-600 underline hover:text-brand-800" target="_blank" rel="noreferrer">
                     Terms & Conditions
                   </a>{" "}
                   and{" "}
                   <a href="/refund-policy" className="text-brand-600 underline hover:text-brand-800" target="_blank" rel="noreferrer">
                     Refund Policy
                   </a>
                 </span>
               </label>
             </div>

             <button 
               type="submit" 
               disabled={loading || !selectedAddressId || utr.length !== 12 || !agreed}
               className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition transform active:scale-95
                 ${loading || !selectedAddressId || utr.length !== 12 || !agreed
                   ? 'bg-gray-400 cursor-not-allowed' 
                   : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'}`}
             >
               {loading ? 'Processing...' : `Confirm Order ₹${finalTotal}`}
             </button>
           </form>
        </div>
      </div>
    </div>
  );
};