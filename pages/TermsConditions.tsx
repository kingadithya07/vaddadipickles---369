import React from 'react';

export const TermsConditions: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
      <p className="text-sm text-gray-500 mb-6">Last updated: 25/01/2026</p>

      <p className="mb-4">
        By using this website, you agree to these terms and conditions.
      </p>

      <h2 className="mt-6 font-semibold text-xl mb-2">Products</h2>
      <p className="mb-4">
        All products are homemade food items and perishable in nature.
      </p>

      <h2 className="mt-6 font-semibold text-xl mb-2">Payments</h2>
      <p className="mb-4">
        Payments are accepted only via UPI. Orders are confirmed after manual
        payment verification.
      </p>

      <h2 className="mt-6 font-semibold text-xl mb-2">Shipping</h2>
      <p className="mb-4">Delivery timelines are estimates and may vary.</p>

      <h2 className="mt-6 font-semibold text-xl mb-2">Governing Law</h2>
      <p className="mb-4">These terms are governed by the laws of India.</p>
    </main>
  );
};