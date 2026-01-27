import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Order, UserProfile } from '../types';
import { Package, Clock, CheckCircle, Truck } from 'lucide-react';

export const Orders: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items (
            quantity,
            price,
            product:products (name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setOrders(data as any);
      setLoading(false);
    };

    fetchOrders();

    // Realtime subscription
    const subscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, (payload) => {
        setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  if (loading) return <div>Loading orders...</div>;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      default: return <Package size={16} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">My Orders</h1>
      <div className="space-y-6">
        {orders.length === 0 && <p>No orders found.</p>}
        {orders.map(order => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Order ID</p>
                <p className="font-mono text-sm font-bold text-gray-700">#{order.id.slice(0,8)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                <p className="text-sm font-bold text-gray-700">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                 <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                 <p className="text-sm font-bold text-brand-600">₹{order.total_amount}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {order.status}
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {order.items.map((item: any, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product?.name || 'Product'} <span className="text-gray-400">x {item.quantity}</span>
                    </span>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};