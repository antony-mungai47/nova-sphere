import React from "react";
import { prisma } from "@/lib/prisma";


export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    include: {
      orders: true,
      addresses: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Customer Management</h1>
      <p className="text-nova-silver mb-8">View and manage customer accounts.</p>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 text-nova-silver font-medium">Customer ID</th>
              <th className="p-4 text-nova-silver font-medium">Name</th>
              <th className="p-4 text-nova-silver font-medium">Email</th>
              <th className="p-4 text-nova-silver font-medium">Total Orders</th>
              <th className="p-4 text-nova-silver font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-nova-silver">No customers found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-mono text-sm">{user.id.slice(-8)}</td>
                  <td className="p-4 text-white">{user.name || 'Anonymous'}</td>
                  <td className="p-4 text-nova-silver">{user.email}</td>
                  <td className="p-4 text-white font-medium">{user.orders.length}</td>
                  <td className="p-4 text-nova-silver">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
