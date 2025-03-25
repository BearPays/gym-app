"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

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
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 shadow rounded-lg p-4 text-center">
          <p className="text-xl font-semibold dark:text-white">Finished Workouts</p>
          <p className="text-3xl text-blue-600 mt-2">{stats?.finishedWorkouts || 0}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 shadow rounded-lg p-4 text-center">
          <p className="text-xl font-semibold dark:text-white">Created Templates</p>
          <p className="text-3xl text-green-600 mt-2">{stats?.createdTemplates || 0}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 shadow rounded-lg p-4 text-center">
          <p className="text-xl font-semibold dark:text-white">Most Performed Exercise</p>
          {stats?.favoriteExercise ? (
            <>
              <p className="text-3xl text-purple-600 mt-2">{stats.favoriteExercise.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Performed {stats.favoriteExercise.count} times</p>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mt-2">No exercises recorded yet</p>
          )}
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">User Profile</h2>
        <div className="mb-4">
          <h3 className="font-medium dark:text-gray-300">Name:</h3>
          <p className="dark:text-white">{user.name}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-medium dark:text-gray-300">Email:</h3>
          <p className="dark:text-white">{user.email}</p>
        </div>
        <Button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
