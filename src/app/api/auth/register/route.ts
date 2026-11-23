import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, password, phone, nid, serviceZoneId, preferredLang = 'en' } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Full name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = await prisma.profile.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.profile.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        nidOrCitizenId: nid,
        role: 'CITIZEN',
        serviceZoneId: serviceZoneId || null,
        preferredLang,
      },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: 'CITIZEN',
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
        serviceZoneId: user.serviceZoneId,
        preferredLang: user.preferredLang,
      },
      token,
    }, { status: 201 });

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
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
