import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // For this demo, using Magic Link for simplicity
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Check your email for the login link!');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-center">Login to Vaddadi Pickles</h1>
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none"
            placeholder="you@example.com"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition"
        >
          {loading ? 'Sending Link...' : 'Send Magic Link'}
        </button>
        {message && <div className="p-4 bg-brand-50 text-brand-800 rounded-lg text-sm">{message}</div>}
      </form>
    </div>
  );
};
