import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('aidgrid_token')?.value;

    if (!token) {
      // Check Authorization Bearer header
      const authHeader = req.headers.get('authorization');
      const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (!headerToken) {
        return NextResponse.json({ user: null });
      }
      const verified = verifyToken(headerToken);
      if (!verified) return NextResponse.json({ user: null });
      return fetchFullUserProfile(verified.id);
    }

    const verified = verifyToken(token);
    if (!verified) {
      return NextResponse.json({ user: null });
    }

    return fetchFullUserProfile(verified.id);
  } catch {
    return NextResponse.json({ user: null });
  }
}

async function fetchFullUserProfile(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    include: {
      department: true,
      team: true,
      serviceZone: true,
    },
  });

  if (!profile || !profile.isActive) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      role: profile.role,
      phone: profile.phone,
      nidOrCitizenId: profile.nidOrCitizenId,
      departmentId: profile.departmentId,
      departmentName: profile.department?.name,
      teamId: profile.teamId,
      teamName: profile.team?.name,
      serviceZoneId: profile.serviceZoneId,
      serviceZoneName: profile.serviceZone?.name,
      preferredLang: profile.preferredLang,
    },
  });
}
