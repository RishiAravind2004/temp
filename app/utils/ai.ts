import { Question, QuestionType, DifficultyLevel, AIEvaluationResponse } from "../types";

// Mock AI service - simulates Gemini API
export class AIService {
  // Simulate AI-generated questions
  static async generateQuestions(
    topic: string,
    difficulty: DifficultyLevel,
    questionType: QuestionType,
    count: number
  ): Promise<Question[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const questions: Question[] = [];
    
    for (let i = 0; i < count; i++) {
      questions.push(this.createMockQuestion(topic, difficulty, questionType, i));
    }

    return questions;
  }

  // Simulate AI-generated questions from PDF/Text
  static async generateQuestionsFromText(
    text: string,
    difficulty: DifficultyLevel,
    count: number
  ): Promise<Question[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const questions: Question[] = [];
    const types: QuestionType[] = ["mcq", "descriptive", "coding"];
    
    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      questions.push(this.createMockQuestion("Uploaded Content", difficulty, type, i));
    }

    return questions;
  }

  // Simulate AI evaluation of descriptive answers
  static async evaluateDescriptiveAnswer(
    question: string,
    studentAnswer: string,
    correctAnswer: string,
    maxMarks: number
  ): Promise<AIEvaluationResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock evaluation logic
    const similarity = this.calculateSimilarity(studentAnswer, correctAnswer);
    const marks = Math.round(similarity * maxMarks);

    return {
      marks,
      feedback: this.generateFeedback(similarity, studentAnswer),
      suggestions: this.generateSuggestions(similarity),
    };
  }

  // Simulate AI evaluation of coding answers
  static async evaluateCodingAnswer(
    question: string,
    studentCode: string,
    expectedOutput: string,
    maxMarks: number
  ): Promise<AIEvaluationResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock code evaluation
    const hasFunction = studentCode.includes("function") || studentCode.includes("=>");
    const hasReturn = studentCode.includes("return");
    const score = (hasFunction ? 0.5 : 0) + (hasReturn ? 0.5 : 0);
    const marks = Math.round(score * maxMarks);

    return {
      marks,
      feedback: this.generateCodeFeedback(hasFunction, hasReturn, studentCode),
      suggestions: [
        "Consider edge cases",
        "Add error handling",
        "Optimize time complexity",
      ],
    };
  }

  // Helper: Create mock question
  private static createMockQuestion(
    topic: string,
    difficulty: DifficultyLevel,
    type: QuestionType,
    index: number
  ): Question {
    const baseMarks = difficulty === "easy" ? 2 : difficulty === "medium" ? 5 : 10;

    if (type === "mcq") {
      return {
        id: `q-${Date.now()}-${index}`,
        type: "mcq",
        question: `${topic} - MCQ Question ${index + 1} (${difficulty})`,
        options: [
          { id: `o1-${index}`, text: "Option A", isCorrect: true },
          { id: `o2-${index}`, text: "Option B", isCorrect: false },
          { id: `o3-${index}`, text: "Option C", isCorrect: false },
          { id: `o4-${index}`, text: "Option D", isCorrect: false },
        ],
        marks: baseMarks,
        difficulty,
      };
    } else if (type === "descriptive") {
      return {
        id: `q-${Date.now()}-${index}`,
        type: "descriptive",
        question: `Explain the key concepts of ${topic} (${difficulty} level)`,
        correctAnswer: `A comprehensive explanation about ${topic}`,
        marks: baseMarks * 2,
        difficulty,
      };
    } else {
      return {
        id: `q-${Date.now()}-${index}`,
        type: "coding",
        question: `Write a program to solve a ${difficulty} problem related to ${topic}`,
        correctAnswer: `// Solution code for ${topic}`,
        marks: baseMarks * 3,
        difficulty,
      };
    }
  }

  // Helper: Calculate similarity (mock)
  private static calculateSimilarity(answer1: string, answer2: string): number {
    const words1 = answer1.toLowerCase().split(/\s+/);
    const words2 = answer2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter((word) => words2.includes(word));
    const similarity = commonWords.length / Math.max(words1.length, words2.length);
    
    return Math.min(similarity * 1.5, 1); // Boost score slightly
  }

  // Helper: Generate feedback
  private static generateFeedback(similarity: number, answer: string): string {
    if (similarity >= 0.8) {
      return "Excellent answer! You've covered all the key points.";
    } else if (similarity >= 0.6) {
      return "Good effort! Your answer covers most important aspects.";
    } else if (similarity >= 0.4) {
      return "Partial understanding shown. Some key concepts are missing.";
    } else {
      return "Your answer needs improvement. Please review the topic.";
    }
  }

  // Helper: Generate suggestions
  private static generateSuggestions(similarity: number): string[] {
    if (similarity >= 0.8) {
      return ["Great work!", "Keep it up!"];
    } else if (similarity >= 0.6) {
      return ["Add more details", "Include examples"];
    } else {
      return ["Review the core concepts", "Practice more", "Ask for help if needed"];
    }
  }

  // Helper: Generate code feedback
  private static generateCodeFeedback(
    hasFunction: boolean,
    hasReturn: boolean,
    code: string
  ): string {
    if (hasFunction && hasReturn) {
      return "Good code structure! Function is properly defined with return statement.";
    } else if (hasFunction) {
      return "Function is defined but missing return statement.";
    } else {
      return "Please define a proper function to solve the problem.";
    }
  }
}
