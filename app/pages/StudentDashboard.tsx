import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useQuiz } from "../context/QuizContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { LogOut, Trophy, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getDifficultyColor, formatDate, getScoreColor } from "../utils/helpers";

export function StudentDashboard() {
  const { user, logout } = useAuth();
  const { quizzes, attempts, getQuizByRoomCode, getAttemptsByStudentId } = useQuiz();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  if (!user || user.role !== "student") {
    navigate("/login");
    return null;
  }

  const myAttempts = getAttemptsByStudentId(user.id);
  const activeQuizzes = quizzes.filter((q) => q.isActive);
  const liveQuizzes = quizzes.filter((q) => q.isLive);

  const handleJoinQuiz = () => {
    if (!roomCode) {
      toast.error("Please enter a room code");
      return;
    }

    const quiz = getQuizByRoomCode(roomCode.toUpperCase());
    
    if (!quiz) {
      toast.error("Invalid room code");
      return;
    }

    if (!quiz.isActive) {
      toast.error("This quiz is not active");
      return;
    }

    // Check if already attempted
    const alreadyAttempted = myAttempts.some((a) => a.quizId === quiz.id);
    if (alreadyAttempted) {
      toast.error("You have already attempted this quiz");
      navigate(`/student/results/${quiz.id}`);
      return;
    }

    toast.success("Joining quiz...");
    navigate(`/student/quiz/${quiz.id}`);
    setIsJoinDialogOpen(false);
    setRoomCode("");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const stats = {
    totalAttempts: myAttempts.length,
    avgScore: myAttempts.length > 0
      ? Math.round(myAttempts.reduce((sum, a) => sum + a.percentage, 0) / myAttempts.length)
      : 0,
    bestScore: myAttempts.length > 0
      ? Math.max(...myAttempts.map((a) => a.percentage))
      : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-sm text-gray-600">Join quizzes and track your performance</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Student</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Quizzes Attempted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">{stats.totalAttempts}</p>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className={`text-3xl font-bold ${getScoreColor(stats.avgScore)}`}>
                  {stats.avgScore}%
                </p>
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Best Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className={`text-3xl font-bold ${getScoreColor(stats.bestScore)}`}>
                  {stats.bestScore}%
                </p>
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Join Quiz */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Join a Quiz</CardTitle>
            <CardDescription>Enter the room code provided by your teacher</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full">
                  Join Quiz with Room Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Quiz</DialogTitle>
                  <DialogDescription>
                    Enter the 6-character room code
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Enter Room Code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest font-bold"
                  />
                  <Button onClick={handleJoinQuiz} className="w-full">
                    Join Quiz
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Live Quizzes */}
        {liveQuizzes.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Live Quizzes
              </CardTitle>
              <CardDescription>Join these quizzes happening right now</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {liveQuizzes.map((quiz) => {
                  const attempted = myAttempts.some((a) => a.quizId === quiz.id);
                  return (
                    <div
                      key={quiz.id}
                      className="border rounded-lg p-4 bg-red-50 border-red-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{quiz.title}</h3>
                          <p className="text-sm text-gray-600">{quiz.teacherName}</p>
                        </div>
                        <Badge variant="destructive" className="animate-pulse">
                          LIVE
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          {quiz.questions.length} questions · {quiz.duration || "No"} min
                        </div>
                        {attempted ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/student/results/${quiz.id}`)}
                          >
                            View Results
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                          >
                            Join Now
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Quizzes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Quizzes</CardTitle>
            <CardDescription>Active quizzes you can attempt</CardDescription>
          </CardHeader>
          <CardContent>
            {activeQuizzes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No active quizzes available
              </p>
            ) : (
              <div className="space-y-3">
                {activeQuizzes.map((quiz) => {
                  const attempted = myAttempts.some((a) => a.quizId === quiz.id);
                  return (
                    <div
                      key={quiz.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{quiz.title}</h3>
                          <p className="text-sm text-gray-600">{quiz.description}</p>
                        </div>
                        <Badge className={getDifficultyColor(quiz.difficulty)}>
                          {quiz.difficulty}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="text-gray-600">
                          <span>{quiz.questions.length} questions</span>
                          <span className="mx-2">·</span>
                          <span>{quiz.duration || "No"} min</span>
                          <span className="mx-2">·</span>
                          <span>{quiz.teacherName}</span>
                        </div>
                        {attempted ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/student/results/${quiz.id}`)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Completed
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                          >
                            Start Quiz
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attempts */}
        {myAttempts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Results</CardTitle>
              <CardDescription>View your quiz performance history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myAttempts
                  .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                  .slice(0, 5)
                  .map((attempt) => {
                    const quiz = quizzes.find((q) => q.id === attempt.quizId);
                    if (!quiz) return null;
                    
                    return (
                      <div
                        key={attempt.id}
                        className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/student/results/${quiz.id}`)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{quiz.title}</h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(attempt.submittedAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${getScoreColor(attempt.percentage)}`}>
                              {attempt.percentage}%
                            </p>
                            <p className="text-sm text-gray-600">
                              {attempt.score}/{attempt.maxScore}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
