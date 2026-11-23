import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resumeWorkflowRun, runSlaEscalationHeartbeat } from '@/lib/workflow-engine';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('reportId');
    const status = searchParams.get('status');

    const where: any = {};
    if (reportId) where.reportId = reportId;
    if (status) where.status = status;

    const runs = await prisma.workflowRun.findMany({
      where,
      include: {
        report: {
          select: { referenceNumber: true, title: true, priority: true, status: true },
        },
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ runs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch workflow runs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, workflowRunId } = body;

    if (action === 'RESUME_FAILED') {
      if (!workflowRunId) {
        return NextResponse.json({ error: 'workflowRunId is required' }, { status: 400 });
      }

      const result = await resumeWorkflowRun(workflowRunId);
      return NextResponse.json({ success: true, result });
    }

    if (action === 'RUN_SLA_HEARTBEAT') {
      const result = await runSlaEscalationHeartbeat();
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Workflow action failed' }, { status: 500 });
  }
}
