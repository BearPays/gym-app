"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

type Exercise = {
  id: string;
  name: string;
  category?: string;
  sets: Set[];
};

type Set = {
  id: string;
  reps: number;
  weight: number;
};

type DBExercise = {
  id: string;
  name: string;
  category: string;
  primaryMuscles: string[];
  equipment: string | null;
};

type Template = {
  id: string;
  name: string;
  createdAt: string;
  exercises: Exercise[];
};

export default function EditTemplate({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<DBExercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch template data
        const templateRes = await fetch(`/api/templates/${params.id}`);
        if (!templateRes.ok) {
          throw new Error("Failed to fetch template");
        }
        const templateData = await templateRes.json();
        setTemplate(templateData);
        setTemplateName(templateData.name);
        setExercises(templateData.exercises);
        
        // Fetch available exercises
        const exercisesRes = await fetch("/api/exercises");
        if (!exercisesRes.ok) {
          throw new Error("Failed to fetch exercises");
        }
        const exercisesData = await exercisesRes.json();
        setAvailableExercises(exercisesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        alert("Failed to load template data. Redirecting back to templates.");
        router.push("/templates");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, router, params.id]);

  const handleAddExercise = () => {
    if (!selectedExercise) return;

    const exercise = availableExercises.find(ex => ex.id === selectedExercise);
    if (!exercise) return;

    const newExercise: Exercise = {
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
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
    
    // Make sure the exercise and set exist
    if (updatedExercises[exerciseIndex] && updatedExercises[exerciseIndex].sets[setIndex]) {
      // Create a new set object with the updated field
      updatedExercises[exerciseIndex].sets[setIndex] = {
        ...updatedExercises[exerciseIndex].sets[setIndex],
        [field]: value
      };
      
      setExercises(updatedExercises);
    }
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...exercises];
    if (updatedExercises[exerciseIndex] && updatedExercises[exerciseIndex].sets) {
      updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
      setExercises(updatedExercises);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!templateName || exercises.length === 0) {
      alert("Please provide a template name and add at least one exercise.");
      return;
    }

    // Check if each exercise has at least one set
    const hasEmptyExercises = exercises.some(ex => ex.sets.length === 0);
    if (hasEmptyExercises) {
      alert("Each exercise must have at least one set.");
      return;
    }

    setIsSaving(true);

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
      const response = await fetch(`/api/templates/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        router.push(`/templates/${params.id}`);
      } else {
        const data = await response.json();
        alert(`Failed to update template: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating template:", error);
      alert("Failed to update template due to a network error.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/templates/${params.id}`);
  };

  if (isLoading) {
    return <div className="min-h-screen p-8">Loading template data...</div>;
  }

  if (!template) {
    return <div className="min-h-screen p-8">Template not found</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Workout Template</h1>
      
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
                  {exercise.name} {exercise.category ? `(${exercise.category})` : ''}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddExercise}
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={!selectedExercise}
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
                      <div key={set.id} className="flex gap-3 items-center">
                        <span className="w-10">#{setIndex + 1}</span>
                        <div>
                          <label className="text-xs block">Reps</label>
                          <input
                            type="number"
                            min="1"
                            value={set.reps}
                            onChange={(e) => handleSetChange(
                              exerciseIndex, 
                              setIndex, 
                              "reps", 
                              e.target.value ? parseInt(e.target.value) : 0
                            )}
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
                            onChange={(e) => handleSetChange(
                              exerciseIndex, 
                              setIndex, 
                              "weight", 
                              e.target.value ? parseFloat(e.target.value) : 0
                            )}
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

        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className={`flex-1 p-3 rounded font-medium ${
              isSaving 
                ? "bg-gray-400 text-white cursor-not-allowed" 
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isSaving ? "Saving..." : "Update Template"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 p-3 bg-gray-300 text-gray-800 rounded font-medium hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
