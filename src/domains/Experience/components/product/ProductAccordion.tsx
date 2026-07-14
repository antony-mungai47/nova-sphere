"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, List, Settings, ShieldAlert, Truck, HelpCircle } from "lucide-react";

interface ProductAccordionProps {
  description: string;
  specs?: Record<string, string>;
  features?: string[];
}

export function ProductAccordion({ description, specs, features }: ProductAccordionProps) {
  const [openSections, setOpenSections] = useState<string[]>(["description"]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => 
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const sections = [
    {
      id: "description",
      icon: <List className="w-5 h-5" />,
      title: "Description",
      content: (
        <div className="text-muted-foreground text-sm leading-relaxed pb-4">
          {description}
        </div>
      )
    },
    {
      id: "features",
      icon: <Settings className="w-5 h-5" />,
      title: "Key Features",
      content: features && features.length > 0 ? (
        <ul className="list-disc list-inside text-sm text-muted-foreground pb-4 space-y-2">
          {features.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground pb-4">No specific features listed.</p>
      )
    },
    {
      id: "specs",
      icon: <Settings className="w-5 h-5" />,
      title: "Specifications",
      content: specs && Object.keys(specs).length > 0 ? (
        <div className="pb-4">
          {Object.entries(specs).map(([key, value], i) => (
            <div key={key} className={`flex py-2 text-sm ${i !== Object.keys(specs).length - 1 ? "border-b border-border/50" : ""}`}>
              <span className="w-1/3 text-muted-foreground">{key}</span>
              <span className="w-2/3 text-foreground font-medium">{value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground pb-4">No detailed specifications available.</p>
      )
    },
    {
      id: "warranty",
      icon: <ShieldAlert className="w-5 h-5" />,
      title: "Warranty & Returns",
      content: (
        <div className="text-sm text-muted-foreground pb-4 space-y-3">
          <p><strong>24-Month Manufacturer Warranty:</strong> Covers all physical defects and system malfunctions under normal use.</p>
          <p><strong>30-Day Easy Returns:</strong> Return items in original condition within 30 days for a full refund or exchange. Prepaid return labels are provided.</p>
        </div>
      )
    },
    {
      id: "delivery",
      icon: <Truck className="w-5 h-5" />,
      title: "Delivery Information",
      content: (
        <div className="text-sm text-muted-foreground pb-4 space-y-3">
          <p>Standard delivery takes 2-4 business days. Nova Prime members receive free next-day delivery on eligible items.</p>
          <p>Real-time GPS tracking will be available via the Nova App once your order is dispatched.</p>
        </div>
      )
    },
    {
      id: "faq",
      icon: <HelpCircle className="w-5 h-5" />,
      title: "Frequently Asked Questions",
      content: (
        <div className="text-sm text-muted-foreground pb-4 space-y-4">
          <div>
             <p className="font-semibold text-foreground">Is this product authentic?</p>
             <p>Yes, Nova Sphere only sources from verified vendors and original manufacturers. This product carries an Authentic Product badge.</p>
          </div>
          <div>
             <p className="font-semibold text-foreground">Can I pay in installments?</p>
             <p>Yes, flexible installment plans are available at checkout via our financial partners.</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col border-t border-border mt-8">
      {sections.map((section) => {
        const isOpen = openSections.includes(section.id);
        
        return (
          <div key={section.id} className="border-b border-border">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full py-5 flex items-center justify-between text-left focus:outline-none group"
            >
              <div className="flex items-center gap-3 text-foreground group-hover:text-cta-primary transition-colors">
                {section.icon}
                <span className="font-semibold text-lg">{section.title}</span>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  {section.content}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
