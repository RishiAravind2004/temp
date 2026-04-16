import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useQuiz } from "../context/QuizContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { ArrowLeft, Users, Trophy, Clock, Square, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { LeaderboardEntry } from "../types";
import { getScoreColor } from "../utils/helpers";

export function LiveQuiz() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const { getQuizById, getAttemptsByQuizId, updateQuiz } = useQuiz();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const quiz = quizId ? getQuizById(quizId) : null;
  const attempts = quizId ? getAttemptsByQuizId(quizId) : [];

  useEffect(() => {
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!user || user.role !== "teacher") {
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
            <Button onClick={() => navigate("/teacher")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEndQuiz = () => {
    if (confirm("Are you sure you want to end this live quiz?")) {
      updateQuiz(quiz.id, { isLive: false, endedAt: new Date() });
      toast.success("Quiz ended successfully");
      navigate("/teacher");
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    toast.success("Refreshed");
  };

  // Calculate leaderboard
  const leaderboard: LeaderboardEntry[] = attempts
    .map((attempt, index) => ({
      studentId: attempt.studentId,
      studentName: attempt.studentName,
      score: attempt.score,
      percentage: attempt.percentage,
      rank: 0, // Will be calculated
      submittedAt: attempt.submittedAt,
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  const stats = {
    totalParticipants: attempts.length,
    averageScore: attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
      : 0,
    highestScore: attempts.length > 0
      ? Math.max(...attempts.map((a) => a.percentage))
      : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/teacher")}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{quiz.title}</h1>
                  <Badge variant="destructive" className="animate-pulse bg-white text-red-600">
                    LIVE
                  </Badge>
                </div>
                <p className="text-sm text-white/80">{quiz.description}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleEndQuiz}
              className="bg-white text-red-600 hover:bg-white/90"
            >
              <Square className="w-4 h-4 mr-2" />
              End Quiz
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">{stats.totalParticipants}</p>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>
                  {stats.averageScore}%
                </p>
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Highest Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className={`text-3xl font-bold ${getScoreColor(stats.highestScore)}`}>
                  {stats.highestScore}%
                </p>
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Quiz Information</CardTitle>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Room Code</p>
                <p className="text-2xl font-bold text-blue-600 tracking-wider">{quiz.roomCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Questions</p>
                <p className="text-lg font-semibold">{quiz.questions.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-semibold">{quiz.duration || "No"} min</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Difficulty</p>
                <p className="text-lg font-semibold capitalize">{quiz.difficulty}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Live Leaderboard
            </CardTitle>
            <CardDescription>
              Real-time rankings updated automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No submissions yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Waiting for students to submit their answers...
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry) => (
                    <TableRow key={entry.studentId}>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {entry.rank === 1 ? (
                            <span className="text-2xl">🥇</span>
                          ) : entry.rank === 2 ? (
                            <span className="text-2xl">🥈</span>
                          ) : entry.rank === 3 ? (
                            <span className="text-2xl">🥉</span>
                          ) : (
                            <span className="font-semibold text-gray-600">#{entry.rank}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{entry.studentName}</TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {entry.score}/{quiz.questions.reduce((sum, q) => sum + q.marks, 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${getScoreColor(entry.percentage)}`}>
                          {entry.percentage}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="w-full max-w-xs">
                          <Progress value={entry.percentage} className="h-2" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
