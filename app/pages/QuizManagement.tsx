import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useQuiz } from "../context/QuizContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { ArrowLeft, Play, Square, Trash2, QrCode, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { getDifficultyColor, formatDate } from "../utils/helpers";
import { Quiz } from "../types";

export function QuizManagement() {
  const { user } = useAuth();
  const { quizzes, updateQuiz, deleteQuiz } = useQuiz();
  const navigate = useNavigate();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!user || user.role !== "teacher") {
    navigate("/login");
    return null;
  }

  const myQuizzes = quizzes.filter((q) => q.teacherId === user.id);

  const handleToggleActive = (quiz: Quiz) => {
    updateQuiz(quiz.id, { isActive: !quiz.isActive });
    toast.success(quiz.isActive ? "Quiz deactivated" : "Quiz activated");
  };

  const handleStartLive = (quiz: Quiz) => {
    if (!quiz.isActive) {
      toast.error("Please activate the quiz first");
      return;
    }
    updateQuiz(quiz.id, { isLive: true, startedAt: new Date() });
    toast.success("Live quiz started!");
    navigate(`/teacher/live-quiz/${quiz.id}`);
  };

  const handleEndLive = (quiz: Quiz) => {
    updateQuiz(quiz.id, { isLive: false, endedAt: new Date() });
    toast.success("Live quiz ended");
  };

  const handleDelete = (quizId: string) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      deleteQuiz(quizId);
      toast.success("Quiz deleted");
    }
  };

  const handleShowQR = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowQRDialog(true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Room code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getQuizURL = (quiz: Quiz) => {
    return `${window.location.origin}/student/quiz/${quiz.id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/teacher")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quiz Management</h1>
              <p className="text-sm text-gray-600">Activate, publish, and monitor your quizzes</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {myQuizzes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No quizzes created yet</p>
              <Button onClick={() => navigate("/teacher/create-quiz")}>
                Create Your First Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myQuizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{quiz.title}</CardTitle>
                      <CardDescription>{quiz.description}</CardDescription>
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Quiz Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Questions</p>
                        <p className="font-semibold">{quiz.questions.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p className="font-semibold">{quiz.duration || "No"} min</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Network</p>
                        <p className="font-semibold capitalize">{quiz.networkType}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Created</p>
                        <p className="font-semibold">{formatDate(quiz.createdAt)}</p>
                      </div>
                    </div>

                    {/* Room Code */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Room Code</p>
                          <p className="text-2xl font-bold text-blue-600 tracking-wider">
                            {quiz.roomCode}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyCode(quiz.roomCode)}
                          >
                            {copied ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowQR(quiz)}
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-4 items-center justify-between border-t pt-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Activate Quiz:</span>
                        <Switch
                          checked={quiz.isActive}
                          onCheckedChange={() => handleToggleActive(quiz)}
                        />
                      </div>

                      <div className="flex gap-2">
                        {quiz.isLive ? (
                          <>
                            <Button
                              onClick={() => navigate(`/teacher/live-quiz/${quiz.id}`)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Monitor Live
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleEndLive(quiz)}
                            >
                              <Square className="w-4 h-4 mr-2" />
                              End Quiz
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => handleStartLive(quiz)}
                            disabled={!quiz.isActive}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Live
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => handleDelete(quiz.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* QR Code Dialog */}
        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Quiz QR Code</DialogTitle>
              <DialogDescription>
                Students can scan this QR code to join the quiz
              </DialogDescription>
            </DialogHeader>
            {selectedQuiz && (
              <div className="space-y-4">
                <div className="flex justify-center bg-white p-6 rounded-lg">
                  <QRCodeSVG
                    value={getQuizURL(selectedQuiz)}
                    size={256}
                    level="H"
                    includeMargin
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Room Code</p>
                  <p className="text-3xl font-bold text-blue-600 tracking-wider">
                    {selectedQuiz.roomCode}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Quiz URL</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getQuizURL(selectedQuiz)}
                      className="flex-1 px-3 py-2 border rounded text-sm"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(getQuizURL(selectedQuiz));
                        toast.success("URL copied!");
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
