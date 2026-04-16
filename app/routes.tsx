import { createBrowserRouter, Navigate } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import { CreateQuiz } from "./pages/CreateQuiz";
import { QuizManagement } from "./pages/QuizManagement";
import { LiveQuiz } from "./pages/LiveQuiz";
import { TakeQuiz } from "./pages/TakeQuiz";
import { QuizResults } from "./pages/QuizResults";
import { Analytics } from "./pages/Analytics";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/teacher",
    element: <TeacherDashboard />,
  },
  {
    path: "/teacher/create-quiz",
    element: <CreateQuiz />,
  },
  {
    path: "/teacher/quiz-management",
    element: <QuizManagement />,
  },
  {
    path: "/teacher/live-quiz/:quizId",
    element: <LiveQuiz />,
  },
  {
    path: "/teacher/analytics",
    element: <Analytics />,
  },
  {
    path: "/student",
    element: <StudentDashboard />,
  },
  {
    path: "/student/quiz/:quizId",
    element: <TakeQuiz />,
  },
  {
    path: "/student/results/:quizId",
    element: <QuizResults />,
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
