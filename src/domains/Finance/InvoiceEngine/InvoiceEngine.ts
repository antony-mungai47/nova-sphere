import { prisma } from "@/lib/prisma";

export class InvoiceEngine {
  /**
   * Generates a PDF Invoice and stores it in the database.
   * This is triggered asynchronously after payment capture.
   */
  static async generateInvoice(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true }
    });

    if (!order) throw new Error("Order not found");

    const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // In a real scenario, we'd use jspdf or pdfkit here and upload to S3/Cloud Storage.
    // For Phase 13, we mock the PDF generation and URL.
    const pdfUrl = `https://storage.novasphere.com/invoices/${invoiceNum}.pdf`;

    const invoice = await prisma.invoice.create({
      data: {
        orderId,
        invoiceNum,
        pdfUrl,
        totalAmount: order.totalAmount,
        currency: order.currency
      }
    });

    return invoice;
  }
}
