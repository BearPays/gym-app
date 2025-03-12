"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function NavBar() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-full shadow-lg flex items-center justify-around px-10 py-4">
      <Link href="/templates" className="group">
        <div className="flex items-center justify-center px-4 py-2 rounded-full transition-colors group-hover:bg-blue-600 text-white">
          Templates
        </div>
      </Link>
      <Link href="/workouts" className="group">
        <div className="flex items-center justify-center px-4 py-2 rounded-full transition-colors group-hover:bg-blue-600 text-white">
          Workouts
        </div>
      </Link>
      <Link href={isAuthenticated ? "/user" : "/login"} className="group">
        <div className="flex items-center justify-center px-4 py-2 rounded-full transition-colors group-hover:bg-blue-600 text-white">
          {isAuthenticated ? "Account" : "Log In"}
        </div>
      </Link>
    </nav>
  );
}
