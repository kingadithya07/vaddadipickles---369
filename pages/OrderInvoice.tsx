import React, { useEffect, useState, useRef } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { Order, UserProfile } from '../types';
import { ArrowLeft, Printer } from 'lucide-react';

export const OrderInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch user profile to check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      setCurrentUser(profile);

      if (id) {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            items:order_items (
              quantity,
              price,
              product:products (name)
            )
          `)
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center">Loading Invoice...</div>;

  if (!order) return <div className="p-8 text-center">Order not found.</div>;

  // Permission check
  if (currentUser?.role !== 'admin' && currentUser?.id !== order.user_id) {
    return <Navigate to="/" />;
  }

  // Calculate subtotal
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <main className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-3xl mx-auto">
        {/* Navigation & Print Button */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link to={currentUser?.role === 'admin' ? "/admin" : "/orders"} className="flex items-center gap-2 text-gray-600 hover:text-black">
            <ArrowLeft size={20} /> Back
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            <Printer size={18} /> Print Invoice
          </button>
        </div>

        {/* INVOICE */}
        <div className="bg-white p-8 rounded-lg shadow-sm print:shadow-none print:p-0" id="printable-area">

          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vaddadi Pickles</h1>
              <p className="text-sm text-gray-600 mt-1">
                Homemade Pickles & Food Products
              </p>
              <p className="text-sm text-gray-600">
                📞 +91-8008129309
              </p>
              <p className="text-sm text-gray-600">
                ✉️ vvrsadithya@gmail.com
              </p>
            </div>

            <div className="text-right text-sm">
              <p className="mb-1"><strong className="text-gray-900">Invoice #</strong> <span className="font-mono">VP-{order.id.slice(0, 8).toUpperCase()}</span></p>
              <p className="mb-1"><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString('en-IN')}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`capitalize ${
                  order.status === 'approved' || order.status === 'delivered' ? 'text-green-600' : 
                  order.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {order.status.replace('_', ' ')}
                </span>
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-8">
            <h2 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-wider">Shipping Address</h2>
            <div className="text-sm text-gray-700 whitespace-pre-line border rounded-lg p-4 bg-gray-50">
              {order.shipping_address}
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h2 className="font-bold text-gray-900 mb-3 uppercase text-xs tracking-wider">Order Summary</h2>

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100 text-gray-500">
                  <th className="text-left py-3 font-semibold">Item</th>
                  <th className="text-center py-3 font-semibold">Qty</th>
                  <th className="text-right py-3 font-semibold">Price</th>
                  <th className="text-right py-3 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 text-gray-900">{item.product_name}</td>
                    <td className="text-center py-3 text-gray-600">{item.quantity}</td>
                    <td className="text-right py-3 text-gray-600">₹{item.price}</td>
                    <td className="text-right py-3 font-medium text-gray-900">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 text-gray-600">Subtotal</td>
                    <td className="py-1 text-right font-medium">₹{subtotal}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-600">Shipping</td>
                    <td className="py-1 text-right text-green-600">Free</td>
                  </tr>
                  {order.discount_amount && order.discount_amount > 0 && (
                    <tr>
                      <td className="py-1 text-green-600">Discount ({order.coupon_code})</td>
                      <td className="py-1 text-right text-green-600">-₹{order.discount_amount}</td>
                    </tr>
                  )}
                  <tr className="border-t border-gray-200">
                    <td className="pt-3 font-bold text-lg">Total</td>
                    <td className="pt-3 text-right font-bold text-lg">₹{order.total_amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="font-bold text-gray-900 mb-3 uppercase text-xs tracking-wider">Payment Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-gray-500 text-xs uppercase">Payment Mode</p>
                <p className="font-medium">UPI</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase">Reference / UTR</p>
                <p className="font-mono">{order.utr_reference}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Payment is subject to manual verification by admin.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-xs text-gray-400 border-t border-gray-100 pt-6">
            <p>This is a computer-generated invoice.</p>
            <p className="mt-1">Thank you for supporting homemade food 🙏</p>
          </div>
        </div>
      </div>
    </main>
  );
};