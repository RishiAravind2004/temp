import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useQuiz } from "../context/QuizContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { LogOut, Plus, LayoutDashboard, BarChart3, Eye, Play } from "lucide-react";
import { getDifficultyColor, formatDate } from "../utils/helpers";

export function TeacherDashboard() {
  const { user, logout } = useAuth();
  const { quizzes, getAttemptsByQuizId } = useQuiz();
  const navigate = useNavigate();

  if (!user || user.role !== "teacher") {
    navigate("/login");
    return null;
  }

  const myQuizzes = quizzes.filter((q) => q.teacherId === user.id);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const stats = {
    totalQuizzes: myQuizzes.length,
    activeQuizzes: myQuizzes.filter((q) => q.isActive).length,
    liveQuizzes: myQuizzes.filter((q) => q.isLive).length,
    totalAttempts: myQuizzes.reduce(
      (sum, q) => sum + getAttemptsByQuizId(q.id).length,
      0
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-sm text-gray-600">Manage your quizzes and monitor students</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Teacher</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Total Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">{stats.totalQuizzes}</p>
                <LayoutDashboard className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Active Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">{stats.activeQuizzes}</p>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Live Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">{stats.liveQuizzes}</p>
                <Play className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Total Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">{stats.totalAttempts}</p>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/teacher/create-quiz")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Quiz
              </CardTitle>
              <CardDescription>
                Create a new quiz manually or with AI assistance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/teacher/quiz-management")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Manage Quizzes
              </CardTitle>
              <CardDescription>
                Activate, publish, and manage your quizzes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/teacher/analytics")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics
              </CardTitle>
              <CardDescription>
                View performance reports and insights
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Quizzes */}
        <Card>
          <CardHeader>
            <CardTitle>Your Quizzes</CardTitle>
            <CardDescription>Manage and monitor all your quizzes</CardDescription>
          </CardHeader>
          <CardContent>
            {myQuizzes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No quizzes created yet</p>
                <Button onClick={() => navigate("/teacher/create-quiz")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Quiz
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myQuizzes.map((quiz) => {
                  const attempts = getAttemptsByQuizId(quiz.id);
                  return (
                    <div
                      key={quiz.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{quiz.title}</h3>
                          <p className="text-sm text-gray-600">{quiz.description}</p>
                        </div>
                        <div className="flex gap-2">
                          {quiz.isLive && (
                            <Badge variant="destructive" className="animate-pulse">
                              LIVE
                            </Badge>
                          )}
                          {quiz.isActive && !quiz.isLive && (
                            <Badge variant="default">Active</Badge>
                          )}
                          <Badge className={getDifficultyColor(quiz.difficulty)}>
                            {quiz.difficulty}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span>{quiz.questions.length} questions</span>
                        <span>{quiz.duration || "No"} minutes</span>
                        <span>{attempts.length} attempts</span>
                        <span>Created {formatDate(quiz.createdAt)}</span>
                      </div>

                      <div className="flex gap-2">
                        {quiz.isLive ? (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/teacher/live-quiz/${quiz.id}`)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Monitor Live
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate("/teacher/quiz-management")}
                          >
                            Manage
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate("/teacher/analytics")}
                        >
                          <BarChart3 className="w-4 h-4 mr-1" />
                          View Results
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
