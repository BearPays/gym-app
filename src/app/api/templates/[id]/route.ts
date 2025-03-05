import { NextResponse } from "next/server";

// GET /api/templates/[id] - Get a specific template
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // In a real application, you would fetch the template from the database
    // and verify the user has permission to access it
    
    // Mock response for demo
    const template = {
      id,
      name: id === "1" ? "Upper Body Workout" : "Full Body Workout",
      createdAt: new Date().toISOString(),
      exercises: [
        {
          id: "1",
          name: "Bench Press",
          sets: [
            { id: "1", reps: 10, weight: 60 },
            { id: "2", reps: 8, weight: 70 },
            { id: "3", reps: 6, weight: 80 },
          ],
        },
        {
          id: "4",
          name: "Pull Up",
          sets: [
            { id: "4", reps: 12, weight: 0 },
            { id: "5", reps: 10, weight: 0 },
          ],
        },
      ],
    };
    
    return NextResponse.json(template);
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
    const id = params.id;
    const body = await request.json();
    
    // Validate request body
    if (!body.name || !body.exercises || !Array.isArray(body.exercises)) {
      return NextResponse.json(
        { error: "Invalid template data" },
        { status: 400 }
      );
    }
    
    // In a real application, you would update the template in the database
    // and verify the user has permission to modify it
    
    // Mock response for demo
    return NextResponse.json({
      id,
      name: body.name,
      exercises: body.exercises,
      createdAt: new Date().toISOString(),
    });
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
    // In a real application, you would delete the template from the database
    // and verify the user has permission to delete it
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting template ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
