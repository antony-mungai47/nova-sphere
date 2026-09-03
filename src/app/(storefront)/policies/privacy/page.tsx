export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-24">
      <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
      <div className="prose prose-invert prose-blue max-w-none text-nova-silver">
        <p className="lead">Last updated: June 2026</p>
        
        <h2>1. Introduction</h2>
        <p>Welcome to Nova Sphere Market. We respect your privacy and are committed to protecting your personal data.</p>
        
        <h2>2. Data We Collect</h2>
        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
        <ul>
          <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
          <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
          <li><strong>Financial Data</strong> includes payment card details (processed securely via Stripe).</li>
          <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
        </ul>

        <h2>3. How We Use Your Data</h2>
        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
        <ul>
          <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
          <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
          <li>Where we need to comply with a legal obligation.</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.</p>

        <h2>5. Your Legal Rights</h2>
        <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, or restriction of processing.</p>

        <p className="mt-8 text-sm italic">This privacy policy is governed by standard GDPR and CCPA frameworks. For questions, contact privacy@novasphere.com.</p>
      </div>
    </div>
  );
}