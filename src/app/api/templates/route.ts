import { NextResponse } from "next/server";

// GET /api/templates - Get all templates for the logged-in user
export async function GET() {
  try {
    // In a real application, you would fetch templates from the database
    // and verify the user is authenticated
    
    // Mock response for demo
    const templates = [
      { id: "1", name: "Upper Body Workout", createdAt: new Date().toISOString() },
      { id: "2", name: "Lower Body Workout", createdAt: new Date().toISOString() },
      { id: "3", name: "Full Body Workout", createdAt: new Date().toISOString() },
    ];
    
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

// POST /api/templates - Create a new workout template
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.name || !body.exercises || !Array.isArray(body.exercises)) {
      return NextResponse.json(
        { error: "Invalid template data" },
        { status: 400 }
      );
    }
    
    // In a real application, you would save the template to the database
    // and associate it with the authenticated user
    
    // Mock response for demo
    return NextResponse.json(
      { 
        id: Date.now().toString(),
        name: body.name,
        exercises: body.exercises,
        createdAt: new Date().toISOString()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
