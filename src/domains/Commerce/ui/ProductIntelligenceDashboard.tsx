"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, BrainCircuit, Activity, ShieldCheck, Box } from "lucide-react";
import { useSignals } from "../../signals/sdk/hooks";
import { useProductIntelligence } from "../sdk/hooks";
import { ChartCard } from "./charts/ChartCard";
import { LineChart } from "./charts/LineChart";
import { MetricCard } from "./charts/MetricCard";

interface DashboardProps {
  productId: string;
}

export function ProductIntelligenceDashboard({ productId }: DashboardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { insight, isLoading, pricing, inventory, trust, delivery, sustainability } = useProductIntelligence(productId);

  return (
    <div className="w-full bg-surface border border-border rounded-2xl overflow-hidden mt-12 shadow-sm">
      
      {/* Header / Toggle */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-background hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cta-primary/10 flex items-center justify-center">
             <BrainCircuit className="w-5 h-5 text-cta-primary" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-foreground">Commerce Intelligence</h3>
            <p className="text-sm text-muted-foreground">Pricing trends, inventory forecast, and trust metrics</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            <div className="p-6 flex flex-col gap-8">
              
              {/* SECTION: Pricing Intelligence */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-foreground" />
                  <h4 className="font-bold text-foreground text-lg">Pricing Intelligence</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                   <MetricCard 
                     isLoading={isLoading}
                     title="Current Market Position" 
                     value={pricing?.competitiveness ? `${pricing.competitiveness}/100` : "--"}
                     subtitle="Competitiveness score"
                     trend={{ direction: pricing?.marketTrend === "falling" ? "down" : "up", value: "vs Last 30d" }}
                   />
                   <MetricCard 
                     isLoading={isLoading}
                     title="Historical Lowest" 
                     value={pricing?.historicalLowest ? `$${pricing.historicalLowest.toFixed(2)}` : "--"}
                     subtitle="Over the last 12 months"
                   />
                   <MetricCard 
                     isLoading={isLoading}
                     title="Average Price" 
                     value={pricing?.averagePrice ? `$${pricing.averagePrice.toFixed(2)}` : "--"}
                     subtitle="Category average"
                   />
                </div>

                <div className="h-[400px]">
                  <ChartCard 
                    isLoading={isLoading}
                    title="Price History (90 Days)"
                    subtitle="Analyze recent pricing fluctuations to determine optimal buying windows."
                    insight={pricing?.ai ? { text: pricing.ai.insight, confidence: pricing.ai.confidence } : undefined}
                    footer={<span className="text-xs text-muted-foreground">Source: Nova Sphere Pricing Engine</span>}
                  >
                    {pricing?.history && (
                      <LineChart 
                        data={pricing.history} 
                        xKey="date" 
                        yKey="price" 
                        valueFormatter={(val) => `$${val.toFixed(2)}`}
                      />
                    )}
                  </ChartCard>
                </div>
              </section>

              {/* SECTION: Trust Intelligence */}
              <section className="pt-8 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-foreground" />
                  <h4 className="font-bold text-foreground text-lg">Trust Intelligence</h4>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   <MetricCard 
                     isLoading={isLoading}
                     title="Trust Score" 
                     value={trust?.trustScore ? `${trust.trustScore}/100` : "--"}
                     subtitle={trust?.ai.recommendation}
                   />
                   <MetricCard 
                     isLoading={isLoading}
                     title="Return Rate" 
                     value={trust?.returnRate ? `${trust.returnRate}%` : "--"}
                     subtitle="Extremely low for category"
                   />
                   <MetricCard 
                     isLoading={isLoading}
                     title="Delivery Accuracy" 
                     value={trust?.deliveryAccuracy ? `${trust.deliveryAccuracy}%` : "--"}
                     subtitle="On-time delivery"
                   />
                   <MetricCard 
                     isLoading={isLoading}
                     title="Dispute History" 
                     value={trust?.disputeHistory === "clean" ? "Clean" : "Warning"}
                     subtitle="Zero disputes in 12 months"
                   />
                </div>
              </section>

              {/* SECTION: Inventory & Delivery Intelligence */}
              <section className="pt-8 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Box className="w-5 h-5 text-foreground" />
                  <h4 className="font-bold text-foreground text-lg">Fulfilment Intelligence</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <MetricCard 
                     isLoading={isLoading}
                     title="Sales Velocity" 
                     value={inventory?.salesVelocity ? `${inventory.salesVelocity}/day` : "--"}
                     subtitle={inventory?.ai.insight}
                     trend={{ direction: "up", value: "15% vs Last Month" }}
                   />
                   <MetricCard 
                     isLoading={isLoading}
                     title="Est. Sellout" 
                     value={inventory?.estimatedSelloutDays ? `${inventory.estimatedSelloutDays} days` : "--"}
                     subtitle="Based on current velocity"
                   />
                   <MetricCard 
                     isLoading={isLoading}
                     title="Fastest Delivery" 
                     value={delivery?.fastestDeliveryDate ? new Date(delivery.fastestDeliveryDate).toLocaleDateString() : "--"}
                     subtitle={delivery?.ai.insight}
                   />
                </div>
              </section>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
