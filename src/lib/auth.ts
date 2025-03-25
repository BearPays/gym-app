import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { v4 as uuidv4 } from 'uuid';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

/**
 * Creates a new session for a user
 */
export async function createSession(userId: string): Promise<string | null> {
  try {
    // Generate a secure random token
    const token = uuidv4();
    
    // Set expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    // Using raw SQL queries as a fallback due to potential Prisma client issues
    // First delete any existing sessions for this user
    await prisma.$executeRawUnsafe(`DELETE FROM "Session" WHERE "userId" = $1`, userId);
    
    // Then create a new session
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Session" (id, "userId", token, "createdAt", "expiresAt") VALUES ($1, $2, $3, $4, $5)`,
      uuidv4(), // Generate a unique ID
      userId,
      token,
      new Date(),
      expiresAt
    );
    
    return token;
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}

/**
 * Gets the session cookie options
 */
function getSessionCookieOptions(expires: Date): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires,
    path: '/'
  };
}

/**
 * Sets the session cookie
 */
export function setSessionCookie(token: string): void {
  // Set expiration date (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Direct usage of document.cookie for client-side
  if (typeof document !== 'undefined') {
    document.cookie = `session=${token}; path=/; expires=${expiresAt.toUTCString()}; ${process.env.NODE_ENV === 'production' ? 'secure; ' : ''}httpOnly; sameSite=strict`;
    return;
  }

  // Server-side cookies handling
  try {
    // For Next.js App Router API routes and Server Components
    const cookieStore = cookies();
    
    // Using lower-level method to set cookie
    // This is a workaround for type issues with the cookies() API
    const store = cookieStore as any;
    if (store && typeof store.set === 'function') {
      store.set('session', token, getSessionCookieOptions(expiresAt));
    }
  } catch (error) {
    console.error('Error setting session cookie:', error);
  }
}

/**
 * Sets a user info cookie (non-HTTP-only) for UI purposes
 */
export function setUserInfoCookie(name: string): void {
  // Set expiration date (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const value = JSON.stringify({ name });
  
  // Direct usage of document.cookie for client-side
  if (typeof document !== 'undefined') {
    document.cookie = `user_info=${encodeURIComponent(value)}; path=/; expires=${expiresAt.toUTCString()}; ${process.env.NODE_ENV === 'production' ? 'secure; ' : ''}sameSite=strict`;
    return;
  }
  
  // Server-side cookies handling
  try {
    const cookieStore = cookies();
    
    // Using lower-level method to set cookie
    const store = cookieStore as any;
    if (store && typeof store.set === 'function') {
      store.set('user_info', value, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: expiresAt,
        path: '/'
      });
    }
  } catch (error) {
    console.error('Error setting user info cookie:', error);
  }
}

/**
 * Gets a cookie from the cookie store with fallbacks
 */
function getCookie(name: string): { value: string } | undefined {
  try {
    const cookieStore = cookies();
    
    // Try to get the cookie using the API
    const store = cookieStore as any;
    if (store && typeof store.get === 'function') {
      return store.get(name);
    }
    
    return undefined;
  } catch (error) {
    console.error(`Error getting cookie ${name}:`, error);
    return undefined;
  }
}

/**
 * Validates the session token and returns the associated user
 */
export async function validateSession(): Promise<SessionUser | null> {
  try {
    // Get the session token from HTTP-only cookie
    const sessionCookie = getCookie('session');
    
    if (!sessionCookie) {
      return null;
    }
    
    const sessionToken = sessionCookie.value;
    
    // Using raw SQL query to find session and associated user
    const sessions = await prisma.$queryRawUnsafe<any[]>(`
      SELECT s.id, s."expiresAt", u.id as "userId", u.email, u.name
      FROM "Session" s
      JOIN "User" u ON s."userId" = u.id
      WHERE s.token = $1
    `, sessionToken);
    
    if (!sessions || sessions.length === 0) {
      return null;
    }
    
    const session = sessions[0];
    
    // Check if session has expired
    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < new Date()) {
      // Clean up expired session
      await prisma.$executeRawUnsafe(`DELETE FROM "Session" WHERE id = $1`, session.id);
      return null;
    }
    
    // Return user information
    return {
      id: session.userId,
      email: session.email,
      name: session.name
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * Helper function to get user ID from session
 */
export async function getUserIdFromSession(): Promise<string | null> {
  const user = await validateSession();
  return user?.id || null;
}

/**
 * Clears the session cookies
 */
export function clearSessionCookies(): void {
  const pastDate = new Date(0);
  
  // Direct browser cookie clearing (client-side)
  if (typeof document !== 'undefined') {
    document.cookie = `session=; path=/; expires=${pastDate.toUTCString()}`;
    document.cookie = `user_info=; path=/; expires=${pastDate.toUTCString()}`;
    return;
  }
  
  // Server-side cookie clearing
  try {
    const cookieStore = cookies();
    
    // Using lower-level method to set cookie
    const store = cookieStore as any;
    if (store && typeof store.set === 'function') {
      // Clear session cookie
      store.set('session', '', {
        expires: pastDate,
        path: '/'
      });
      
      // Clear user info cookie
      store.set('user_info', '', {
        expires: pastDate,
        path: '/'
      });
    }
  } catch (error) {
    console.error('Error clearing session cookies:', error);
  }
}

/**
 * Deletes all sessions for a user
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  try {
    // Using raw SQL to delete sessions for a user
    await prisma.$executeRawUnsafe(`DELETE FROM "Session" WHERE "userId" = $1`, userId);
  } catch (error) {
    console.error('Error deleting user sessions:', error);
  }
}