import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Open311 GeoReport v2 - GET /services.json
 * Returns list of service definitions mapped from AidGrid Issue Categories
 */
export async function GET() {
  try {
    const categories = await prisma.issueCategory.findMany({
      where: { isActive: true },
      include: { department: true },
    });

    const services = categories.map((cat) => ({
      service_code: cat.code,
      service_name: cat.name,
      description: cat.description,
      metadata: false,
      type: 'realtime',
      keywords: `${cat.name}, ${cat.department.name}, civic`,
      group: cat.department.name,
    }));

    return NextResponse.json(services);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
