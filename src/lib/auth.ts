import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aidgrid-production-hack-the-vibe-2026-super-secret-key-32chars';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'CITIZEN' | 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'SYSTEM_ADMIN';
  departmentId?: string | null;
  teamId?: string | null;
  serviceZoneId?: string | null;
  preferredLang?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      departmentId: user.departmentId,
      teamId: user.teamId,
      serviceZoneId: user.serviceZoneId,
      preferredLang: user.preferredLang || 'en',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export function hasPermission(
  userRole: string,
  requiredRoles: string[]
): boolean {
  if (userRole === 'SYSTEM_ADMIN') return true;
  return requiredRoles.includes(userRole);
}

export function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(';')) {
    const [rawName, ...rest] = part.trim().split('=');
    if (rawName === 'aidgrid_token') {
      return decodeURIComponent(rest.join('='));
    }
  }

  return null;
}

export function getRequestUser(req: Request): AuthUser | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Citizen accounts have strict read-only access and may not create or modify any document.
 */
export function rejectCitizenMutation(req: Request): Response | null {
  const user = getRequestUser(req);
  if (user?.role === 'CITIZEN') {
    return new Response(
      JSON.stringify({
        error: 'Forbidden: Citizen role has read-only access and cannot change any document.',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  return null;
}

export const ROLE_HIERARCHY = {
  SYSTEM_ADMIN: 4,
  DEPARTMENT_MANAGER: 3,
  FIELD_OFFICER: 2,
  CITIZEN: 1,
};
