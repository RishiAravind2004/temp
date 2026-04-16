import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useQuiz } from "../context/QuizContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Plus, Trash2, Sparkles, Upload, Loader2 } from "lucide-react";
import { Question, QuestionType, DifficultyLevel, MCQOption } from "../types";
import { AIService } from "../utils/ai";
import { toast } from "sonner";

export function CreateQuiz() {
  const { user } = useAuth();
  const { createQuiz } = useQuiz();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium");
  const [duration, setDuration] = useState(30);
  const [networkType, setNetworkType] = useState<"local" | "public">("local");
  const [questions, setQuestions] = useState<Question[]>([]);

  // AI Generation State
  const [aiTopic, setAiTopic] = useState("");
  const [aiQuestionType, setAiQuestionType] = useState<QuestionType>("mcq");
  const [aiDifficulty, setAiDifficulty] = useState<DifficultyLevel>("medium");
  const [aiCount, setAiCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  // PDF Upload State
  const [pdfText, setPdfText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Manual Question State
  const [manualQuestion, setManualQuestion] = useState({
    type: "mcq" as QuestionType,
    question: "",
    options: [
      { id: "1", text: "", isCorrect: false },
      { id: "2", text: "", isCorrect: false },
      { id: "3", text: "", isCorrect: false },
      { id: "4", text: "", isCorrect: false },
    ],
    correctAnswer: "",
    marks: 2,
    difficulty: "medium" as DifficultyLevel,
  });

  if (!user || user.role !== "teacher") {
    navigate("/login");
    return null;
  }

  const handleGenerateAI = async () => {
    if (!aiTopic) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    try {
      const generatedQuestions = await AIService.generateQuestions(
        aiTopic,
        aiDifficulty,
        aiQuestionType,
        aiCount
      );
      setQuestions([...questions, ...generatedQuestions]);
      toast.success(`${generatedQuestions.length} questions generated!`);
      setAiTopic("");
    } catch (error) {
      toast.error("Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProcessPDF = async () => {
    if (!pdfText) {
      toast.error("Please enter text content");
      return;
    }

    setIsProcessing(true);
    try {
      const generatedQuestions = await AIService.generateQuestionsFromText(
        pdfText,
        aiDifficulty,
        aiCount
      );
      setQuestions([...questions, ...generatedQuestions]);
      toast.success(`${generatedQuestions.length} questions generated from content!`);
      setPdfText("");
    } catch (error) {
      toast.error("Failed to process content");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddManualQuestion = () => {
    if (!manualQuestion.question) {
      toast.error("Please enter a question");
      return;
    }

    if (manualQuestion.type === "mcq" && !manualQuestion.options.some(o => o.isCorrect)) {
      toast.error("Please mark at least one option as correct");
      return;
    }

    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: manualQuestion.type,
      question: manualQuestion.question,
      options: manualQuestion.type === "mcq" ? manualQuestion.options : undefined,
      correctAnswer: manualQuestion.type !== "mcq" ? manualQuestion.correctAnswer : undefined,
      marks: manualQuestion.marks,
      difficulty: manualQuestion.difficulty,
    };

    setQuestions([...questions, newQuestion]);
    toast.success("Question added!");

    // Reset form
    setManualQuestion({
      type: "mcq",
      question: "",
      options: [
        { id: "1", text: "", isCorrect: false },
        { id: "2", text: "", isCorrect: false },
        { id: "3", text: "", isCorrect: false },
        { id: "4", text: "", isCorrect: false },
      ],
      correctAnswer: "",
      marks: 2,
      difficulty: "medium",
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleCreateQuiz = () => {
    if (!title || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    const quiz = createQuiz({
      title,
      description,
      teacherId: user.id,
      teacherName: user.name,
      questions,
      duration,
      difficulty,
      isActive: false,
      isLive: false,
      networkType,
    });

    toast.success("Quiz created successfully!");
    navigate("/teacher/quiz-management");
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
              <h1 className="text-2xl font-bold text-gray-900">Create Quiz</h1>
              <p className="text-sm text-gray-600">Build your quiz manually or with AI</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Quiz Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quiz Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., JavaScript Fundamentals"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the quiz"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyLevel)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (min)</Label>
                    <Input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Network</Label>
                    <Select value={networkType} onValueChange={(v) => setNetworkType(v as "local" | "public")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Questions */}
            <Card>
              <CardHeader>
                <CardTitle>Add Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="manual">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="manual">Manual</TabsTrigger>
                    <TabsTrigger value="ai">AI Generate</TabsTrigger>
                    <TabsTrigger value="pdf">Upload Content</TabsTrigger>
                  </TabsList>

                  {/* Manual Tab */}
                  <TabsContent value="manual" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <Select
                        value={manualQuestion.type}
                        onValueChange={(v) => setManualQuestion({ ...manualQuestion, type: v as QuestionType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcq">Multiple Choice</SelectItem>
                          <SelectItem value="descriptive">Descriptive</SelectItem>
                          <SelectItem value="coding">Coding</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Textarea
                        placeholder="Enter your question"
                        value={manualQuestion.question}
                        onChange={(e) => setManualQuestion({ ...manualQuestion, question: e.target.value })}
                      />
                    </div>

                    {manualQuestion.type === "mcq" && (
                      <div className="space-y-2">
                        <Label>Options</Label>
                        {manualQuestion.options.map((option, idx) => (
                          <div key={option.id} className="flex gap-2">
                            <Input
                              placeholder={`Option ${idx + 1}`}
                              value={option.text}
                              onChange={(e) => {
                                const newOptions = [...manualQuestion.options];
                                newOptions[idx].text = e.target.value;
                                setManualQuestion({ ...manualQuestion, options: newOptions });
                              }}
                            />
                            <Button
                              variant={option.isCorrect ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const newOptions = [...manualQuestion.options];
                                newOptions[idx].isCorrect = !newOptions[idx].isCorrect;
                                setManualQuestion({ ...manualQuestion, options: newOptions });
                              }}
                            >
                              {option.isCorrect ? "✓" : "Correct?"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {manualQuestion.type !== "mcq" && (
                      <div className="space-y-2">
                        <Label>Expected Answer/Solution</Label>
                        <Textarea
                          placeholder="Enter the correct answer or solution"
                          value={manualQuestion.correctAnswer}
                          onChange={(e) => setManualQuestion({ ...manualQuestion, correctAnswer: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Marks</Label>
                        <Input
                          type="number"
                          value={manualQuestion.marks}
                          onChange={(e) => setManualQuestion({ ...manualQuestion, marks: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select
                          value={manualQuestion.difficulty}
                          onValueChange={(v) => setManualQuestion({ ...manualQuestion, difficulty: v as DifficultyLevel })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button onClick={handleAddManualQuestion} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </TabsContent>

                  {/* AI Tab */}
                  <TabsContent value="ai" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Topic</Label>
                      <Input
                        placeholder="e.g., JavaScript Arrays"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={aiQuestionType} onValueChange={(v) => setAiQuestionType(v as QuestionType)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mcq">MCQ</SelectItem>
                            <SelectItem value="descriptive">Descriptive</SelectItem>
                            <SelectItem value="coding">Coding</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select value={aiDifficulty} onValueChange={(v) => setAiDifficulty(v as DifficultyLevel)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Count</Label>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={aiCount}
                          onChange={(e) => setAiCount(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <Button onClick={handleGenerateAI} className="w-full" disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  {/* PDF/Text Upload Tab */}
                  <TabsContent value="pdf" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Text Content</Label>
                      <Textarea
                        placeholder="Paste your content here (PDF text or any educational content)"
                        rows={8}
                        value={pdfText}
                        onChange={(e) => setPdfText(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select value={aiDifficulty} onValueChange={(v) => setAiDifficulty(v as DifficultyLevel)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Questions</Label>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={aiCount}
                          onChange={(e) => setAiCount(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <Button onClick={handleProcessPDF} className="w-full" disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Generate Questions
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Questions ({questions.length})</CardTitle>
                <CardDescription>Preview and manage your questions</CardDescription>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No questions added yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {questions.map((q, idx) => (
                      <div key={q.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium text-gray-600">Q{idx + 1}</span>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">
                              {q.type}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveQuestion(idx)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm">{q.question}</p>
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                          <span>{q.marks} marks</span>
                          <span className="capitalize">{q.difficulty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Button onClick={handleCreateQuiz} className="w-full" size="lg">
              Create Quiz
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
