import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateHaversineDistance } from '@/lib/decision-engine';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const categoryId = searchParams.get('categoryId');
    const radiusKm = parseFloat(searchParams.get('radius') || '0.5'); // default 500 meters

    if (!lat || !lng) {
      return NextResponse.json({ nearby: [] });
    }

    const where: any = {
      status: { notIn: ['CLOSED', 'REJECTED'] },
    };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const openReports = await prisma.report.findMany({
      where,
      include: { category: true, serviceZone: true },
      take: 50,
    });

    const nearby = openReports
      .map((rep) => {
        const distanceKm = calculateHaversineDistance(lat, lng, rep.latitude, rep.longitude);
        return {
          ...rep,
          distanceKm,
        };
      })
      .filter((rep) => rep.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json({
      nearby,
      count: nearby.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Nearby search failed' }, { status: 500 });
  }
}
