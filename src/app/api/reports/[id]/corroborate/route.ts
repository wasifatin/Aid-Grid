import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateExplainablePriority } from '@/lib/decision-engine';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: params.id },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Increment corroboration count and boost urgency
    const newCorrobCount = report.corroborationCount + 1;
    const newCorrobScore = Math.min(100, report.corroborationScore + 10);

    const reCalculated = await calculateExplainablePriority({
      safety: report.safetyScore,
      severity: report.severityScore,
      people: report.peopleScore,
      location: report.locationScore,
      sla: report.slaScore,
      corroboration: newCorrobScore,
    });

    const updated = await prisma.report.update({
      where: { id: params.id },
      data: {
        corroborationCount: newCorrobCount,
        corroborationScore: newCorrobScore,
        priority: reCalculated.priorityBand,
        priorityScore: reCalculated.totalScore,
      },
    });

    // Update Decision Explanation
    await prisma.decisionExplanation.upsert({
      where: { id: `de-${report.id}` },
      create: {
        id: `de-${report.id}`,
        reportId: report.id,
        factorSafety: report.safetyScore,
        factorSeverity: report.severityScore,
        factorPeople: report.peopleScore,
        factorLocation: report.locationScore,
        factorSla: report.slaScore,
        factorCorroboration: newCorrobScore,
        totalScore: reCalculated.totalScore,
        priorityBand: reCalculated.priorityBand,
        weightsJson: JSON.stringify(reCalculated.weights),
        rulesAppliedJson: JSON.stringify(reCalculated.rulesApplied),
        narrativeExplanation: reCalculated.narrativeExplanation,
      },
      update: {
        factorCorroboration: newCorrobScore,
        totalScore: reCalculated.totalScore,
        priorityBand: reCalculated.priorityBand,
        rulesAppliedJson: JSON.stringify(reCalculated.rulesApplied),
        narrativeExplanation: reCalculated.narrativeExplanation,
      },
    });

    return NextResponse.json({
      success: true,
      corroborationCount: newCorrobCount,
      priority: updated.priority,
      priorityScore: updated.priorityScore,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Corroboration failed' }, { status: 500 });
  }
}
