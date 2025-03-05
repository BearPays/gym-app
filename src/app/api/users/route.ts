import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, name } = body;

    // Ensure `action` is provided ('login' or 'register')
    if (!action) {
      return NextResponse.json({ error: "Missing action (login or register)" }, { status: 400 });
    }

    // ================================
    // 1) Handle LOGIN
    // ================================
    if (action === "login") {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required for login" },
          { status: 400 }
        );
      }

      // Find the user
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // If successful
      return NextResponse.json({ message: "Login successful", user }, { status: 200 });
    }

    // ================================
    // 2) Handle REGISTER
    // ================================
    else if (action === "register") {
      if (!email || !password || !name) {
        return NextResponse.json(
          { error: "Email, password, and name are required for registration" },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          createdAt: new Date(),
        },
      });

      return NextResponse.json({ message: "User registered successfully", user: newUser }, { status: 201 });
    }

    // If `action` is something else
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in /api/users:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}