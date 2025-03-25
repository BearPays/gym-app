import NodeCache from "node-cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Helper function to get user ID from cookie/session
async function getUserId() {
  const userCookies = await cookies();
  const userCookie = userCookies.get('user')?.value;
  if (!userCookie) return null;
  
  try {
    const userData = JSON.parse(userCookie);
    const user = await prisma.user.findUnique({
      where: { email: userData.email }
    });
    return user?.id;
  } catch {
    return null;
  }
}

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// GET /api/workouts - Get all workouts for the logged-in user
export async function GET() {
  const cacheKey = "workouts";
  const cachedWorkouts = cache.get(cacheKey);

  if (cachedWorkouts) {
    return NextResponse.json(cachedWorkouts);
  }

  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workouts = await prisma.workoutSession.findMany({
      where: { userId },
      include: {
        workoutTemplate: {
          select: { name: true },
        },
        exercises: {
          include: {
            exercise: true,
            sets: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { startTime: "desc" },
    });

    cache.set(cacheKey, workouts);
    return NextResponse.json(workouts);
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
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating/saving workout:", error);
    return NextResponse.json(
      { error: "Failed to create/save workout" },
      { status: 500 }
    );
  }
}
