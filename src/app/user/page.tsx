"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function User() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Dummy stats for demonstration
  const finishedWorkouts = 12;
  const createdTemplates = 5;
  const favoriteExercises = 8;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Dashboard Stats */}
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-xl font-semibold">Finished Workouts</p>
          <p className="text-3xl text-blue-600 mt-2">{finishedWorkouts}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-xl font-semibold">Created Templates</p>
          <p className="text-3xl text-green-600 mt-2">{createdTemplates}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <p className="text-xl font-semibold">Favorite Exercises</p>
          <p className="text-3xl text-purple-600 mt-2">{favoriteExercises}</p>
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
