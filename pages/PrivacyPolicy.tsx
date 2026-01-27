import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-6">Last updated: 25/01/2026</p>

      <p className="mb-4">
        Vaddadi Pickles respects your privacy. This policy explains how we
        collect, use, and protect your information.
      </p>

      <h2 className="mt-6 font-semibold text-xl mb-2">Information We Collect</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Name, phone number, email</li>
        <li>Shipping address</li>
        <li>Order and payment reference details</li>
        <li>Payment screenshots (if uploaded)</li>
      </ul>

      <h2 className="mt-6 font-semibold text-xl mb-2">Payment Information</h2>
      <p className="mb-4">
        We do not store UPI or bank credentials. Payments are made directly by
        customers via UPI.
      </p>

      <h2 className="mt-6 font-semibold text-xl mb-2">Contact</h2>
      <p>Email: vvrsadithya@gmail.com</p>
      <p>Phone: +91-8008129309</p>
    </main>
  );
};