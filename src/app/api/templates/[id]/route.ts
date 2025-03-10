import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Helper function to get user ID from cookie/session
async function getUserId() {
  const userCookie = (await cookies()).get('user')?.value;
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

// GET /api/templates/[id] - Get a specific template
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const id = params.id;
    
    // Get the template with exercises and sets
    const template = await prisma.workoutTemplate.findUnique({
      where: { id },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });
    
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    
    if (template.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Transform the data to match the expected format
    const formattedTemplate = {
      id: template.id,
      name: template.name,
      createdAt: template.createdAt.toISOString(),
      exercises: template.exercises.map(ex => ({
        id: ex.exerciseId,
        name: ex.exercise.name,
        sets: ex.sets.map(set => ({
          id: set.id,
          reps: set.reps,
          weight: set.weight
        }))
      }))
    };
    
    return NextResponse.json(formattedTemplate);
  } catch (error) {
    console.error(`Error fetching template ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

// PUT /api/templates/[id] - Update a specific template
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const id = params.id;
    const body = await request.json();
    
    // Validate request body
    if (!body.name || !body.exercises || !Array.isArray(body.exercises)) {
      return NextResponse.json(
        { error: "Invalid template data" },
        { status: 400 }
      );
    }
    
    // Update the template in the database
    interface SetData {
        reps: number;
        weight: number;
    }

    interface ExerciseData {
        id: string;
        sets: SetData[];
    }


    const updatedTemplate = await prisma.workoutTemplate.update({
        where: { id },
        data: {
            name: body.name,
            exercises: {
                deleteMany: {},
                create: body.exercises.map((ex: ExerciseData) => ({
                    exercise: {
                        connect: { id: ex.id }
                    },
                    sets: {
                        create: ex.sets.map((set: SetData) => ({
                            reps: set.reps,
                            weight: set.weight
                        }))
                    }
                }))
            }
        },
        include: {
            exercises: {
                include: {
                    exercise: true,
                    sets: {
                        orderBy: { order: 'asc' }
                    }
                }
            }
        }
    });
    
    // Transform the data to match the expected format
    const formattedTemplate = {
      id: updatedTemplate.id,
      name: updatedTemplate.name,
      createdAt: updatedTemplate.createdAt.toISOString(),
      exercises: updatedTemplate.exercises.map(ex => ({
        id: ex.exerciseId,
        name: ex.exercise.name,
        sets: ex.sets.map(set => ({
          id: set.id,
          reps: set.reps,
          weight: set.weight
        }))
      }))
    };
    
    return NextResponse.json(formattedTemplate);
  } catch (error) {
    console.error(`Error updating template ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[id] - Delete a specific template
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const id = params.id;
    
    // Delete the template from the database
    await prisma.workoutTemplate.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting template ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
