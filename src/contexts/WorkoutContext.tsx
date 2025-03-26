"use client";

import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { useAuth } from "./AuthContext";

export type WorkoutSet = {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
};

export type WorkoutExercise = {
  id: string;
  name: string;
  exerciseId: string;
  sets: WorkoutSet[];
};

export type ActiveWorkout = {
  id: string;
  templateId?: string;
  templateName?: string;
  startTime: string;
  exercises: WorkoutExercise[];
};

interface WorkoutContextType {
  activeWorkout: ActiveWorkout | null;
  startWorkout: (templateId?: string, templateName?: string, exercises?: WorkoutExercise[]) => void;
  endWorkout: () => Promise<boolean>;
  addExercise: (exerciseId: string, exerciseName: string) => void;
  removeExercise: (exerciseIndex: number) => void;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  updateSet: (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: number | boolean) => void;
  isSaving: boolean;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  
  // Use user-specific localStorage key
  const getStorageKey = useCallback(() => {
    return user ? `activeWorkout_${user.email}` : null;
  }, [user]);

  // Load any active workout from localStorage on initial render
  useEffect(() => {
    if (!user) return; // Don't load anything if no user
    
    const storageKey = getStorageKey();
    if (!storageKey) return;
    
    const storedWorkout = localStorage.getItem(storageKey);
    if (storedWorkout) {
      try {
        const parsedWorkout = JSON.parse(storedWorkout);
        setActiveWorkout(parsedWorkout);
      } catch (e) {
        console.error("Error parsing stored workout:", e);
        localStorage.removeItem(storageKey);
      }
    }
  }, [user, getStorageKey]); // Re-run when user changes

  // Save activeWorkout to localStorage whenever it changes
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) return;
    
    if (activeWorkout) {
      try {
        // Generate a timestamp to help with concurrency issues
        const workoutWithTimestamp = {
          ...activeWorkout,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(storageKey, JSON.stringify(workoutWithTimestamp));
      } catch (err) {
        console.error("Error saving workout to localStorage:", err);
      }
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [activeWorkout, user, getStorageKey]);

  // Start a new workout, optionally based on a template
  const startWorkout = (templateId?: string, templateName?: string, templateExercises?: WorkoutExercise[]) => {
    if (!user) return; // Prevent starting workout if not logged in
    
    const newWorkout: ActiveWorkout = {
      id: Date.now().toString(),
      templateId,
      templateName,
      startTime: new Date().toISOString(),
      exercises: templateExercises || [],
    };
    
    setActiveWorkout(newWorkout);
  };

  // End the current workout and save it to the database
  const endWorkout = async (): Promise<boolean> => {
    if (!activeWorkout || !user) return false;
    
    setIsSaving(true);
    
    try {
      // Send the workout data to the API
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...activeWorkout,
          endTime: new Date().toISOString(),
        }),
      });
      
      if (response.ok) {
        // Clear the active workout
        setActiveWorkout(null);
        return true;
      } else {
        console.error('Failed to save workout');
        return false;
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new exercise to the workout
  const addExercise = (exerciseId: string, exerciseName: string) => {
    if (!activeWorkout) return;
    
    const newExercise: WorkoutExercise = {
      id: Date.now().toString(),
      exerciseId,
      name: exerciseName,
      sets: [{ id: Date.now().toString(), reps: 0, weight: 0, completed: false }],
    };
    
    setActiveWorkout({
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newExercise]
    });
  };

  // Remove an exercise from the workout
  const removeExercise = (exerciseIndex: number) => {
    if (!activeWorkout) return;
    
    const updatedExercises = [...activeWorkout.exercises];
    updatedExercises.splice(exerciseIndex, 1);
    
    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
  };

  // Add a new set to an exercise
  const addSet = (exerciseIndex: number) => {
    if (!activeWorkout) return;
    
    const updatedExercises = [...activeWorkout.exercises];
    const currentSets = updatedExercises[exerciseIndex].sets;
    const lastSet = currentSets[currentSets.length - 1];
    
    // Copy values from the last set if available
    const newSet: WorkoutSet = {
      id: Date.now().toString(),
      reps: lastSet ? lastSet.reps : 0,
      weight: lastSet ? lastSet.weight : 0,
      completed: false,
    };
    
    updatedExercises[exerciseIndex].sets.push(newSet);
    
    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
  };

  // Remove a set from an exercise
  const removeSet = (exerciseIndex: number, setIndex: number) => {
    if (!activeWorkout) return;
    
    const updatedExercises = [...activeWorkout.exercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    
    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
  };

  // Update a set's reps, weight, or completion status
  const updateSet = (
    exerciseIndex: number, 
    setIndex: number, 
    field: keyof WorkoutSet, 
    value: number | boolean
  ) => {
    if (!activeWorkout) return;
    
    const updatedExercises = [...activeWorkout.exercises];
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };
    
    setActiveWorkout({
      ...activeWorkout,
      exercises: updatedExercises
    });
  };

  return (
    <WorkoutContext.Provider 
      value={{ 
        activeWorkout, 
        startWorkout, 
        endWorkout, 
        addExercise, 
        removeExercise, 
        addSet, 
        removeSet, 
        updateSet,
        isSaving
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = (): WorkoutContextType => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
