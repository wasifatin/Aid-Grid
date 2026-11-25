import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rejectCitizenMutation } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const officerId = searchParams.get('officerId');
    const teamId = searchParams.get('teamId');

    const where: any = {};
    if (officerId) where.officerId = officerId;
    if (teamId) where.teamId = teamId;

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        report: {
          include: {
            category: true,
            serviceZone: true,
            attachments: true,
          },
        },
        team: {
          include: { skills: true },
        },
        officer: {
          select: { id: true, fullName: true, phone: true },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return NextResponse.json({ assignments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const forbidden = rejectCitizenMutation(req);
  if (forbidden) return forbidden;

  try {
    const body = await req.json();
    const {
      assignmentId,
      action, // 'ACKNOWLEDGE' | 'START_WORK' | 'RESOLVE' | 'UPDATE_NOTES'
      officerId,
      notes,
      resolutionSummary,
      resolutionEvidenceUrl,
    } = body;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { report: true, team: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const now = new Date();

    if (action === 'ACKNOWLEDGE') {
      await prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          status: 'ACKNOWLEDGED',
          acknowledgedAt: now,
          officerId: officerId || assignment.officerId,
          notes: notes || assignment.notes,
        },
      });

      await prisma.report.update({
        where: { id: assignment.reportId },
        data: {
          status: 'ACKNOWLEDGED',
          acknowledgedAt: now,
        },
      });

      await prisma.statusHistory.create({
        data: {
          reportId: assignment.reportId,
          previousStatus: assignment.report.status,
          newStatus: 'ACKNOWLEDGED',
          changedById: officerId || null,
          changeReason: 'Field officer acknowledged assignment and dispatched team',
        },
      });
    } else if (action === 'START_WORK') {
      await prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          status: 'IN_PROGRESS',
          startedAt: now,
          notes: notes || assignment.notes,
        },
      });

      await prisma.report.update({
        where: { id: assignment.reportId },
        data: { status: 'IN_PROGRESS' },
      });

      await prisma.statusHistory.create({
        data: {
          reportId: assignment.reportId,
          previousStatus: assignment.report.status,
          newStatus: 'IN_PROGRESS',
          changedById: officerId || null,
          changeReason: 'Field repair team arrived on site and commenced physical repairs',
        },
      });
    } else if (action === 'RESOLVE') {
      if (!resolutionSummary) {
        return NextResponse.json({ error: 'Resolution summary is required to mark field work completed.' }, { status: 400 });
      }

      await prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          status: 'COMPLETED',
          completedAt: now,
          notes: notes || assignment.notes,
        },
      });

      // Decrement team active workload
      await prisma.team.update({
        where: { id: assignment.teamId },
        data: {
          activeWorkload: Math.max(0, assignment.team.activeWorkload - 1),
        },
      });

      // Update Report to CITIZEN_REVIEW
      await prisma.report.update({
        where: { id: assignment.reportId },
        data: {
          status: 'CITIZEN_REVIEW',
          resolvedAt: now,
          resolutionSummary,
          resolutionEvidenceUrl: resolutionEvidenceUrl || null,
        },
      });

      // Record resolution evidence attachment if photo URL provided
      if (resolutionEvidenceUrl) {
        await prisma.reportAttachment.create({
          data: {
            reportId: assignment.reportId,
            fileUrl: resolutionEvidenceUrl,
            fileName: 'completion_photo.jpg',
            fileType: 'image/jpeg',
            fileSize: 1024 * 400,
            isResolutionEvidence: true,
            uploadedBy: officerId || 'field-officer',
          },
        });
      }

      await prisma.statusHistory.create({
        data: {
          reportId: assignment.reportId,
          previousStatus: assignment.report.status,
          newStatus: 'CITIZEN_REVIEW',
          changedById: officerId || null,
          changeReason: `Field work completed by team. Submitted for citizen review: ${resolutionSummary}`,
        },
      });

      // Notify citizen for verification
      await prisma.notification.create({
        data: {
          userId: assignment.report.citizenId,
          title: `Action Needed: Verify Resolution for ${assignment.report.referenceNumber}`,
          titleBn: `নাগরিক যাচাই প্রয়োজন: ${assignment.report.referenceNumber}`,
          message: `Field team completed work: "${resolutionSummary}". Please review and confirm satisfaction.`,
          messageBn: `মাঠপর্যায়ের মেরামত সম্পন্ন হয়েছে। অনুগ্রহ করে পরিদর্শন করে সন্তুষ্টি নিশ্চিত করুন।`,
          type: 'CITIZEN_ACTION',
          linkUrl: '/citizen',
        },
      });
    }

    return NextResponse.json({ success: true, action });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Field operation failed' }, { status: 500 });
  }
}
