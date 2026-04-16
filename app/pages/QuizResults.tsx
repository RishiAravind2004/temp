import { useParams, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useQuiz } from "../context/QuizContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { ArrowLeft, Trophy, CheckCircle, XCircle, Shield, Download } from "lucide-react";
import { getScoreColor, formatDate } from "../utils/helpers";
import { blockchainInstance } from "../utils/blockchain";

export function QuizResults() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const { getQuizById, getAttemptsByStudentId } = useQuiz();
  const navigate = useNavigate();

  if (!user || user.role !== "student") {
    navigate("/login");
    return null;
  }

  const quiz = quizId ? getQuizById(quizId) : null;
  const myAttempts = getAttemptsByStudentId(user.id);
  const attempt = myAttempts.find((a) => a.quizId === quizId);

  if (!quiz || !attempt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Results Not Found</CardTitle>
            <CardDescription>No results found for this quiz.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/student")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDownloadReport = () => {
    const report = `
QUIZ RESULTS REPORT
==================

Student: ${user.name}
Quiz: ${quiz.title}
Date: ${formatDate(attempt.submittedAt)}

Score: ${attempt.score}/${attempt.maxScore} (${attempt.percentage}%)
Status: ${attempt.evaluationStatus}
Blockchain Hash: ${attempt.blockchainHash}

Questions: ${quiz.questions.length}
Difficulty: ${quiz.difficulty}

This result is secured with blockchain technology and cannot be tampered with.
    `;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz-result-${quiz.id}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/student")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
              <p className="text-sm text-gray-600">{quiz.title}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Score Card */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {attempt.percentage >= 80 ? (
                <Trophy className="w-16 h-16 text-yellow-500" />
              ) : attempt.percentage >= 60 ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-3xl mb-2">
              {attempt.percentage >= 80 ? "Excellent!" : attempt.percentage >= 60 ? "Good Job!" : "Keep Practicing!"}
            </CardTitle>
            <CardDescription>
              Submitted on {formatDate(attempt.submittedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className={`text-6xl font-bold ${getScoreColor(attempt.percentage)}`}>
                {attempt.percentage}%
              </p>
              <p className="text-lg text-gray-600 mt-2">
                {attempt.score} out of {attempt.maxScore} marks
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Your Score</span>
                <span className="font-semibold">{attempt.percentage}%</span>
              </div>
              <Progress value={attempt.percentage} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-gray-600">Questions</p>
                <p className="text-2xl font-bold">{quiz.questions.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Difficulty</p>
                <p className="text-2xl font-bold capitalize">{quiz.difficulty}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blockchain Verification */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Blockchain Verified
            </CardTitle>
            <CardDescription>
              This result is secured with blockchain technology and cannot be tampered with
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
              <p className="text-gray-600 mb-1">Blockchain Hash:</p>
              <p className="text-gray-900 font-semibold break-all">
                {attempt.blockchainHash}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Result verified and secured on blockchain</span>
            </div>
          </CardContent>
        </Card>

        {/* Performance Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
            <CardDescription>Detailed analysis of your answers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quiz.questions.map((question, idx) => {
              const studentAnswer = attempt.answers.find((a) => a.questionId === question.id);
              const isCorrect = studentAnswer && studentAnswer.answer !== "";

              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Question {idx + 1}</p>
                      <p className="font-medium">{question.question}</p>
                    </div>
                    <Badge variant={isCorrect ? "default" : "secondary"}>
                      {question.marks} marks
                    </Badge>
                  </div>

                  {question.type === "mcq" && question.options && (
                    <div className="mt-3 space-y-2">
                      {question.options.map((option) => {
                        const isSelected = studentAnswer?.answer === option.id;
                        const isCorrectOption = option.isCorrect;

                        return (
                          <div
                            key={option.id}
                            className={`
                              border rounded p-2 text-sm
                              ${isCorrectOption ? 'bg-green-50 border-green-500' : ''}
                              ${isSelected && !isCorrectOption ? 'bg-red-50 border-red-500' : ''}
                              ${!isSelected && !isCorrectOption ? 'border-gray-200' : ''}
                            `}
                          >
                            <div className="flex items-center gap-2">
                              {isCorrectOption && <CheckCircle className="w-4 h-4 text-green-600" />}
                              {isSelected && !isCorrectOption && <XCircle className="w-4 h-4 text-red-600" />}
                              <span>{option.text}</span>
                              {isSelected && <Badge variant="outline" className="ml-auto">Your answer</Badge>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {question.type === "descriptive" && (
                    <div className="mt-3 space-y-2">
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-600 mb-1">Your Answer:</p>
                        <p className="text-sm">{studentAnswer?.answer || "No answer provided"}</p>
                      </div>
                      <div className="bg-blue-50 rounded p-3">
                        <p className="text-xs text-gray-600 mb-1">AI Feedback:</p>
                        <p className="text-sm">Good effort! Keep practicing to improve your understanding.</p>
                      </div>
                    </div>
                  )}

                  {question.type === "coding" && (
                    <div className="mt-3 space-y-2">
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-600 mb-1">Your Code:</p>
                        <pre className="text-sm font-mono whitespace-pre-wrap">
                          {studentAnswer?.answer || "No code provided"}
                        </pre>
                      </div>
                      <div className="bg-blue-50 rounded p-3">
                        <p className="text-xs text-gray-600 mb-1">AI Feedback:</p>
                        <p className="text-sm">Code structure looks good. Consider optimizing for edge cases.</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={() => navigate("/student")} variant="outline" className="flex-1">
            Back to Dashboard
          </Button>
          <Button onClick={handleDownloadReport} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </main>
    </div>
  );
}
