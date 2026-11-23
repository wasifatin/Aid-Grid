import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeReportWorkflow } from '@/lib/workflow-engine';

/**
 * Open311 GeoReport v2 - GET & POST /requests.json
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const service_code = searchParams.get('service_code');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const status = searchParams.get('status');

    const where: any = {};
    if (service_code) {
      const cat = await prisma.issueCategory.findUnique({ where: { code: service_code } });
      if (cat) where.categoryId = cat.id;
    }
    if (status) {
      if (status.toLowerCase() === 'open') {
        where.status = { notIn: ['CLOSED', 'REJECTED'] };
      } else if (status.toLowerCase() === 'closed') {
        where.status = 'CLOSED';
      }
    }

    const reports = await prisma.report.findMany({
      where,
      include: { category: true, department: true },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    const requests = reports.map((r) => ({
      service_request_id: r.referenceNumber,
      status: r.status === 'CLOSED' ? 'closed' : 'open',
      status_notes: `Current state: ${r.status}. Priority: ${r.priority}.`,
      service_name: r.category.name,
      service_code: r.category.code,
      description: r.description,
      agency_responsible: r.department?.name || 'Dhaka Municipal Authority',
      service_notice: r.resolutionSummary || null,
      requested_datetime: r.createdAt.toISOString(),
      updated_datetime: r.updatedAt.toISOString(),
      expected_datetime: r.resolutionDeadline?.toISOString() || null,
      address: r.address,
      lat: r.latitude,
      long: r.longitude,
      media_url: r.resolutionEvidenceUrl || null,
    }));

    return NextResponse.json(requests);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      service_code,
      lat,
      long,
      address_string,
      description,
      title = 'Open311 Service Request',
      first_name,
      last_name,
      email,
      phone,
    } = body;

    if (!service_code || !lat || !long || !description) {
      return NextResponse.json(
        [{ code: 400, description: 'Missing required Open311 fields: service_code, lat, long, description' }],
        { status: 400 }
      );
    }

    const category = await prisma.issueCategory.findUnique({
      where: { code: service_code },
    });

    if (!category) {
      return NextResponse.json([{ code: 404, description: 'Service code not found' }], { status: 404 });
    }

    // Citizen profile lookup or default Open311 citizen
    let citizen = email ? await prisma.profile.findUnique({ where: { email } }) : null;
    if (!citizen) {
      citizen = await prisma.profile.findFirst({ where: { role: 'CITIZEN' } });
    }

    const count = await prisma.report.count();
    const referenceNumber = `AID-2026-${String(count + 101).padStart(5, '0')}`;

    const report = await prisma.report.create({
      data: {
        referenceNumber,
        title: title || `${category.name} via Open311`,
        description,
        categoryId: category.id,
        departmentId: category.defaultDepartmentId,
        citizenId: citizen!.id,
        latitude: parseFloat(lat),
        longitude: parseFloat(long),
        address: address_string || 'Location reported via Open311',
        status: 'SUBMITTED',
        priority: 'MEDIUM',
        safetyScore: category.defaultSeverity,
        severityScore: category.defaultSeverity,
        peopleScore: 50,
        locationScore: 50,
      },
    });

    // Execute persistent workflow
    await executeReportWorkflow({ reportId: report.id });

    return NextResponse.json(
      [
        {
          service_request_id: report.referenceNumber,
          service_notice: 'The service request has been received and triaged by AidGrid.',
          account_id: citizen?.id,
        },
      ],
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json([{ code: 500, description: error.message }], { status: 500 });
  }
}
