export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export type QuestionType = "mcq" | "descriptive" | "coding";
export type DifficultyLevel = "easy" | "medium" | "hard";

export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: MCQOption[]; // For MCQ
  correctAnswer?: string; // For descriptive/coding
  marks: number;
  difficulty: DifficultyLevel;
  timeLimit?: number; // in seconds, optional per-question timer
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  questions: Question[];
  duration?: number; // Total quiz duration in minutes
  difficulty: DifficultyLevel;
  isActive: boolean;
  isLive: boolean;
  networkType: "local" | "public";
  roomCode: string;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
}

export interface StudentAnswer {
  questionId: string;
  answer: string;
  timeSpent: number; // in seconds
  submittedAt: Date;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  answers: StudentAnswer[];
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: Date;
  evaluationStatus: "pending" | "evaluated";
  feedback?: string;
  blockchainHash?: string;
}

export interface BlockchainBlock {
  index: number;
  timestamp: Date;
  data: QuizAttempt;
  previousHash: string;
  hash: string;
  nonce: number;
}

export interface LeaderboardEntry {
  studentId: string;
  studentName: string;
  score: number;
  percentage: number;
  rank: number;
  submittedAt: Date;
}

export interface AIQuestionRequest {
  topic: string;
  difficulty: DifficultyLevel;
  questionType: QuestionType;
  count: number;
}

export interface AIEvaluationRequest {
  question: string;
  studentAnswer: string;
  correctAnswer?: string;
  maxMarks: number;
}

export interface AIEvaluationResponse {
  marks: number;
  feedback: string;
  suggestions: string[];
}
