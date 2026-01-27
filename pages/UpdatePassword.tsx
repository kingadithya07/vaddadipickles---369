import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export const UpdatePassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      navigate('/auth/password-changed');
    } catch (err: any) {
      setError(err.message || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Lock className="text-brand-600" /> Update Password
        </h1>
        
        <p className="text-gray-600 mb-6 text-sm">
          Please enter your new password below.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition shadow-md hover:shadow-lg disabled:opacity-70"
          >
            {loading ? 'Updating...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
};