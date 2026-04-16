import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: User[] = [
  {
    id: "admin-1",
    email: "admin@quiz.com",
    name: "Admin User",
    role: "admin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "teacher-1",
    email: "teacher@quiz.com",
    name: "John Smith",
    role: "teacher",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "teacher-2",
    email: "teacher2@quiz.com",
    name: "Sarah Johnson",
    role: "teacher",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "student-1",
    email: "student@quiz.com",
    name: "Alice Brown",
    role: "student",
    createdAt: new Date("2024-02-15"),
  },
  {
    id: "student-2",
    email: "student2@quiz.com",
    name: "Bob Wilson",
    role: "student",
    createdAt: new Date("2024-02-16"),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple mock authentication (password is ignored for demo)
    const foundUser = mockUsers.find((u) => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { mockUsers };
