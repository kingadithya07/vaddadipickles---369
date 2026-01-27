import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export const AuthSuccess: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🎉 Success!
        </h1>
        <p className="text-gray-600 mb-8">
          Your account has been successfully created or logged in. Welcome to Vaddadi Pickles.
        </p>
        <Link
          to="/"
          className="block w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition"
        >
          Start Shopping
        </Link>
      </div>
    </div>
  );
};