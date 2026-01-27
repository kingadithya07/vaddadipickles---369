import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Order } from '../types';
import { ExternalLink, Check, X, Truck, PackageCheck } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        profile:profiles(email, full_name),
        items:order_items(
          quantity,
          price,
          product:products(name)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: status as any } : o));
    }
  };

  if (loading) return <div>Loading Admin Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b">
            <tr>
              <th className="px-6 py-4">Order Info</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Payment (UTR)</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-bold">#{order.id.slice(0,8)}</div>
                  <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                  <div className="font-bold text-brand-600 mt-1">₹{order.total_amount}</div>
                  <div className="text-xs mt-1">
                    {order.items.length} items
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium">{(order as any).profile?.full_name || 'Unknown'}</div>
                  <div className="text-gray-500 text-xs">{(order as any).profile?.email}</div>
                  <div className="text-xs text-gray-400 mt-1 max-w-[150px] truncate" title={order.shipping_address}>
                    {order.shipping_address}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-mono bg-gray-100 px-2 py-1 rounded inline-block text-xs">
                    {order.utr_reference}
                  </div>
                  {order.payment_screenshot_url && (
                    <a 
                      href={order.payment_screenshot_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-1 text-blue-600 text-xs mt-2 hover:underline"
                    >
                      <ExternalLink size={12} /> View Proof
                    </a>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                    ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      order.status === 'approved' ? 'bg-blue-100 text-blue-800' : 
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(order.id, 'approved')} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Approve">
                          <Check size={16} />
                        </button>
                        <button onClick={() => updateStatus(order.id, 'rejected')} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200" title="Reject">
                          <X size={16} />
                        </button>
                      </>
                    )}
                    {order.status === 'approved' && (
                      <button onClick={() => updateStatus(order.id, 'shipped')} className="p-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200" title="Mark Shipped">
                        <Truck size={16} />
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button onClick={() => updateStatus(order.id, 'delivered')} className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200" title="Mark Delivered">
                        <PackageCheck size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
