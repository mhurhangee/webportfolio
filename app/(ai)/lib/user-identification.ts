import { cookies } from 'next/headers';
import { generateId } from 'ai';
import { NextRequest } from 'next/server';

const USER_ID_COOKIE = 'ai_user_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

export async function getUserId(): Promise<string> {
  const cookieStore = await cookies();
  let userId = cookieStore.get(USER_ID_COOKIE)?.value;

  // If no user ID exists, create a new one and set the cookie
  if (!userId) {
    userId = generateId();

    // Set the cookie (server-side)
    // This will be available for all routes
    cookieStore.set(USER_ID_COOKIE, userId, {
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    });
  }

  return userId;
}

// Client-side version for components that need user ID
export function getUserIdClient(): string | null {
  if (typeof document === 'undefined') return null;

  // Get all cookies
  const cookies = document.cookie.split('; ');

  // Find the user ID cookie
  for (const cookie of cookies) {
    const parts = cookie.split('=');
    if (parts.length === 2 && parts[0] === USER_ID_COOKIE) {
      return parts[1] || null;
    }
  }

  return null;
}

/**
 * Extract user information from the request including ID, IP address, and user agent
 * @param req NextRequest object
 * @returns Object containing user information
 */
export async function getUserInfo(req: NextRequest): Promise<{
  userId: string;
  ip: string;
  userAgent: string;
}> {
  // Get user ID
  const userId = await getUserId();

  // Get IP address from request using various headers
  // NextRequest in Next.js doesn't expose direct IP or socket properties
  let ip = req.headers.get('x-forwarded-for') || '';

  // Try X-Real-IP as fallback
  if (!ip) {
    ip = req.headers.get('x-real-ip') || '';
  }

  // Try CF-Connecting-IP (Cloudflare)
  if (!ip) {
    ip = req.headers.get('cf-connecting-ip') || '';
  }

  // Default to localhost if we still have no IP
  if (!ip) {
    ip = '127.0.0.1';
  }

  // If multiple IPs in X-Forwarded-For, get the first one (client IP)
  if (ip.includes(',')) {
    const firstIp = ip.split(',')[0];
    // Ensure we have a string, not undefined
    ip = typeof firstIp === 'string' ? firstIp.trim() : ip;
  }

  // Get user agent
  const userAgent = req.headers.get('user-agent') || '';

  return {
    userId,
    ip,
    userAgent,
  };
}
