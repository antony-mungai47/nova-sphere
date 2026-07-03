export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-24">
      <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
      <div className="prose prose-invert prose-blue max-w-none text-nova-silver">
        <p className="lead">Last updated: June 2026</p>
        
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using Nova Sphere Market, you accept and agree to be bound by the terms and provision of this agreement.</p>
        
        <h2>2. Marketplace Operations</h2>
        <p>Nova Sphere operates as a multi-vendor marketplace and auction platform. We facilitate transactions but do not take ownership of the underlying assets sold by third-party vendors unless explicitly marked as "Fulfilled by Nova".</p>
        
        <h2>3. Prohibited Conduct</h2>
        <p>Users may not:</p>
        <ul>
          <li>Use the platform for any illegal purpose.</li>
          <li>Attempt to exploit the pricing or auction engines.</li>
          <li>Harass other users or vendors.</li>
          <li>Circumvent the payment infrastructure.</li>
        </ul>

        <h2>4. Auction Rules</h2>
        <p>Bids placed on the Nova Sphere Auction engine are legally binding contracts. Failure to fulfill a won auction will result in account suspension and potential legal action.</p>

        <p className="mt-8 text-sm italic">These terms are governed by the laws of our operating jurisdiction. For questions, contact legal@novasphere.com.</p>
      </div>
    </div>
  );
}