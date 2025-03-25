"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

// Let's extract the form into a component for better organization
interface AuthFormProps {
  isLogin: boolean;
  isSubmitting: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  name: string;
  setName: (name: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onToggleMode: () => void;
  onGuestLogin: () => void;
}

const AuthForm = ({ 
  isLogin, 
  isSubmitting, 
  email, 
  setEmail, 
  password, 
  setPassword, 
  name, 
  setName, 
  onSubmit, 
  onToggleMode, 
  onGuestLogin 
}: AuthFormProps) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {!isLogin && (
        <Input
          id="name"
          label="Name"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required={!isLogin}
          className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
        />
      )}

      <Input
        id="email"
        type="email"
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
      />
      
      <Input
        id="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
      />

      <Button 
        type="submit" 
        fullWidth 
        className="mt-4 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Processing..." : (isLogin ? "Log In" : "Create Account")}
      </Button>
      
      {isLogin ? (
        <div className="mt-4 space-y-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onToggleMode}
            fullWidth
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Create New Account
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onGuestLogin}
            fullWidth
            className="border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Continue as Guest
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="secondary"
          onClick={onToggleMode}
          fullWidth
          className="mt-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Back to Login
        </Button>
      )}
    </form>
  );
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push("/user");
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized) {
    return null;
  }

  interface LoginForm {
    email: string;
    password: string;
    action: "login";
  }

  interface RegisterForm {
    email: string;
    password: string;
    name: string;
    action: "register";
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLogin) {
        // 1) LOGIN
        const loginData: LoginForm = { email, password, action: "login" };

        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
          credentials: 'include', // Important: include cookies in the request/response
        });

        if (res.ok) {
          const data = await res.json();
          // The session cookie is set by the server
          // We just need to update the UI state
          login({ 
            email: data.user.email, 
            name: data.user.name || email.split('@')[0] 
          });
          router.push("/user");
        } else {
          const errorData = await res.json();
          alert(errorData.error || "Login failed");
        }
      } else {
        // 2) REGISTER
        const registerData: RegisterForm = { email, password, name, action: "register" };

        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registerData),
          credentials: 'include', // Important: include cookies in the request/response
        });

        if (res.ok) {
          const data = await res.json();
          // The session cookie is set by the server
          login({ 
            email: data.user.email, 
            name: data.user.name 
          });
          router.push("/user");
        } else {
          const errorData = await res.json();
          alert(errorData.error || "Registration failed");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      alert("An error occurred during authentication. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "guestLogin" }),
        credentials: 'include', // Important: include cookies in the request/response
      });
      
      if (res.ok) {
        const data = await res.json();
        // The session cookie is set by the server
        login({ 
          email: data.user.email, 
          name: data.user.name || 'Guest' 
        });
        router.push("/user");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Guest login failed");
      }
    } catch (error) {
      console.error("Guest login error:", error);
      alert("An error occurred during guest login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            {isLogin ? "Welcome Back" : "Create Your Account"}
          </h1>
          
          <AuthForm
            isLogin={isLogin}
            isSubmitting={isSubmitting}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            name={name}
            setName={setName}
            onSubmit={handleSubmit}
            onToggleMode={() => setIsLogin(!isLogin)}
            onGuestLogin={handleGuestLogin}
          />
        </div>
      </Card>
    </div>
  );
}