import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useQuiz } from "../context/QuizContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Clock, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { StudentAnswer } from "../types";
import { formatDuration } from "../utils/helpers";
import { AIService } from "../utils/ai";

export function TakeQuiz() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const { getQuizById, submitQuizAttempt } = useQuiz();
  const navigate = useNavigate();

  const quiz = quizId ? getQuizById(quizId) : null;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (quiz && quiz.duration) {
      setTimeRemaining(quiz.duration * 60); // Convert to seconds
    }
  }, [quiz]);

  useEffect(() => {
    if (timeRemaining <= 0 && quiz?.duration) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  if (!user || user.role !== "student") {
    navigate("/login");
    return null;
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Quiz Not Found</CardTitle>
            <CardDescription>The quiz you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/student")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      toast.error("Please provide an answer before proceeding");
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      if (!confirm("You haven't answered all questions. Submit anyway?")) {
        return;
      }
    }

    setIsSubmitting(true);
    toast.info("Evaluating your answers...");

    try {
      // Prepare student answers
      const studentAnswers: StudentAnswer[] = quiz.questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || "",
        timeSpent: 30, // Mock time
        submittedAt: new Date(),
      }));

      // Calculate score with AI evaluation
      let totalScore = 0;
      const maxScore = quiz.questions.reduce((sum, q) => sum + q.marks, 0);

      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        const studentAnswer = answers[question.id] || "";

        if (question.type === "mcq") {
          // MCQ - direct evaluation
          const selectedOption = question.options?.find((o) => o.id === studentAnswer);
          if (selectedOption?.isCorrect) {
            totalScore += question.marks;
          }
        } else if (question.type === "descriptive") {
          // Descriptive - AI evaluation
          const evaluation = await AIService.evaluateDescriptiveAnswer(
            question.question,
            studentAnswer,
            question.correctAnswer || "",
            question.marks
          );
          totalScore += evaluation.marks;
        } else if (question.type === "coding") {
          // Coding - AI evaluation
          const evaluation = await AIService.evaluateCodingAnswer(
            question.question,
            studentAnswer,
            question.correctAnswer || "",
            question.marks
          );
          totalScore += evaluation.marks;
        }
      }

      const percentage = Math.round((totalScore / maxScore) * 100);

      // Submit attempt
      const attempt = submitQuizAttempt({
        quizId: quiz.id,
        studentId: user.id,
        studentName: user.name,
        answers: studentAnswers,
        score: totalScore,
        maxScore,
        percentage,
        submittedAt: new Date(),
        evaluationStatus: "evaluated",
      });

      toast.success("Quiz submitted successfully!");
      navigate(`/student/results/${quiz.id}`);
    } catch (error) {
      toast.error("Failed to submit quiz");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            </div>
            {quiz.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className={`text-lg font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatDuration(timeRemaining)}
                </span>
              </div>
            )}
          </div>
          <Progress value={progress} className="mt-3" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">
                  {currentQuestion.question}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{currentQuestion.type.toUpperCase()}</Badge>
                  <Badge variant="secondary">{currentQuestion.marks} marks</Badge>
                  <Badge className="capitalize">{currentQuestion.difficulty}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* MCQ */}
            {currentQuestion.type === "mcq" && currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.id]}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {/* Descriptive */}
            {currentQuestion.type === "descriptive" && (
              <div className="space-y-2">
                <Label htmlFor="descriptive-answer">Your Answer</Label>
                <Textarea
                  id="descriptive-answer"
                  placeholder="Write your answer here..."
                  rows={8}
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                />
              </div>
            )}

            {/* Coding */}
            {currentQuestion.type === "coding" && (
              <div className="space-y-2">
                <Label htmlFor="coding-answer">Your Code</Label>
                <Textarea
                  id="coding-answer"
                  placeholder="Write your code here..."
                  rows={12}
                  className="font-mono text-sm"
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Quiz
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Navigation */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Question Navigator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-2">
              {quiz.questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`
                    aspect-square rounded-lg border-2 font-semibold text-sm
                    ${idx === currentQuestionIndex ? 'border-blue-600 bg-blue-600 text-white' : ''}
                    ${answers[q.id] && idx !== currentQuestionIndex ? 'border-green-600 bg-green-50 text-green-700' : ''}
                    ${!answers[q.id] && idx !== currentQuestionIndex ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50' : ''}
                  `}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
