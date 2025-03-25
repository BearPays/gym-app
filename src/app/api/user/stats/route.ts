import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/auth";

// Helper function to get user ID from session
async function getUserId() {
  return await getUserIdFromSession();
}

// GET /api/user/stats - Get statistics for the logged-in user
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get count of finished workouts
    const finishedWorkouts = await prisma.workoutSession.count({
      where: {
        userId,
        endTime: { not: null }
      }
    });
    
    // Get count of created templates
    const createdTemplates = await prisma.workoutTemplate.count({
      where: {
        userId
      }
    });
    
    // Find the most performed exercise
    const exerciseStats = await prisma.workoutSessionExercise.groupBy({
      by: ['exerciseId'],
      _count: {
        exerciseId: true
      },
      where: {
        workoutSession: {
          userId
        }
      },
      orderBy: {
        _count: {
          exerciseId: 'desc'
        }
      },
      take: 1
    });
    
    // Get exercise details if there's a most performed exercise
    let favoriteExercise = null;
    if (exerciseStats.length > 0) {
      favoriteExercise = await prisma.exercise.findUnique({
        where: {
          id: exerciseStats[0].exerciseId
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              workoutSessionExercises: {
                where: {
                  workoutSession: {
                    userId
                  }
                }
              }
            }
          }
        }
      });
    }
    
    return NextResponse.json({
      finishedWorkouts,
      createdTemplates,
      favoriteExercise: favoriteExercise ? {
        name: favoriteExercise.name,
        count: favoriteExercise._count.workoutSessionExercises
      } : null
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}
