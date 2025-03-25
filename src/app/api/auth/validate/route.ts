import { NextResponse } from "next/server";
import { validateSession } from "@/lib/auth";

export async function GET() {
  try {
    // Validate the session and get user information
    const user = await validateSession();
    
    if (user) {
      // Return minimal user information (avoid sensitive data)
      return NextResponse.json({
        authenticated: true,
        email: user.email,
        name: user.name
      });
    } else {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json(
      { error: "Session validation failed" },
      { status: 500 }
    );
  }
}