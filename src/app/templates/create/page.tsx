"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

type Exercise = {
  id: string;
  name: string;
  sets: Set[];
};

type Set = {
  id: string;
  reps: number;
  weight: number;
};

export default function CreateTemplate() {
  const [templateName, setTemplateName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<{ id: string; name: string }[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Fetch available exercises from API, using mock data for now
    setAvailableExercises([
      { id: "1", name: "Bench Press" },
      { id: "2", name: "Squats" },
      { id: "3", name: "Deadlift" },
      { id: "4", name: "Pull Up" },
      { id: "5", name: "Push Up" },
    ]);
  }, [isAuthenticated, router]);

  const handleAddExercise = () => {
    if (!selectedExercise) return;

    const exercise = availableExercises.find(ex => ex.id === selectedExercise);
    if (!exercise) return;

    const newExercise: Exercise = {
      id: exercise.id,
      name: exercise.name,
      sets: []
    };

    setExercises([...exercises, newExercise]);
    setSelectedExercise("");
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.push({
      id: Date.now().toString(),
      reps: 10,
      weight: 20
    });
    setExercises(updatedExercises);
  };

  const handleSetChange = (exerciseIndex: number, setIndex: number, field: keyof Set, value: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updatedExercises);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(updatedExercises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!templateName || exercises.length === 0) {
      alert("Please provide a template name and add at least one exercise.");
      return;
    }

    const templateData = {
      name: templateName,
      exercises: exercises.map(exercise => ({
        id: exercise.id,
        sets: exercise.sets.map(set => ({
          reps: set.reps,
          weight: set.weight
        }))
      }))
    };

    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        router.push("/templates");
      } else {
        alert("Failed to create template.");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      // For demo, just redirect back to templates
      router.push("/templates");
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Create Workout Template</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="templateName" className="block mb-2 text-sm font-medium">
            Template Name
          </label>
          <input
            id="templateName"
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl mb-4">Exercises</h2>
          
          <div className="flex gap-2 mb-4">
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded"
            >
              <option value="">Select Exercise</option>
              {availableExercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddExercise}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Exercise
            </button>
          </div>

          {exercises.length === 0 ? (
            <p className="text-center py-4 border border-dashed border-gray-300 rounded">
              No exercises added yet. Select an exercise above.
            </p>
          ) : (
            <div className="space-y-6">
              {exercises.map((exercise, exerciseIndex) => (
                <div key={exerciseIndex} className="border border-gray-300 rounded p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">{exercise.name}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(exerciseIndex)}
                      className="text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Sets */}
                  <div className="space-y-3">
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="flex gap-3 items-center">
                        <span className="w-10">#{setIndex + 1}</span>
                        <div>
                          <label className="text-xs block">Reps</label>
                          <input
                            type="number"
                            min="1"
                            value={set.reps}
                            onChange={(e) => handleSetChange(exerciseIndex, setIndex, "reps", parseInt(e.target.value))}
                            className="w-20 p-1 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="text-xs block">Weight (kg)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={set.weight}
                            onChange={(e) => handleSetChange(exerciseIndex, setIndex, "weight", parseFloat(e.target.value))}
                            className="w-20 p-1 border border-gray-300 rounded"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                          className="text-red-600 text-sm ml-auto"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddSet(exerciseIndex)}
                    className="mt-3 text-blue-600 text-sm"
                  >
                    + Add Set
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded font-medium hover:bg-blue-700"
          >
            Save Template
          </button>
        </div>
      </form>
    </div>
  );
}
