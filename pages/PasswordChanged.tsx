import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export const PasswordChanged: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🔐 Password Updated
        </h1>

        <p className="mt-3 text-gray-600">
          Your password has been changed successfully.
        </p>

        <p className="text-sm text-gray-500 mt-2">
          You can now log in using your new password.
        </p>

        <p className="text-xs text-gray-400 mt-4">
          Redirecting automatically in 5 seconds...
        </p>

        <Link
          to="/login"
          className="block w-full mt-6 bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
};