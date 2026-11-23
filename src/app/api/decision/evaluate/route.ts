import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  calculateExplainablePriority,
  evaluateIntelligentAssignment,
} from '@/lib/decision-engine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      safety = 50,
      severity = 50,
      people = 50,
      location = 50,
      sla = 0,
      corroboration = 0,
      departmentId,
      serviceZoneId,
      categoryCode = 'ROADS',
      reportLat = 23.8223,
      reportLng = 90.3654,
      customWeights,
    } = body;

    // 1. Calculate Priority Score
    const priorityResult = await calculateExplainablePriority(
      {
        safety: parseFloat(safety),
        severity: parseFloat(severity),
        people: parseFloat(people),
        location: parseFloat(location),
        sla: parseFloat(sla),
        corroboration: parseFloat(corroboration),
      },
      customWeights
    );

    // 2. Evaluate Intelligent Assignment if departmentId provided
    let assignmentResult = null;
    if (departmentId) {
      assignmentResult = await evaluateIntelligentAssignment({
        departmentId,
        serviceZoneId: serviceZoneId || null,
        categoryCode,
        reportLat: parseFloat(reportLat),
        reportLng: parseFloat(reportLng),
        priorityScore: priorityResult.totalScore,
      });
    }

    return NextResponse.json({
      priority: priorityResult,
      assignment: assignmentResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Evaluation failed' }, { status: 500 });
  }
}
