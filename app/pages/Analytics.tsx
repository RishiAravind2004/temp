import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useQuiz } from "../context/QuizContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, BarChart3, TrendingUp, Users, Award, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState } from "react";
import { getScoreColor } from "../utils/helpers";

export function Analytics() {
  const { user } = useAuth();
  const { quizzes, getAttemptsByQuizId } = useQuiz();
  const navigate = useNavigate();
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");

  if (!user || user.role !== "teacher") {
    navigate("/login");
    return null;
  }

  const myQuizzes = quizzes.filter((q) => q.teacherId === user.id);
  const selectedQuiz = selectedQuizId ? myQuizzes.find((q) => q.id === selectedQuizId) : myQuizzes[0];
  const attempts = selectedQuiz ? getAttemptsByQuizId(selectedQuiz.id) : [];

  // Overall statistics
  const totalAttempts = myQuizzes.reduce((sum, q) => sum + getAttemptsByQuizId(q.id).length, 0);
  const allAttempts = myQuizzes.flatMap((q) => getAttemptsByQuizId(q.id));
  const avgScore = allAttempts.length > 0
    ? Math.round(allAttempts.reduce((sum, a) => sum + a.percentage, 0) / allAttempts.length)
    : 0;

  // Score distribution for selected quiz
  const scoreDistribution = [
    { range: "0-20%", count: attempts.filter((a) => a.percentage < 20).length, color: "#ef4444" },
    { range: "20-40%", count: attempts.filter((a) => a.percentage >= 20 && a.percentage < 40).length, color: "#f97316" },
    { range: "40-60%", count: attempts.filter((a) => a.percentage >= 40 && a.percentage < 60).length, color: "#eab308" },
    { range: "60-80%", count: attempts.filter((a) => a.percentage >= 60 && a.percentage < 80).length, color: "#84cc16" },
    { range: "80-100%", count: attempts.filter((a) => a.percentage >= 80).length, color: "#22c55e" },
  ];

  // Quiz performance comparison
  const quizComparison = myQuizzes.map((quiz) => {
    const quizAttempts = getAttemptsByQuizId(quiz.id);
    const avgScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length)
      : 0;
    
    return {
      name: quiz.title.substring(0, 20),
      attempts: quizAttempts.length,
      avgScore,
    };
  });

  // Difficulty analysis
  const difficultyData = [
    {
      difficulty: "Easy",
      quizzes: myQuizzes.filter((q) => q.difficulty === "easy").length,
      avgScore: Math.round(
        myQuizzes
          .filter((q) => q.difficulty === "easy")
          .flatMap((q) => getAttemptsByQuizId(q.id))
          .reduce((sum, a, _, arr) => sum + (arr.length > 0 ? a.percentage / arr.length : 0), 0)
      ),
    },
    {
      difficulty: "Medium",
      quizzes: myQuizzes.filter((q) => q.difficulty === "medium").length,
      avgScore: Math.round(
        myQuizzes
          .filter((q) => q.difficulty === "medium")
          .flatMap((q) => getAttemptsByQuizId(q.id))
          .reduce((sum, a, _, arr) => sum + (arr.length > 0 ? a.percentage / arr.length : 0), 0)
      ),
    },
    {
      difficulty: "Hard",
      quizzes: myQuizzes.filter((q) => q.difficulty === "hard").length,
      avgScore: Math.round(
        myQuizzes
          .filter((q) => q.difficulty === "hard")
          .flatMap((q) => getAttemptsByQuizId(q.id))
          .reduce((sum, a, _, arr) => sum + (arr.length > 0 ? a.percentage / arr.length : 0), 0)
      ),
    },
  ];

  const handleDownloadReport = () => {
    const report = `
QUIZ ANALYTICS REPORT
=====================

Teacher: ${user.name}
Generated: ${new Date().toLocaleString()}

OVERALL STATISTICS
------------------
Total Quizzes: ${myQuizzes.length}
Total Attempts: ${totalAttempts}
Average Score: ${avgScore}%

QUIZ BREAKDOWN
--------------
${myQuizzes.map((quiz) => {
  const attempts = getAttemptsByQuizId(quiz.id);
  const avg = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
    : 0;
  return `${quiz.title}:
  - Attempts: ${attempts.length}
  - Average: ${avg}%
  - Difficulty: ${quiz.difficulty}`;
}).join('\n\n')}

This report provides insights into student performance and quiz effectiveness.
    `;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/teacher")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
                <p className="text-sm text-gray-600">Performance insights and statistics</p>
              </div>
            </div>
            <Button onClick={handleDownloadReport}>
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {myQuizzes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No quizzes to analyze</p>
              <Button onClick={() => navigate("/teacher/create-quiz")}>
                Create Your First Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Total Quizzes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold">{myQuizzes.length}</p>
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Total Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold">{totalAttempts}</p>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>
                      {avgScore}%
                    </p>
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-600">Active Quizzes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold">
                      {myQuizzes.filter((q) => q.isActive).length}
                    </p>
                    <Award className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quiz Performance Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Quiz Performance Comparison</CardTitle>
                <CardDescription>
                  Compare attempts and average scores across your quizzes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={quizComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="attempts" fill="#8884d8" name="Attempts" />
                    <Bar yAxisId="right" dataKey="avgScore" fill="#82ca9d" name="Avg Score %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quiz Selector */}
            {selectedQuiz && (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Detailed Analysis</CardTitle>
                        <CardDescription>Select a quiz to view detailed statistics</CardDescription>
                      </div>
                      <Select
                        value={selectedQuiz.id}
                        onValueChange={setSelectedQuizId}
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {myQuizzes.map((quiz) => (
                            <SelectItem key={quiz.id} value={quiz.id}>
                              {quiz.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Participants</p>
                        <p className="text-2xl font-bold">{attempts.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Average Score</p>
                        <p className={`text-2xl font-bold ${getScoreColor(
                          attempts.length > 0
                            ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
                            : 0
                        )}`}>
                          {attempts.length > 0
                            ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
                            : 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Questions</p>
                        <p className="text-2xl font-bold">{selectedQuiz.questions.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Difficulty</p>
                        <Badge className="text-base capitalize">{selectedQuiz.difficulty}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Score Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Score Distribution</CardTitle>
                    <CardDescription>
                      How students performed in {selectedQuiz.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={scoreDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Students">
                          {scoreDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Difficulty Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Difficulty Level Analysis</CardTitle>
                <CardDescription>
                  Performance breakdown by quiz difficulty
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={difficultyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="difficulty" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="quizzes" fill="#8884d8" name="Number of Quizzes" />
                    <Bar yAxisId="right" dataKey="avgScore" fill="#82ca9d" name="Avg Score %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Performers */}
            {attempts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>
                    Best performances in {selectedQuiz?.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {attempts
                      .sort((a, b) => b.percentage - a.percentage)
                      .slice(0, 5)
                      .map((attempt, index) => (
                        <div
                          key={attempt.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                            </div>
                            <div>
                              <p className="font-semibold">{attempt.studentName}</p>
                              <p className="text-sm text-gray-600">
                                {attempt.score}/{attempt.maxScore} marks
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${getScoreColor(attempt.percentage)}`}>
                              {attempt.percentage}%
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
