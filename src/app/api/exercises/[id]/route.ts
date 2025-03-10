import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    
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
