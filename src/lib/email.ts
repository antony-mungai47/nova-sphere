export async function sendOrderConfirmation(email: string, orderId: string, amount: number) {
  console.log(`\n========================================`);
  console.log(`📧 MOCK EMAIL SENT`);
  console.log(`========================================`);
  console.log(`To: ${email}`);
  console.log(`Subject: Your Nova Sphere Order Confirmation (${orderId.slice(-8)})`);
  console.log(`\nThank you for shopping at Nova Sphere!`);
  console.log(`Your order of $${amount.toFixed(2)} has been successfully processed.`);
  console.log(`This is a simulated email since we are in Mock Simulation Mode.`);
  console.log(`========================================\n`);

  // Simulate network latency for sending an email
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return true;
}
