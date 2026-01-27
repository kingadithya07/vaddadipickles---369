import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../supabase';
import { Order, Expense } from '../types';
import { ExternalLink, Check, X, Truck, PackageCheck, TrendingUp, TrendingDown, Wallet, Plus, Trash2, Calendar, BarChart2 } from 'lucide-react';
import { 
  ComposedChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Line
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'finances'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Chart State
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'monthly'>('daily');

  // New Expense State
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'Inventory',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchData = useCallback(async () => {
    // Fetch Orders
    const { data: orderData } = await supabase
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
    
    if (orderData) setOrders(orderData as any);

    // Fetch Expenses
    const { data: expenseData } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (expenseData) setExpenses(expenseData as Expense[]);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    // Realtime subscription for orders
    const orderSubscription = supabase
      .channel('admin-orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchData(); // Refetch to get joined data (profiles, items)
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
    };
  }, [fetchData]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) {
      // Optimistic update
      setOrders(orders.map(o => o.id === id ? { ...o, status: status as any } : o));
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;

    const expensePayload = {
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date
    };

    const { data, error } = await supabase
      .from('expenses')
      .insert(expensePayload)
      .select()
      .single();

    if (!error && data) {
      setExpenses([data as Expense, ...expenses]);
      setNewExpense({
        description: '',
        amount: '',
        category: 'Inventory',
        date: new Date().toISOString().split('T')[0]
      });
    } else {
      alert("Error adding expense");
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if(!confirm("Are you sure?")) return;
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  // Financial Calculations
  // Revenue: Sum of completed orders (Approved, Shipped, Delivered)
  const totalRevenue = orders
    .filter(o => ['approved', 'shipped', 'delivered'].includes(o.status))
    .reduce((sum, o) => sum + o.total_amount, 0);

  const totalExpenditure = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenditure;

  // Chart Data Preparation
  const chartData = useMemo(() => {
    const dataMap = new Map<string, { date: string, revenue: number, expense: number }>();

    const getKey = (dateString: string) => {
      if (!dateString) return '';
      // Assuming dateString is ISO or YYYY-MM-DD
      const datePart = dateString.split('T')[0];
      if (chartPeriod === 'monthly') {
        return datePart.substring(0, 7); // YYYY-MM
      }
      return datePart; // YYYY-MM-DD
    };

    // Aggregate Orders (Revenue)
    orders.forEach(order => {
      if (['approved', 'shipped', 'delivered'].includes(order.status)) {
        const key = getKey(order.created_at);
        const entry = dataMap.get(key) || { date: key, revenue: 0, expense: 0 };
        entry.revenue += order.total_amount;
        dataMap.set(key, entry);
      }
    });

    // Aggregate Expenses
    expenses.forEach(exp => {
      const key = getKey(exp.date);
      const entry = dataMap.get(key) || { date: key, revenue: 0, expense: 0 };
      entry.expense += exp.amount;
      dataMap.set(key, entry);
    });

    // Sort and Format
    return Array.from(dataMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(chartPeriod === 'daily' ? -30 : -12) // Limit to last 30 days or 12 months for better view
      .map(item => {
        const d = new Date(item.date + (chartPeriod === 'monthly' ? '-01' : ''));
        return {
          ...item,
          name: chartPeriod === 'monthly' 
            ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          profit: item.revenue - item.expense
        };
      });
  }, [orders, expenses, chartPeriod]);

  if (loading) return <div>Loading Admin Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
           <button 
             onClick={() => setActiveTab('orders')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'orders' ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}
           >
             Orders
           </button>
           <button 
             onClick={() => setActiveTab('finances')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'finances' ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}
           >
             Finances
           </button>
        </div>
      </div>

      {/* Stats Cards - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Earnings</p>
            <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-full text-green-600">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Expenditure</p>
            <p className="text-2xl font-bold text-red-600">₹{totalExpenditure.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-full text-red-600">
            <TrendingDown size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Net Profit</p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
              ₹{netProfit.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <Wallet size={24} />
          </div>
        </div>
      </div>
      
      {activeTab === 'orders' ? (
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
                    {order.discount_amount && order.discount_amount > 0 && (
                       <div className="text-xs text-green-600 mt-0.5">
                         Includes ₹{order.discount_amount} discount ({order.coupon_code})
                       </div>
                    )}
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
      ) : (
        <div className="space-y-8">
          
          {/* Chart Section */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-lg font-bold flex items-center gap-2">
                 <BarChart2 size={20} className="text-brand-600" /> Earnings & Expenditure
               </h2>
               <div className="flex bg-gray-100 rounded-lg p-1">
                 <button 
                   onClick={() => setChartPeriod('daily')}
                   className={`px-3 py-1 rounded-md text-xs font-bold transition ${chartPeriod === 'daily' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500'}`}
                 >
                   Daily
                 </button>
                 <button 
                   onClick={() => setChartPeriod('monthly')}
                   className={`px-3 py-1 rounded-md text-xs font-bold transition ${chartPeriod === 'monthly' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500'}`}
                 >
                   Monthly
                 </button>
               </div>
            </div>
            
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `₹${value}`} />
                   <Tooltip 
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                     formatter={(value: number) => [`₹${value}`, '']}
                     labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}
                   />
                   <Legend />
                   <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
                   <Bar dataKey="expense" name="Expenditure" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                   <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                 </ComposedChart>
               </ResponsiveContainer>
            </div>
            <div className="text-center text-xs text-gray-400 mt-4">
              Showing data for the last {chartPeriod === 'daily' ? '30 days' : '12 months'}
            </div>
          </div>

          {/* Add Expense Form */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus size={20} className="text-brand-600" /> Add New Expense
            </h2>
            <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Raw Mangoes 50kg"
                  className="w-full border rounded p-2 text-sm"
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  required
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full border rounded p-2 text-sm"
                  value={newExpense.amount}
                  onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
                <select 
                  className="w-full border rounded p-2 text-sm"
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                >
                  <option>Inventory</option>
                  <option>Packaging</option>
                  <option>Logistics</option>
                  <option>Marketing</option>
                  <option>Operations</option>
                  <option>Salary</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                 <button type="submit" className="w-full bg-brand-600 text-white p-2 rounded text-sm font-bold hover:bg-brand-700">
                   Add Expense
                 </button>
              </div>
            </form>
          </div>

          {/* Expenses List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
               <h2 className="font-bold text-gray-700">Expense History</h2>
             </div>
             {expenses.length === 0 ? (
               <div className="p-8 text-center text-gray-500">No expenses recorded yet.</div>
             ) : (
               <table className="w-full text-left text-sm">
                 <thead className="bg-white text-gray-500 uppercase tracking-wider font-semibold border-b">
                   <tr>
                     <th className="px-6 py-4">Date</th>
                     <th className="px-6 py-4">Description</th>
                     <th className="px-6 py-4">Category</th>
                     <th className="px-6 py-4 text-right">Amount</th>
                     <th className="px-6 py-4 text-center">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {expenses.map(exp => (
                     <tr key={exp.id} className="hover:bg-gray-50">
                       <td className="px-6 py-3 text-gray-600 flex items-center gap-2">
                         <Calendar size={14}/> {new Date(exp.date).toLocaleDateString()}
                       </td>
                       <td className="px-6 py-3 font-medium text-gray-900">{exp.description}</td>
                       <td className="px-6 py-3">
                         <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                           {exp.category}
                         </span>
                       </td>
                       <td className="px-6 py-3 text-right font-bold text-red-600">
                         -₹{exp.amount.toLocaleString()}
                       </td>
                       <td className="px-6 py-3 text-center">
                         <button 
                           onClick={() => handleDeleteExpense(exp.id)}
                           className="text-gray-400 hover:text-red-600 transition p-1"
                         >
                           <Trash2 size={16} />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
          </div>
        </div>
      )}
    </div>
  );
};