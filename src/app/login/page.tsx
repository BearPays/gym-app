"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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
        });

        if (res.ok) {
          // For demo purposes, we'll just use the email and a dummy name
          login({ email, name: email.split('@')[0] });
          router.push("/user");
        } else {
          alert("Login failed");
        }
      } else {
        // 2) REGISTER
        const registerData: RegisterForm = { email, password, name, action: "register" };

        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registerData),
        });

        if (res.ok) {
          // For demo purposes
          login({ email, name });
          router.push("/user");
        } else {
          alert("Registration failed");
        }
      }
    } catch {
      // For demo purposes, simulate successful login/registration without backend
      console.log("Simulating successful authentication");
      login({ email, name: name || email.split('@')[0] });
      router.push("/user");
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
      });
      if (res.ok) {
        const data = await res.json();
        login({ email: data.user.email, name: data.user.name });
        router.push("/user");
      } else {
        alert("Guest login failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">{isLogin ? "Log In" : "Create Account"}</h1>

        {!isLogin && (
          <Input
            id="name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required={!isLogin}
          />
        )}

        <Input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button 
          type="submit" 
          fullWidth 
          className="mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : (isLogin ? "Log In" : "Create Account")}
        </Button>
        {isLogin && (
          <p className="text-sm mt-1 w-full">
            <span className="text-gray-600">Not registered? </span>
            <a
              href="#"
              onClick={() => setIsLogin(false)}
              className="text-blue-500 hover:underline"
            >
              Create an account
            </a>{" "}
            or{" "}
            <a
              href="#"
              onClick={handleGuestLogin}
              className="text-blue-500 hover:underline"
            >
              Log in as guest
            </a>
          </p>
        )}
        {!isLogin && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsLogin(true)}
            fullWidth
            className="mt-2"
          >
            Log in with existing account
          </Button>
        )}
      </form>
    </div>
  );
}