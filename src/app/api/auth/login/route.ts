import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, judgeRole } = body;

    // Handle Judge Preset Quick-Login
    if (judgeRole) {
      const user = await prisma.profile.findFirst({
        where: { role: judgeRole, isActive: true },
        include: { department: true, team: true, serviceZone: true },
      });

      if (!user) {
        return NextResponse.json({ error: `No active demo user found for role: ${judgeRole}` }, { status: 404 });
      }

      const token = signToken({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role as any,
        departmentId: user.departmentId,
        teamId: user.teamId,
        serviceZoneId: user.serviceZoneId,
        preferredLang: user.preferredLang,
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          departmentId: user.departmentId,
          departmentName: user.department?.name,
          teamId: user.teamId,
          teamName: user.team?.name,
          serviceZoneId: user.serviceZoneId,
          serviceZoneName: user.serviceZone?.name,
          preferredLang: user.preferredLang,
        },
        token,
      });

      response.cookies.set({
        name: 'aidgrid_token',
        value: token,
        httpOnly: true,
        path: '/',
        maxAge: 7 * 24 * 3600,
        sameSite: 'lax',
      });

      return response;
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.profile.findUnique({
      where: { email },
      include: { department: true, team: true, serviceZone: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Invalid credentials or inactive account' }, { status: 401 });
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as any,
      departmentId: user.departmentId,
      teamId: user.teamId,
      serviceZoneId: user.serviceZoneId,
      preferredLang: user.preferredLang,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        departmentId: user.departmentId,
        departmentName: user.department?.name,
        teamId: user.teamId,
        teamName: user.team?.name,
        serviceZoneId: user.serviceZoneId,
        serviceZoneName: user.serviceZone?.name,
        preferredLang: user.preferredLang,
      },
      token,
    });

    response.cookies.set({
      name: 'aidgrid_token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 3600,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Signed out successfully' });
  response.cookies.delete('aidgrid_token');
  return response;
}
