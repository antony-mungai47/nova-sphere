"use client";

import React, { useState } from "react";
import { QuestionDTO } from "./types";
import { AnswerCard } from "./AnswerCard";
import { ThumbsUp, Bell, MessageSquare, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function QuestionCard({ question }: { question: QuestionDTO }) {
  const [hasMeToo, setHasMeToo] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showRelated, setShowRelated] = useState(false);

  // Sort answers so accepted answers are at the top, then by helpful votes
  const sortedAnswers = [...question.answers].sort((a, b) => {
    if (a.isAccepted && !b.isAccepted) return -1;
    if (!a.isAccepted && b.isAccepted) return 1;
    return b.helpfulVotes - a.helpfulVotes;
  });

  return (
    <div className="py-8 border-b border-border">
      
      {/* Question Header */}
      <div className="flex items-start gap-4 mb-6">
         
         {/* Me Too Vote Box */}
         <button 
           onClick={() => setHasMeToo(!hasMeToo)}
           className={`flex flex-col items-center justify-center p-2 rounded-xl min-w-[60px] border transition-colors ${
             hasMeToo ? "bg-cta-primary text-cta-primary-foreground border-cta-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "bg-surface text-muted-foreground border-border hover:bg-surface-hover"
           }`}
         >
           <ThumbsUp className={`w-5 h-5 mb-1 ${hasMeToo ? "fill-cta-primary-foreground" : ""}`} />
           <span className="text-sm font-bold">{question.meTooCount + (hasMeToo ? 1 : 0)}</span>
         </button>

         <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
               <span className="bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  {question.category}
               </span>
               <span className="text-xs text-muted-foreground">{question.createdAt}</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2 leading-tight">
               {question.question}
            </h3>
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
               <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {question.answers.length} Answers</span>
               <button 
                 onClick={() => setIsFollowing(!isFollowing)}
                 className={`flex items-center gap-1.5 hover:text-foreground transition-colors ${isFollowing ? "text-cta-primary" : ""}`}
               >
                 <Bell className={`w-4 h-4 ${isFollowing ? "fill-cta-primary" : ""}`} /> 
                 {isFollowing ? "Following" : "Follow"}
               </button>
            </div>
         </div>
      </div>

      {/* Answers Thread */}
      <div className="pl-[76px]">
        {sortedAnswers.length > 0 ? (
          <div className="flex flex-col">
            {sortedAnswers.map(answer => (
              <AnswerCard key={answer.id} answer={answer} />
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-border border-dashed rounded-2xl p-6 text-center text-muted-foreground text-sm">
             No answers yet. Be the first to answer this question!
          </div>
        )}

        <button className="mt-4 px-6 py-2.5 rounded-xl border border-border bg-surface text-sm font-bold text-foreground hover:bg-surface-hover transition-colors">
          Add an Answer
        </button>

        {/* Related Questions Accordion */}
        {question.relatedQuestions && question.relatedQuestions.length > 0 && (
          <div className="mt-8 border border-border rounded-xl bg-surface overflow-hidden">
             <button 
               onClick={() => setShowRelated(!showRelated)}
               className="w-full px-4 py-3 flex items-center justify-between text-sm font-bold text-foreground hover:bg-surface-hover transition-colors"
             >
               <span>Related Questions</span>
               <motion.div animate={{ rotate: showRelated ? 180 : 0 }}>
                 <ChevronDown className="w-4 h-4 text-muted-foreground" />
               </motion.div>
             </button>
             <AnimatePresence>
                {showRelated && (
                   <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: "auto", opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="overflow-hidden bg-background"
                   >
                      <div className="p-4 flex flex-col gap-3">
                         {question.relatedQuestions.map(rq => (
                            <a key={rq.id} href={`#${rq.id}`} className="text-sm text-cta-primary hover:underline flex items-center gap-2">
                               <MessageSquare className="w-3.5 h-3.5" />
                               {rq.question}
                            </a>
                         ))}
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
