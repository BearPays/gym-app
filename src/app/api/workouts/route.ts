import NodeCache from "node-cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/auth";

// Helper function to get user ID from session
async function getUserId() {
  return await getUserIdFromSession();
}

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// GET /api/workouts - Get all workouts for the logged-in user
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use user-specific cache key
    const cacheKey = `workouts-${userId}`;
    const cachedWorkouts = cache.get(cacheKey);

    if (cachedWorkouts) {
      return NextResponse.json(cachedWorkouts);
    }

    // Get all workout sessions for this user
    const workouts = await prisma.workoutSession.findMany({
      where: { userId },
      include: {
        workoutTemplate: {
          select: { name: true }
        },
        exercises: {
          include: {
            exercise: true,
            sets: {
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: { startTime: 'desc' }
    });
    
    // Format the response
    const formattedWorkouts = workouts.map(workout => ({
      id: workout.id,
      templateName: workout.workoutTemplate?.name || 'Custom Workout',
      startTime: workout.startTime.toISOString(),
      endTime: workout.endTime?.toISOString(),
      isActive: !workout.endTime,
      exercises: workout.exercises.map(ex => ({
        id: ex.id,
        name: ex.exercise.name,
        sets: ex.sets.map(set => ({
          reps: set.reps,
          weight: set.weight,
        }))
      }))
    }));
    
    cache.set(cacheKey, formattedWorkouts);
    return NextResponse.json(formattedWorkouts);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json({ error: "Failed to fetch workouts" }, { status: 500 });
  }
}

// POST /api/workouts - Create a new workout or save a completed one
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    
    const workoutData = {
      userId,
      workoutTemplateId: body.templateId || null,
      startTime: new Date(body.startTime),
      endTime: body.endTime ? new Date(body.endTime) : null
    };
    
    // Create the workout in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the workout session
      const workoutSession = await tx.workoutSession.create({
        data: workoutData
      });
      
      // 2. Create exercises and sets
      for (const exercise of body.exercises) {
        const workoutSessionExercise = await tx.workoutSessionExercise.create({
          data: {
            workoutSessionId: workoutSession.id,
            exerciseId: exercise.exerciseId,
          }
        });
        
        // 3. Create sets for each exercise
        if (Array.isArray(exercise.sets)) {
          for (let i = 0; i < exercise.sets.length; i++) {
            const set = exercise.sets[i];
            await tx.workoutSessionSet.create({
              data: {
                workoutSessionExerciseId: workoutSessionExercise.id,
                order: i + 1,
                reps: set.reps,
                weight: set.weight,
              }
            });
          }
        }
      }
      
      return workoutSession;
    });
    
    // Invalidate the workouts cache for this user after creating a new workout
    cache.del(`workouts-${userId}`);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating/saving workout:", error);
    return NextResponse.json(
      { error: "Failed to create/save workout" },
      { status: 500 }
    );
  }
}
