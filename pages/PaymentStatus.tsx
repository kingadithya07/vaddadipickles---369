import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export const PaymentStatus: React.FC = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const isApproved = status === 'approved';
  const isCancelled = status === 'cancelled' || status === 'rejected';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-6 rounded-lg shadow max-w-md w-full text-center">
        {isApproved ? (
          <>
            <h1 className="text-2xl font-bold text-green-600">
              ✅ Payment Approved
            </h1>

            <p className="mt-3 text-gray-700">
              Your payment has been verified successfully.
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Your order is now being processed.
            </p>
          </>
        ) : isCancelled ? (
          <>
            <h1 className="text-2xl font-bold text-red-600">
              ❌ Order Cancelled
            </h1>

            <p className="mt-3 text-gray-700">
              Your order has been cancelled or payment rejected.
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Please contact support if this is a mistake.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-yellow-600">
              ⏳ Payment Pending
            </h1>

            <p className="mt-3 text-gray-700">
              We are verifying your payment details.
            </p>

            <p className="text-sm text-gray-500 mt-2">
              This usually takes a few hours.
            </p>
          </>
        )}

        <Link
          to="/orders"
          className="inline-block mt-6 bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        >
          Go to My Orders
        </Link>
      </div>
    </div>
  );
};