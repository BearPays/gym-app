import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

// Using Next.js's preferred typing for App Router API Routes
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const id = params.id;
    
    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });
    
    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }
    
    return NextResponse.json(exercise);
  } catch (error) {
    console.error(`Error fetching exercise details:`, error);
    return NextResponse.json(
      { error: "Failed to fetch exercise details" },
      { status: 500 }
    );
  }
}
