import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Open311 GeoReport v2 - GET /requests/[id].json
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const report = await prisma.report.findFirst({
      where: {
        OR: [{ referenceNumber: params.id }, { id: params.id }],
      },
      include: {
        category: true,
        department: true,
        statusHistory: true,
      },
    });

    if (!report) {
      return NextResponse.json([{ code: 404, description: 'Service request not found' }], { status: 404 });
    }

    return NextResponse.json([
      {
        service_request_id: report.referenceNumber,
        status: report.status === 'CLOSED' ? 'closed' : 'open',
        status_notes: `State: ${report.status}. Priority: ${report.priority}.`,
        service_name: report.category.name,
        service_code: report.category.code,
        description: report.description,
        agency_responsible: report.department?.name || 'Dhaka Municipal Authority',
        service_notice: report.resolutionSummary || null,
        requested_datetime: report.createdAt.toISOString(),
        updated_datetime: report.updatedAt.toISOString(),
        expected_datetime: report.resolutionDeadline?.toISOString() || null,
        address: report.address,
        lat: report.latitude,
        long: report.longitude,
        media_url: report.resolutionEvidenceUrl || null,
      },
    ]);
  } catch (error: any) {
    return NextResponse.json([{ code: 500, description: error.message }], { status: 500 });
  }
}
