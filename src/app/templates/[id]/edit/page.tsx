"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import ExerciseForm from "@/components/exercise/ExerciseForm";
import ExercisePickerModal from "@/components/exercise/ExercisePickerModal";
import { ExercisePickerOption } from "@/components/exercise/ExercisePicker";

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

type Template = {
  id: string;
  name: string;
  createdAt: string;
  exercises: Exercise[];
};

export default function EditTemplate({ params: promisedParams }: { params: Promise<{ id: string }> }) {
  const [params, setParams] = React.useState<{ id: string } | null>(null);

  React.useEffect(() => {
    promisedParams.then((result) => {
      setParams(result);
    });
  }, [promisedParams]);

  const [template, setTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<ExercisePickerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!params) return;

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
  }, [isAuthenticated, router, params]);

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
    
    if (!params) {
      return;
    }
    
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
    if (params) {
      router.push(`/templates/${params.id}`);
    } else {
      router.push('/templates');
    }
  };

  if (isLoading) {
    return <Loading text="Loading template data..." />;
  }

  if (!template) {
    return <div className="min-h-screen p-8">Template not found</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Workout Template</h1>
      
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl">Exercises</h2>
            <ExercisePickerModal
              providedExercises={availableExercises}
              onSelectExercise={handleAddExercise}
              buttonText="Add Exercise"
              modalTitle="Add Exercise to Template"
            />
          </div>
          
          {exercises.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-300 rounded">
              <p className="mb-4">No exercises added yet. Add your first exercise to start.</p>
              <ExercisePickerModal
                providedExercises={availableExercises}
                onSelectExercise={handleAddExercise}
                buttonText="Add First Exercise"
                modalTitle="Select Exercise"
              />
            </div>
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

        <div className="mt-8 flex gap-4">
          <Button
            type="submit"
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? "Saving..." : "Update Template"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
