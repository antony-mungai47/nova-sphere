"use server";
import { OrderRepository } from "@/domains/Customer/orders/repositories/order.repository";
import { ProductRepository } from "@/domains/Commerce/products/repositories/product.repository";

import { IdentityService } from "@/modules/identity/services/IdentityService";

export async function generateOrdersCSV() {
  const authorized = await IdentityService.isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  const orders = await OrderRepository.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });

  const headers = ["Order ID", "Date", "Customer Email", "Customer Name", "Total Amount", "Status"];
  const rows = orders.map(o => [
    o.id,
    o.createdAt.toISOString(),
    o.user?.email || "Unknown",
    o.user?.name || "Unknown",
    o.totalAmount.toFixed(2),
    o.status
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(r => r.map(field => `"${field}"`).join(","))
  ].join("\n");

  return csvContent;
}

export async function generateInventoryCSV() {
  const authorized = await IdentityService.isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  const products = await ProductRepository.findMany({
    orderBy: { stock: 'asc' }
  });

  const headers = ["Product ID", "SKU", "Name", "Category", "Price", "Stock Level"];
  const rows = products.map(p => [
    p.id,
    p.sku,
    p.name.replace(/"/g, '""'), // escape quotes
    p.category,
    p.price.toFixed(2),
    p.stock.toString()
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(r => r.map(field => `"${field}"`).join(","))
  ].join("\n");

  return csvContent;
}
