import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const report = await prisma.report.findFirst({
      where: {
        OR: [{ id: params.id }, { referenceNumber: params.id }],
      },
      include: {
        category: true,
        department: true,
        serviceZone: true,
        citizen: {
          select: { id: true, fullName: true, role: true }, // Don't expose private NID or sensitive contact info publicly
        },
        attachments: true,
        assignments: {
          include: {
            team: {
              include: { skills: true },
            },
            officer: {
              select: { id: true, fullName: true, phone: true },
            },
          },
        },
        statusHistory: {
          include: {
            changedBy: { select: { fullName: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        decisionExplanations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        workflowRuns: {
          include: {
            steps: { orderBy: { stepNumber: 'asc' } },
          },
          orderBy: { runNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch report' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      status,
      resolutionSummary,
      resolutionEvidenceUrl,
      citizenVerified,
      citizenFeedbackRating,
      citizenFeedbackComment,
      reopenReason,
      changedById,
      changeReason,
    } = body;

    const current = await prisma.report.findUnique({
      where: { id: params.id },
    });

    if (!current) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (resolutionSummary) updateData.resolutionSummary = resolutionSummary;
    if (resolutionEvidenceUrl) updateData.resolutionEvidenceUrl = resolutionEvidenceUrl;
    if (status === 'RESOLVED') updateData.resolvedAt = new Date();

    // Citizen Review Confirmation
    if (citizenVerified !== undefined) {
      updateData.citizenVerified = citizenVerified;
      updateData.citizenConfirmedAt = new Date();
      if (citizenVerified === true) {
        updateData.status = 'CLOSED';
        updateData.closedAt = new Date();
      } else {
        updateData.status = 'REOPENED';
        updateData.reopenedAt = new Date();
        updateData.reopenReason = reopenReason || 'Citizen rejected resolution outcome.';
      }
    }

    if (citizenFeedbackRating !== undefined) updateData.citizenFeedbackRating = citizenFeedbackRating;
    if (citizenFeedbackComment !== undefined) updateData.citizenFeedbackComment = citizenFeedbackComment;

    const updated = await prisma.report.update({
      where: { id: params.id },
      data: updateData,
    });

    // Record Status History
    if (status && status !== current.status) {
      await prisma.statusHistory.create({
        data: {
          reportId: params.id,
          previousStatus: current.status,
          newStatus: status,
          changedById: changedById || null,
          changeReason: changeReason || `State transition to ${status}`,
        },
      });
    }

    return NextResponse.json({ success: true, report: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
}
