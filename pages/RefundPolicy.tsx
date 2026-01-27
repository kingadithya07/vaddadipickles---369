import React from 'react';

export const RefundPolicy: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Refund & Cancellation Policy</h1>
      <p className="text-sm text-gray-500 mb-6">Last updated: 25/01/2026</p>

      <h2 className="font-semibold text-xl mb-2">Order Cancellation</h2>
      <p className="mb-4">Orders can be cancelled before dispatch only.</p>

      <h2 className="mt-6 font-semibold text-xl mb-2">Refund Eligibility</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Wrong product delivered</li>
        <li>Damaged product</li>
        <li>Cancelled before dispatch</li>
      </ul>

      <h2 className="mt-6 font-semibold text-xl mb-2">Non-Refundable</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Taste preference issues</li>
        <li>Courier delays</li>
        <li>Incorrect delivery address</li>
        <li>Perishable items after delivery</li>
      </ul>

      <h2 className="mt-6 font-semibold text-xl mb-2">Refund Timeline</h2>
      <p className="mb-4">Approved refunds are processed within 5–7 business days.</p>
    </main>
  );
};