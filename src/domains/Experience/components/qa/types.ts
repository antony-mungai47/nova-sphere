export interface QAAuthor {
  id: string;
  name: string;
  role: "customer" | "seller" | "expert" | "moderator";
  isVerifiedBuyer: boolean;
  badges: string[]; // e.g. "Top Contributor", "Expert"
}

export interface AnswerDTO {
  id: string;
  questionId: string;
  author: QAAuthor;
  content: string;
  media?: { type: "image" | "video"; url: string }[];
  helpfulVotes: number;
  notHelpfulVotes: number;
  isAccepted: boolean; // Pinned to top
  createdAt: string;
}

export interface QuestionDTO {
  id: string;
  question: string;
  author: QAAuthor;
  createdAt: string;
  category: string;
  meTooCount: number;
  views: number;
  status: "answered" | "unanswered";
  acceptedAnswerId?: string;
  answers: AnswerDTO[];
  relatedQuestions: { id: string; question: string }[];
}
