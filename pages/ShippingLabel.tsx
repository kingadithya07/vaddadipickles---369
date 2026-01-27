import React, { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { Order, UserProfile } from '../types';
import { Printer, ArrowLeft } from 'lucide-react';

export const ShippingLabel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setCurrentUser(profile);

      if (id) {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
        
        if (!error && data) {
          setOrder(data as any);
        }
      }
      setLoading(false);
    };

    fetchOrder();
  }, [id]);

  // Auto-print effect
  useEffect(() => {
    if (!loading && order && currentUser?.role === 'admin') {
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, order, currentUser]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center">Loading Label...</div>;
  if (!order) return <div className="p-8 text-center">Order not found.</div>;

  // Permission check: Only Admin
  if (currentUser?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  // Determine Payment Label
  const isPaid = ['approved', 'shipped', 'delivered'].includes(order.status);
  const isCancelled = order.status === 'cancelled';
  const paymentType = order.payment_method === 'cod' ? 'COD' : 'PREPAID';

  return (
    <main className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4 print:bg-white print:p-0 print:block">
      {/* Navigation & Print Button */}
      <div className="w-full max-w-[384px] flex justify-between items-center mb-6 print:hidden">
        <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-black">
          <ArrowLeft size={20} /> Back
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          <Printer size={18} /> Print Label
        </button>
      </div>

      {/* LABEL CONTAINER (4x6 inch approx) */}
      <div 
        className="bg-white border-2 border-black w-[384px] h-[576px] p-6 text-black shadow-lg print:shadow-none print:border-0 print:w-full print:h-full print:p-0 flex flex-col"
        style={{ boxSizing: 'border-box' }}
      >
        {/* Sender */}
        <div className="border-b-2 border-black pb-4 mb-4">
          <h1 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">FROM:</h1>
          <div className="text-sm">
            <strong className="text-lg block">Vaddadi Pickles</strong>
            <p>Homemade Pickles & Food Products</p>
            <p>📞 +91-8008129309</p>
          </div>
        </div>

        {/* Receiver */}
        <div className="border-b-2 border-black pb-4 mb-4 flex-grow">
          <h1 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">TO:</h1>
          <div className="text-base whitespace-pre-line leading-relaxed font-medium">
            {order.shipping_address}
          </div>
        </div>

        {/* Order Info */}
        <div className="border-b-2 border-black pb-4 mb-4 text-sm grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase">Order ID</p>
            <p className="font-mono font-bold">VP-{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase">Date</p>
            <p className="font-bold">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        {/* Payment Type */}
        <div className="text-center border-4 border-black py-4 mb-4">
          <p className="text-2xl font-black tracking-widest uppercase">{paymentType}</p>
          
          {paymentType === 'PREPAID' && isPaid && (
              <p className="text-xs font-bold uppercase mt-1">(UPI Verified)</p>
          )}

          {paymentType === 'PREPAID' && !isPaid && !isCancelled && (
              <p className="text-xs font-bold uppercase mt-1 text-red-600">Payment Pending</p>
          )}

          {isCancelled && (
             <p className="text-xs font-bold uppercase mt-1 text-red-600">(CANCELLED)</p>
          )}
        </div>

        {/* Handling Instructions */}
        <div className="mt-auto pt-2 text-xs font-bold flex justify-between">
          <p>⚠️ Perishable</p>
          <p>🚫 Do Not Tamper</p>
          <p>📦 Handle With Care</p>
        </div>
      </div>
      
      <div className="mt-8 text-gray-500 text-sm print:hidden">
        * Recommended Paper Size: 4x6 inch
      </div>
    </main>
  );
};