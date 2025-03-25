import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { 
  createSession,
  setSessionCookie,
  setUserInfoCookie, 
  clearSessionCookies,
  deleteAllUserSessions
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.action === 'login') {
      // Login flow
      const { email, password } = body;
      
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 401 });
      }
      
      // Verify password with bcrypt
      const passwordValid = await bcrypt.compare(password, user.password);
      
      if (!passwordValid) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
      }
      
      // Create session and set cookies
      const token = await createSession(user.id);
      
      if (!token) {
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
      }
      
      const response = NextResponse.json({
        success: true,
        user: {
          email: user.email,
          name: user.name || email.split('@')[0]
        }
      });
      
      // Set cookies
      setSessionCookie(token);
      setUserInfoCookie(user.name || email.split('@')[0]);
      
      return response;
      
    } else if (body.action === 'register') {
      // Registration flow
      const { name, email, password } = body;
      
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
      
      // Create new user with hashed password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword
        }
      });
      
      // Create session and set cookies
      const token = await createSession(user.id);
      
      if (!token) {
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
      }
      
      const response = NextResponse.json({
        success: true,
        user: {
          email: user.email,
          name: user.name || email.split('@')[0]
        }
      }, { status: 201 });
      
      // Set cookies
      setSessionCookie(token);
      setUserInfoCookie(user.name || email.split('@')[0]);
      
      return response;
      
    } else if (body.action === 'guestLogin') {
      const guestEmail = 'guest@guest.com';
      const guestPassword = 'guest';
    
      let guestUser = await prisma.user.findUnique({
        where: { email: guestEmail }
      });
    
      if (!guestUser) {
        const hashedGuestPassword = await bcrypt.hash(guestPassword, 10);
        guestUser = await prisma.user.create({
          data: {
            email: guestEmail,
            name: 'Guest',
            password: hashedGuestPassword
          }
        });
      }
      
      // Create session and set cookies
      const token = await createSession(guestUser.id);
      
      if (!token) {
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
      }
      
      const response = NextResponse.json({
        success: true,
        user: {
          email: guestUser.email,
          name: guestUser.name
        }
      });
      
      // Set cookies
      setSessionCookie(token);
      setUserInfoCookie(guestUser.name || 'Guest');
      
      return response;
    } else if (body.action === 'logout') {
      // Logout flow
      const userId = body.userId;
      
      // If userId is provided, delete all sessions for that user
      if (userId) {
        await deleteAllUserSessions(userId);
      }
      
      // Clear cookies
      clearSessionCookies();
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}