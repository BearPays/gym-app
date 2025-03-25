import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/auth";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// Helper function to get user ID from session
async function getUserId() {
  return await getUserIdFromSession();
}

// GET /api/templates - Get all templates for the logged-in user
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use user-specific cache key
    const cacheKey = `templates-${userId}`;
    const cachedTemplates = cache.get(cacheKey);

    if (cachedTemplates) {
      return NextResponse.json(cachedTemplates);
    }

    const templates = await prisma.workoutTemplate.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    cache.set(cacheKey, templates);
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

// POST /api/templates - Create a new workout template
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate request body
    if (!body.name || !body.exercises || !Array.isArray(body.exercises)) {
      return NextResponse.json(
        { error: "Invalid template data" },
        { status: 400 }
      );
    }
    
    // Create the template and related records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the workout template
      const workoutTemplate = await tx.workoutTemplate.create({
        data: {
          name: body.name,
          userId: userId,
        }
      });
      
      // 2. Create exercises and sets
      for (const exercise of body.exercises) {
        if (!exercise.id) continue;
        
        const workoutTemplateExercise = await tx.workoutTemplateExercise.create({
          data: {
            workoutTemplateId: workoutTemplate.id,
            exerciseId: exercise.id,
          }
        });
        
        // 3. Create sets for each exercise
        if (Array.isArray(exercise.sets)) {
          for (let i = 0; i < exercise.sets.length; i++) {
            const set = exercise.sets[i];
            await tx.workoutTemplateSet.create({
              data: {
                workoutTemplateExerciseId: workoutTemplateExercise.id,
                order: i + 1,
                reps: set.reps,
                weight: set.weight,
              }
            });
          }
        }
      }
      
      return workoutTemplate;
    });
    
    // Invalidate the templates cache for this user after creating a new template
    cache.del(`templates-${userId}`);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
