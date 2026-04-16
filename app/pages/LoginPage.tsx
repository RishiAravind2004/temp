import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { GraduationCap, Shield, Users } from "lucide-react";
import { toast } from "sonner";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        toast.success("Login successful!");
        
        // Redirect based on role
        if (email.includes("admin")) {
          navigate("/admin");
        } else if (email.includes("teacher")) {
          navigate("/teacher");
        } else {
          navigate("/student");
        }
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (role: "admin" | "teacher" | "student") => {
    let demoEmail = "";
    if (role === "admin") demoEmail = "admin@quiz.com";
    if (role === "teacher") demoEmail = "teacher@quiz.com";
    if (role === "student") demoEmail = "student@quiz.com";
    
    setEmail(demoEmail);
    setPassword("demo123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center md:text-left space-y-6">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="bg-blue-600 p-3 rounded-xl">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">QuizMaster</h1>
              <p className="text-sm text-gray-600">AI-Powered Quiz Platform</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              AI-Driven Quiz System with Blockchain Security
            </h2>
            <p className="text-gray-600">
              Create, manage, and evaluate quizzes with artificial intelligence.
              Results secured with blockchain technology for tamper-proof verification.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Blockchain Secured</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <GraduationCap className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">AI Evaluation</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-xs text-gray-600">Real-time Quiz</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Demo Accounts</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin("admin")}
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin("teacher")}
                >
                  Teacher
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin("student")}
                >
                  Student
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
