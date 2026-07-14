"use client";

import React from "react";
import { MessageCircleQuestion, Clock, CheckCircle, Award } from "lucide-react";

interface QATrustMetricsProps {
  totalQuestions: number;
  answeredPercentage: number;
  averageResponseTime: string;
  officialAnswersRate: number;
  communityExpertsCount: number;
}

export function QATrustMetrics({ 
  totalQuestions, 
  answeredPercentage, 
  averageResponseTime, 
  officialAnswersRate,
  communityExpertsCount 
}: QATrustMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-center items-center text-center">
        <MessageCircleQuestion className="w-6 h-6 text-cta-primary mb-2" />
        <span className="text-2xl font-bold text-foreground">{totalQuestions.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Questions</span>
      </div>
      
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-center items-center text-center">
        <CheckCircle className="w-6 h-6 text-emerald-500 mb-2" />
        <span className="text-2xl font-bold text-foreground">{answeredPercentage}%</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Answered</span>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-center items-center text-center">
        <Clock className="w-6 h-6 text-warning mb-2" />
        <span className="text-2xl font-bold text-foreground">{averageResponseTime}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Avg Response</span>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-center items-center text-center">
        <Award className="w-6 h-6 text-indigo-400 mb-2" />
        <span className="text-2xl font-bold text-foreground">{communityExpertsCount}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Active Experts</span>
      </div>
    </div>
  );
}
