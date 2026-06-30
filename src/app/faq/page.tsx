import React from "react";
import { Navbar } from "@/shared/components/layout/navbar";
import { Footer } from "@/shared/components/layout/footer";
import { HelpCircle } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      category: "Shipping & Delivery",
      questions: [
        { q: "How long does shipping take?", a: "Standard global shipping takes 3-5 business days. Expedited shipping is available at checkout for 1-2 day delivery." },
        { q: "Do you ship internationally?", a: "Yes, Nova Sphere ships globally to over 150 countries. Shipping costs are calculated at checkout based on your region." }
      ]
    },
    {
      category: "Returns & Refunds",
      questions: [
        { q: "What is your return policy?", a: "We offer a 30-day hassle-free return policy for all items in their original condition. Contact support to initiate a return." },
        { q: "When will I get my refund?", a: "Refunds are processed within 3-5 business days after we receive and inspect your returned item." }
      ]
    },
    {
      category: "Auctions & Bidding",
      questions: [
        { q: "How does the anti-sniping rule work?", a: "If a bid is placed within the final 5 minutes of an auction, the timer is automatically extended by 5 minutes to ensure fair bidding." },
        { q: "Can I cancel a bid?", a: "Bids are legally binding and cannot be cancelled once placed. Please review your bid amount carefully before confirming." }
      ]
    },
    {
      category: "Loyalty & Rewards",
      questions: [
        { q: "How do I earn Loyalty Points?", a: "You earn 1 Loyalty Point for every $1 spent in the store. Points are credited to your account after the order is shipped." },
        { q: "How can I redeem my points?", a: "Points can be redeemed at checkout for discounts on future purchases, or converted into exclusive rewards in your Account dashboard." }
      ]
    }
  ];

  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Navbar />
      
      <div className="flex-1 pt-32 pb-24 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-nova-blue/10 blur-[150px] rounded-full pointer-events-none -z-10" />
        
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-nova-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-nova-blue" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-nova-blue to-nova-emerald">Questions</span>
            </h1>
            <p className="text-nova-silver text-lg">Find answers to common questions about Nova Sphere.</p>
          </div>

          <div className="space-y-12">
            {faqs.map((section, idx) => (
              <div key={idx} className="glass-panel p-8 rounded-3xl border border-white/10 bg-black/40">
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">{section.category}</h2>
                <div className="space-y-6">
                  {section.questions.map((faq, fidx) => (
                    <div key={fidx}>
                      <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
                      <p className="text-nova-silver leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
