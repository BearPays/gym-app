"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface UserStats {
  finishedWorkouts: number;
  createdTemplates: number;
  favoriteExercise: {
    name: string;
    count: number;
  } | null;
}

export default function User() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Fetch user statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (isAuthenticated) {
        try {
          const res = await fetch("/api/user/stats");
          if (res.ok) {
            const data = await res.json();
            setStats(data);
          }
        } catch (error) {
          console.error("Failed to fetch stats:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchStats();
  }, [isAuthenticated]);

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Dashboard Stats */}
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-xl font-semibold">Finished Workouts</p>
          <p className="text-3xl text-blue-600 mt-2">{stats?.finishedWorkouts || 0}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-xl font-semibold">Created Templates</p>
          <p className="text-3xl text-green-600 mt-2">{stats?.createdTemplates || 0}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-xl font-semibold">Most Performed Exercise</p>
          {stats?.favoriteExercise ? (
            <>
              <p className="text-3xl text-purple-600 mt-2">{stats.favoriteExercise.name}</p>
              <p className="text-sm text-gray-500">Performed {stats.favoriteExercise.count} times</p>
            </>
          ) : (
            <p className="text-gray-500 mt-2">No exercises recorded yet</p>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">User Profile</h2>
        <div className="mb-4">
          <h3 className="font-medium">Name:</h3>
          <p>{user.name}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-medium">Email:</h3>
          <p>{user.email}</p>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
