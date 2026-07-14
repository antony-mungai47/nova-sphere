"use client";

import React, { useState, useMemo } from "react";
import { QuestionDTO } from "./types";
import { QASearch } from "./QASearch";
import { QATrustMetrics } from "./QATrustMetrics";
import { ProductManuals } from "./ProductManuals";
import { QuestionCard } from "./QuestionCard";
import { MessagesSquare } from "lucide-react";

const MOCK_CATEGORIES = [
  { name: "Battery", count: 42 },
  { name: "Compatibility", count: 38 },
  { name: "Shipping", count: 24 },
  { name: "Warranty", count: 18 },
  { name: "Installation", count: 12 },
];

const MOCK_QUESTIONS: QuestionDTO[] = [
  {
    id: "q1",
    question: "Does this device support 100W fast charging via USB-C?",
    author: {
      id: "u1",
      name: "Mike T.",
      role: "customer",
      isVerifiedBuyer: false,
      badges: []
    },
    createdAt: "3 days ago",
    category: "Compatibility",
    meTooCount: 84,
    views: 1205,
    status: "answered",
    acceptedAnswerId: "a1",
    answers: [
      {
        id: "a1",
        questionId: "q1",
        author: {
          id: "s1",
          name: "Nova Sphere Official",
          role: "seller",
          isVerifiedBuyer: false,
          badges: ["Seller"]
        },
        content: "Yes, it fully supports USB PD 3.0 up to 100W. Using the included cable and a compatible 100W brick, it will charge from 0 to 50% in approximately 25 minutes.",
        helpfulVotes: 142,
        notHelpfulVotes: 3,
        isAccepted: true,
        createdAt: "2 days ago"
      },
      {
        id: "a2",
        questionId: "q1",
        author: {
          id: "u2",
          name: "Tech Guru",
          role: "expert",
          isVerifiedBuyer: true,
          badges: ["Top Contributor", "Hardware Expert"]
        },
        content: "Can confirm. I tested it with my Mac brick (96W) and a power meter. It drew exactly 94W at peak. Make sure you use a 5A rated cable though, or it will cap at 60W.",
        helpfulVotes: 89,
        notHelpfulVotes: 1,
        isAccepted: false,
        createdAt: "1 day ago"
      }
    ],
    relatedQuestions: [
      { id: "q12", question: "Is a charger included in the box?" },
      { id: "q13", question: "Can I use my laptop charger for this?" }
    ]
  },
  {
    id: "q2",
    question: "What is the expected battery degradation after a year of heavy use?",
    author: {
      id: "u3",
      name: "Alex R.",
      role: "customer",
      isVerifiedBuyer: true,
      badges: []
    },
    createdAt: "1 month ago",
    category: "Battery",
    meTooCount: 45,
    views: 890,
    status: "answered",
    answers: [
      {
        id: "a3",
        questionId: "q2",
        author: {
          id: "u4",
          name: "David C.",
          role: "customer",
          isVerifiedBuyer: true,
          badges: []
        },
        content: "I've had mine for exactly 11 months, using it 8+ hours a day for work. Battery health in the settings app shows 94%. Still easily gets me through a full day without needing a mid-day top up.",
        helpfulVotes: 67,
        notHelpfulVotes: 0,
        isAccepted: false,
        createdAt: "3 weeks ago"
      }
    ],
    relatedQuestions: []
  }
];

export function CommunityQA() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<"Popular" | "Newest" | "Unanswered">("Popular");

  const filteredQuestions = useMemo(() => {
    return MOCK_QUESTIONS.filter(q => {
      if (searchQuery && !q.question.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (activeCategory && q.category !== activeCategory) return false;
      return true;
    }).sort((a, b) => {
      if (activeTab === "Popular") return b.meTooCount - a.meTooCount;
      // Default to returning as is (mock doesn't have deep dates for newest)
      return 0;
    });
  }, [searchQuery, activeCategory, activeTab]);

  return (
    <section className="w-full mt-24 pt-16 border-t border-border">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        
        <div className="flex items-center gap-3 mb-8">
           <MessagesSquare className="w-8 h-8 text-foreground" />
           <h2 className="text-3xl font-bold text-foreground">Community Knowledge Hub</h2>
        </div>

        {/* Top Analytics */}
        <QATrustMetrics 
          totalQuestions={2843}
          answeredPercentage={98}
          averageResponseTime="2.4 hours"
          officialAnswersRate={74}
          communityExpertsCount={128}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Main Q&A Column (Takes 8/12) */}
           <div className="lg:col-span-8 flex flex-col">
              
              <QASearch 
                onSearch={setSearchQuery} 
                categories={MOCK_CATEGORIES} 
                activeCategory={activeCategory} 
                onSelectCategory={setActiveCategory} 
              />

              {/* Tabs */}
              <div className="flex items-center gap-6 border-b border-border mb-6">
                 {(["Popular", "Newest", "Unanswered"] as const).map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 text-sm font-bold transition-colors relative ${
                        activeTab === tab ? "text-cta-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cta-primary" />
                      )}
                    </button>
                 ))}
              </div>

              {/* Question List */}
              <div className="flex flex-col">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map(q => (
                    <QuestionCard key={q.id} question={q} />
                  ))
                ) : (
                  <div className="py-12 text-center bg-surface border border-border rounded-2xl">
                     <p className="text-foreground font-bold mb-2">No questions found</p>
                     <p className="text-sm text-muted-foreground mb-4">Be the first to ask about "{searchQuery || activeCategory}"</p>
                     <button className="px-6 py-2.5 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-colors">
                        Ask Question
                     </button>
                  </div>
                )}
              </div>
              
              {filteredQuestions.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <button className="px-6 py-3 rounded-xl border border-border bg-surface font-bold text-foreground hover:bg-surface-hover transition-colors">
                    Load More Questions
                  </button>
                </div>
              )}
           </div>

           {/* Sidebar Column (Takes 4/12) */}
           <div className="lg:col-span-4 flex flex-col gap-8">
              <ProductManuals />
              
              {/* Need Help CTA */}
              <div className="bg-gradient-to-br from-cta-primary/20 to-transparent border border-cta-primary/30 rounded-2xl p-6 relative overflow-hidden">
                 <h3 className="text-lg font-bold text-foreground mb-2 relative z-10">Still need help?</h3>
                 <p className="text-sm text-muted-foreground mb-6 relative z-10">Our product experts are available 24/7 to answer any technical questions you might have.</p>
                 <button className="w-full py-3 bg-cta-primary text-cta-primary-foreground font-bold rounded-xl relative z-10 shadow-glow-primary">
                    Contact Support
                 </button>
              </div>
           </div>

        </div>

      </div>
    </section>
  );
}
