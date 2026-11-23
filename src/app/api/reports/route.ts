import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeReportWorkflow } from '@/lib/workflow-engine';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const departmentId = searchParams.get('departmentId');
    const serviceZoneId = searchParams.get('serviceZoneId');
    const citizenId = searchParams.get('citizenId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const where: any = {};

    if (search) {
      where.OR = [
        { referenceNumber: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (category) where.categoryId = category;
    if (priority) where.priority = priority;
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;
    if (serviceZoneId) where.serviceZoneId = serviceZoneId;
    if (citizenId) where.citizenId = citizenId;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          category: true,
          department: true,
          serviceZone: true,
          citizen: {
            select: { id: true, fullName: true, role: true }, // Privacy: exclude phone/NID from public queries
          },
          assignments: {
            include: { team: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      categoryId,
      serviceZoneId,
      citizenId,
      latitude,
      longitude,
      address,
      safetyScore = 50,
      severityScore = 50,
      peopleScore = 50,
      locationScore = 50,
      photoUrl,
      injectFailAtStep = null,
    } = body;

    // Validation
    if (!title || !description || !categoryId || !latitude || !longitude || !address) {
      return NextResponse.json({ error: 'Missing required report fields' }, { status: 400 });
    }

    // Default citizen if guest or demo
    let finalCitizenId = citizenId;
    if (!finalCitizenId) {
      const demoCitizen = await prisma.profile.findFirst({ where: { role: 'CITIZEN' } });
      finalCitizenId = demoCitizen?.id;
    }

    // Lookup Category to get default department
    const category = await prisma.issueCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: 'Invalid issue category' }, { status: 400 });
    }

    // Generate persistent unique reference number (AID-2026-XXXXX)
    const count = await prisma.report.count();
    const referenceNumber = `AID-2026-${String(count + 101).padStart(5, '0')}`;

    // Create Report
    const report = await prisma.report.create({
      data: {
        referenceNumber,
        title,
        description,
        categoryId,
        departmentId: category.defaultDepartmentId,
        serviceZoneId: serviceZoneId || null,
        citizenId: finalCitizenId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        status: 'SUBMITTED',
        priority: 'MEDIUM',
        safetyScore: parseFloat(safetyScore),
        severityScore: parseFloat(severityScore),
        peopleScore: parseFloat(peopleScore),
        locationScore: parseFloat(locationScore),
        slaScore: 0,
        corroborationScore: 0,
      },
    });

    // Add initial status history
    await prisma.statusHistory.create({
      data: {
        reportId: report.id,
        previousStatus: 'NONE',
        newStatus: 'SUBMITTED',
        changedById: finalCitizenId,
        changeReason: 'Citizen report submitted via AidGrid Portal',
      },
    });

    // Add photo attachment if provided
    if (photoUrl) {
      await prisma.reportAttachment.create({
        data: {
          reportId: report.id,
          fileUrl: photoUrl,
          fileName: 'evidence.jpg',
          fileType: 'image/jpeg',
          fileSize: 1024 * 350,
          uploadedBy: finalCitizenId,
        },
      });
    }

    // Trigger A07 Automated Persistent Workflow Execution
    const workflowResult = await executeReportWorkflow({
      reportId: report.id,
      injectFailAtStep: injectFailAtStep ? parseInt(injectFailAtStep, 10) : null,
    });

    const refreshedReport = await prisma.report.findUnique({
      where: { id: report.id },
      include: {
        category: true,
        department: true,
        serviceZone: true,
        assignments: { include: { team: true } },
        decisionExplanations: true,
        workflowRuns: { include: { steps: true } },
      },
    });

    return NextResponse.json({
      success: true,
      report: refreshedReport,
      workflow: workflowResult,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Report creation failed' }, { status: 500 });
  }
}
