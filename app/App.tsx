import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { QuizProvider } from "./context/QuizContext";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <AuthProvider>
      <QuizProvider>
        <RouterProvider router={router} />
        <Toaster />
      </QuizProvider>
    </AuthProvider>
  );
}

export default App;
