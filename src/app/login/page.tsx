"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

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

    if (isLogin) {
      // 1) LOGIN
      const loginData: LoginForm = { email, password, action: "login" };

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (res.ok) {
        router.push("/user");
      } else {
        alert("Login failed");
      }
    } else {
      // 2) REGISTER
      const registerData: RegisterForm = { email, password, name, action: "register" };

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      if (res.ok) {
        router.push("/user");
      } else {
        alert("Registration failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h1 className="text-2xl">{isLogin ? "Log In" : "Create Account"}</h1>

        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border border-gray-300 rounded"
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border border-gray-300 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border border-gray-300 rounded"
          required
        />

        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          {isLogin ? "Log In" : "Create Account"}
        </button>

        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="p-2 text-blue-500 underline"
        >
          {isLogin ? "Create an account" : "Log in with existing account"}
        </button>
      </form>
    </div>
  );
}