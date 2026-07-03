import React from 'react';

export default function VendorDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Vendor Center</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-gray-500 text-sm uppercase tracking-wide">Available Balance</h2>
          <p className="text-4xl font-semibold mt-2">$12,450.00</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-gray-500 text-sm uppercase tracking-wide">Pending Balance</h2>
          <p className="text-4xl font-semibold mt-2">$3,200.00</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-gray-500 text-sm uppercase tracking-wide">Open Orders</h2>
          <p className="text-4xl font-semibold mt-2">14</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-gray-500 text-sm uppercase tracking-wide">Health Score</h2>
          <p className="text-4xl font-semibold mt-2 text-green-500">98/100</p>
        </div>
      </div>
    </div>
  );
}
