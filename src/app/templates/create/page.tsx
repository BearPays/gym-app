"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import ExerciseForm from "@/components/exercise/ExerciseForm";
import ExercisePicker, { ExercisePickerOption } from "@/components/exercise/ExercisePicker";

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

export default function CreateTemplate() {
  const [templateName, setTemplateName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Set loading state while checking authentication
    setIsLoading(true);
    if (isAuthenticated !== null) {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, router]);

  const handleAddExercise = (exercise: ExercisePickerOption) => {
    const newExercise: Exercise = {
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      sets: []
    };

    setExercises([...exercises, newExercise]);
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
    
    if (updatedExercises[exerciseIndex] && updatedExercises[exerciseIndex].sets[setIndex]) {
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
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        router.push("/templates");
      } else {
        const data = await response.json();
        alert(`Failed to create template: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating template:", error);
      alert("Failed to create template due to a network error.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loading text="Loading exercises..." />;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Create Workout Template</h1>
      
      <form onSubmit={handleSubmit}>
        <Input
          id="templateName"
          label="Template Name"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          required
          className="mb-6"
        />

        <div className="mb-6">
          <h2 className="text-xl mb-4">Add Exercises</h2>
          
          <ExercisePicker 
            onSelectExercise={handleAddExercise}
            className="mb-6"
          />

          {exercises.length === 0 ? (
            <p className="text-center py-4 border border-dashed border-gray-300 rounded">
              No exercises added yet. Select an exercise above.
            </p>
          ) : (
            <div className="space-y-6">
              {exercises.map((exercise, exerciseIndex) => (
                <ExerciseForm
                  key={exerciseIndex}
                  exercise={exercise}
                  onRemove={() => handleRemoveExercise(exerciseIndex)}
                  onAddSet={() => handleAddSet(exerciseIndex)}
                  onRemoveSet={(setIndex) => handleRemoveSet(exerciseIndex, setIndex)}
                  onSetChange={(setIndex, field, value) => 
                    handleSetChange(exerciseIndex, setIndex, field, value)
                  }
                />
              ))}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          fullWidth
          className="mt-8"
        >
          {isSaving ? "Saving..." : "Save Template"}
        </Button>
      </form>
    </div>
  );
}
