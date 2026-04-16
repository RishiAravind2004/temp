import React, { createContext, useContext, useState, useEffect } from "react";
import { Quiz, QuizAttempt, Question, DifficultyLevel, QuestionType } from "../types";
import { generateRoomCode } from "../utils/helpers";

interface QuizContextType {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  createQuiz: (quiz: Omit<Quiz, "id" | "roomCode" | "createdAt">) => Quiz;
  updateQuiz: (quizId: string, updates: Partial<Quiz>) => void;
  deleteQuiz: (quizId: string) => void;
  submitQuizAttempt: (attempt: Omit<QuizAttempt, "id" | "blockchainHash">) => QuizAttempt;
  getQuizById: (quizId: string) => Quiz | undefined;
  getQuizByRoomCode: (roomCode: string) => Quiz | undefined;
  getAttemptsByQuizId: (quizId: string) => QuizAttempt[];
  getAttemptsByStudentId: (studentId: string) => QuizAttempt[];
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    // Load from localStorage
    const storedQuizzes = localStorage.getItem("quizzes");
    const storedAttempts = localStorage.getItem("quizAttempts");
    
    if (storedQuizzes) {
      setQuizzes(JSON.parse(storedQuizzes));
    } else {
      // Initialize with sample quizzes
      const sampleQuizzes = createSampleQuizzes();
      setQuizzes(sampleQuizzes);
      localStorage.setItem("quizzes", JSON.stringify(sampleQuizzes));
    }
    
    if (storedAttempts) {
      setAttempts(JSON.parse(storedAttempts));
    }
  }, []);

  const createQuiz = (quizData: Omit<Quiz, "id" | "roomCode" | "createdAt">): Quiz => {
    const newQuiz: Quiz = {
      ...quizData,
      id: `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      roomCode: generateRoomCode(),
      createdAt: new Date(),
    };

    const updatedQuizzes = [...quizzes, newQuiz];
    setQuizzes(updatedQuizzes);
    localStorage.setItem("quizzes", JSON.stringify(updatedQuizzes));
    
    return newQuiz;
  };

  const updateQuiz = (quizId: string, updates: Partial<Quiz>) => {
    const updatedQuizzes = quizzes.map((quiz) =>
      quiz.id === quizId ? { ...quiz, ...updates } : quiz
    );
    setQuizzes(updatedQuizzes);
    localStorage.setItem("quizzes", JSON.stringify(updatedQuizzes));
  };

  const deleteQuiz = (quizId: string) => {
    const updatedQuizzes = quizzes.filter((quiz) => quiz.id !== quizId);
    setQuizzes(updatedQuizzes);
    localStorage.setItem("quizzes", JSON.stringify(updatedQuizzes));
  };

  const submitQuizAttempt = (attemptData: Omit<QuizAttempt, "id" | "blockchainHash">): QuizAttempt => {
    const newAttempt: QuizAttempt = {
      ...attemptData,
      id: `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      blockchainHash: generateBlockchainHash(attemptData),
    };

    const updatedAttempts = [...attempts, newAttempt];
    setAttempts(updatedAttempts);
    localStorage.setItem("quizAttempts", JSON.stringify(updatedAttempts));
    
    return newAttempt;
  };

  const getQuizById = (quizId: string) => {
    return quizzes.find((quiz) => quiz.id === quizId);
  };

  const getQuizByRoomCode = (roomCode: string) => {
    return quizzes.find((quiz) => quiz.roomCode === roomCode);
  };

  const getAttemptsByQuizId = (quizId: string) => {
    return attempts.filter((attempt) => attempt.quizId === quizId);
  };

  const getAttemptsByStudentId = (studentId: string) => {
    return attempts.filter((attempt) => attempt.studentId === studentId);
  };

  return (
    <QuizContext.Provider
      value={{
        quizzes,
        attempts,
        createQuiz,
        updateQuiz,
        deleteQuiz,
        submitQuizAttempt,
        getQuizById,
        getQuizByRoomCode,
        getAttemptsByQuizId,
        getAttemptsByStudentId,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
};

// Helper function to generate blockchain hash
function generateBlockchainHash(data: any): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

// Create sample quizzes for demo
function createSampleQuizzes(): Quiz[] {
  return [
    {
      id: "quiz-sample-1",
      title: "JavaScript Fundamentals",
      description: "Test your knowledge of core JavaScript concepts",
      teacherId: "teacher-1",
      teacherName: "John Smith",
      difficulty: "medium",
      duration: 30,
      isActive: true,
      isLive: false,
      networkType: "local",
      roomCode: generateRoomCode(),
      createdAt: new Date("2024-04-10"),
      questions: [
        {
          id: "q1",
          type: "mcq",
          question: "What is the output of: console.log(typeof null)?",
          options: [
            { id: "o1", text: "null", isCorrect: false },
            { id: "o2", text: "object", isCorrect: true },
            { id: "o3", text: "undefined", isCorrect: false },
            { id: "o4", text: "number", isCorrect: false },
          ],
          marks: 2,
          difficulty: "easy",
        },
        {
          id: "q2",
          type: "descriptive",
          question: "Explain the difference between let, const, and var in JavaScript.",
          correctAnswer: "let and const are block-scoped, var is function-scoped. const cannot be reassigned.",
          marks: 5,
          difficulty: "medium",
        },
        {
          id: "q3",
          type: "coding",
          question: "Write a function to reverse a string in JavaScript.",
          correctAnswer: "function reverseString(str) { return str.split('').reverse().join(''); }",
          marks: 10,
          difficulty: "medium",
        },
      ],
    },
    {
      id: "quiz-sample-2",
      title: "Data Structures & Algorithms",
      description: "Advanced DSA concepts and problem solving",
      teacherId: "teacher-1",
      teacherName: "John Smith",
      difficulty: "hard",
      duration: 60,
      isActive: true,
      isLive: false,
      networkType: "public",
      roomCode: generateRoomCode(),
      createdAt: new Date("2024-04-12"),
      questions: [
        {
          id: "q4",
          type: "mcq",
          question: "What is the time complexity of binary search?",
          options: [
            { id: "o5", text: "O(n)", isCorrect: false },
            { id: "o6", text: "O(log n)", isCorrect: true },
            { id: "o7", text: "O(n²)", isCorrect: false },
            { id: "o8", text: "O(1)", isCorrect: false },
          ],
          marks: 2,
          difficulty: "medium",
        },
        {
          id: "q5",
          type: "coding",
          question: "Implement a function to detect a cycle in a linked list.",
          correctAnswer: "Use Floyd's cycle detection algorithm (tortoise and hare)",
          marks: 15,
          difficulty: "hard",
        },
      ],
    },
  ];
}
