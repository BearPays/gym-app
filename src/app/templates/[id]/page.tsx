"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Set = {
  id: string;
  reps: number;
  weight: number;
};

type Exercise = {
  id: string;
  name: string;
  sets: Set[];
};

type WorkoutTemplate = {
  id: string;
  name: string;
  createdAt: string;
  exercises: Exercise[];
};

export default function TemplateDetail({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState<WorkoutTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchTemplate = async () => {
      try {
        const res = await fetch(`/api/templates/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setTemplate(data);
        } else {
          // Mock data for demo
          setTemplate({
            id: params.id,
            name: params.id === "1" ? "Upper Body Workout" : "Full Body Workout",
            createdAt: new Date().toISOString(),
            exercises: [
              {
                id: "1",
                name: "Bench Press",
                sets: [
                  { id: "1", reps: 10, weight: 60 },
                  { id: "2", reps: 8, weight: 70 },
                  { id: "3", reps: 6, weight: 80 },
                ],
              },
              {
                id: "4",
                name: "Pull Up",
                sets: [
                  { id: "4", reps: 12, weight: 0 },
                  { id: "5", reps: 10, weight: 0 },
                ],
              },
            ],
          });
        }
      } catch (error) {
        console.error("Failed to fetch template details:", error);
        // Mock data for demo
        setTemplate({
          id: params.id,
          name: params.id === "1" ? "Upper Body Workout" : "Full Body Workout",
          createdAt: new Date().toISOString(),
          exercises: [
            {
              id: "1",
              name: "Bench Press",
              sets: [
                { id: "1", reps: 10, weight: 60 },
                { id: "2", reps: 8, weight: 70 },
                { id: "3", reps: 6, weight: 80 },
              ],
            },
            {
              id: "4",
              name: "Pull Up",
              sets: [
                { id: "4", reps: 12, weight: 0 },
                { id: "5", reps: 10, weight: 0 },
              ],
            },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [isAuthenticated, params.id, router]);

  const handleStartWorkout = () => {
    // Here we would create a new workout session based on this template
    // For now, just navigate to the workouts page
    router.push("/workouts");
  };

  if (isLoading) {
    return <div className="min-h-screen p-8">Loading...</div>;
  }

  if (!template) {
    return <div className="min-h-screen p-8">Template not found</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{template.name}</h1>
        <div className="flex gap-2">
          <Link href={`/templates/${params.id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded">
            Edit
          </Link>
          <button 
            onClick={handleStartWorkout} 
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Start Workout
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Created {new Date(template.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6 mt-8">
        {template.exercises.map((exercise) => (
          <div key={exercise.id} className="border border-gray-300 rounded p-4">
            <h3 className="font-medium mb-3">{exercise.name}</h3>

            <table className="w-full">
              <thead>
                <tr className="text-left text-sm">
                  <th className="pb-2 w-16">Set</th>
                  <th className="pb-2">Reps</th>
                  <th className="pb-2">Weight</th>
                </tr>
              </thead>
              <tbody>
                {exercise.sets.map((set, index) => (
                  <tr key={set.id}>
                    <td className="py-2">{index + 1}</td>
                    <td className="py-2">{set.reps}</td>
                    <td className="py-2">{set.weight} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
