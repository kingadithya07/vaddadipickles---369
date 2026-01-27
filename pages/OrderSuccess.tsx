import React from 'react';
import { Link } from 'react-router-dom';

export const OrderSuccess: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-6 rounded-lg shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-green-600">
          ✅ Order Placed Successfully
        </h1>

        <p className="mt-3 text-gray-700">
          Thank you for ordering from <strong>Vaddadi Pickles</strong>.
        </p>

        <p className="mt-2 text-sm text-gray-600">
          Your order has been received and is under verification.
        </p>

        <div className="mt-4 text-sm text-gray-500">
          💡 Please note:
          <ul className="list-disc text-left pl-6 mt-2">
            <li>UPI payment is verified manually</li>
            <li>Order will be approved after verification</li>
            <li>You will be notified once approved</li>
          </ul>
        </div>

        <Link
          to="/orders"
          className="inline-block mt-6 bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        >
          View My Orders
        </Link>
      </div>
    </div>
  );
};