import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/#/update-password',
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Password reset link has been sent to your email.',
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
        <div className="flex items-center gap-2 mb-6">
           <Link to="/login" className="text-gray-400 hover:text-gray-600 transition">
             <ArrowLeft size={24} />
           </Link>
           <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
        </div>

        <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-6">
          <KeyRound size={24} />
        </div>

        <p className="text-gray-600 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm border ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
              placeholder="you@example.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition shadow-md hover:shadow-lg disabled:opacity-70"
          >
            {loading ? 'Sending Link...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};