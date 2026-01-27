import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Order, UserProfile } from '../types';
import { Printer, ArrowLeft } from 'lucide-react';

export const BulkLabels: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       if (!session) return;
       
       const { data: profile } = await supabase
         .from('profiles')
         .select('*')
         .eq('id', session.user.id)
         .single();
       
       setCurrentUser(profile);

       // Fetch only approved orders for bulk printing
       // You might want to filter by 'approved' specifically, or include 'shipped' if re-printing
       const { data } = await supabase
         .from('orders')
         .select('*')
         .eq('status', 'approved')
         .order('created_at', { ascending: false });
       
       if (data) setOrders(data as any);
       setLoading(false);
    };
    fetchOrders();
  }, []);

  const handlePrint = () => window.print();

  if (loading) return <div className="p-8 text-center">Loading Bulk Labels...</div>;
  if (currentUser?.role !== 'admin') return <Navigate to="/" />;

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-800">No Approved Orders to Print</h2>
        <p className="text-gray-600 mb-6">Only orders with "Approved" status appear here.</p>
        <Link to="/admin" className="text-brand-600 hover:underline flex items-center justify-center gap-2">
           <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <main className="bg-gray-100 min-h-screen p-8 print:bg-white print:p-0 print:m-0">
       <div className="flex flex-col md:flex-row justify-between items-center mb-8 max-w-6xl mx-auto print:hidden gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-black">
               <ArrowLeft size={20} /> Back
            </Link>
            <h1 className="text-2xl font-bold">Bulk Shipping Labels</h1>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
            <span className="font-bold text-brand-600 px-2">{orders.length} Approved Orders</span>
            <button 
              onClick={handlePrint} 
              className="bg-black text-white px-6 py-2 rounded font-bold flex items-center gap-2 hover:bg-gray-800 transition shadow-lg"
            >
               <Printer size={18} /> Print All Labels
            </button>
          </div>
       </div>

       {/* Grid Layout for A4 Printing (2 Cols) */}
       <div className="max-w-[210mm] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4 print:w-full">
         {orders.map(order => {
           const paymentType = order.payment_method === 'cod' ? 'COD' : 'PREPAID';
           
           return (
             <div key={order.id} className="flex justify-center break-inside-avoid page-break-after-auto mb-4">
               {/* Label Design (Matches ShippingLabel.tsx) */}
               <div 
                  className="bg-white border-2 border-black w-[384px] h-[576px] p-6 text-black shadow-lg print:shadow-none print:border-2 flex flex-col relative"
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
                    {paymentType === 'PREPAID' && (
                       <p className="text-xs font-bold uppercase mt-1">(UPI Verified)</p>
                    )}
                  </div>

                  {/* Handling Instructions */}
                  <div className="mt-auto pt-2 text-xs font-bold flex justify-between">
                    <p>⚠️ Perishable</p>
                    <p>🚫 Do Not Tamper</p>
                    <p>📦 Handle With Care</p>
                  </div>
                </div>
             </div>
           );
         })}
       </div>
       
       <div className="text-center mt-8 text-gray-500 text-sm print:hidden">
         Tip: Set paper size to <strong>A4</strong> in print settings. Ensure 'Background graphics' is enabled if needed.
       </div>
    </main>
  );
};