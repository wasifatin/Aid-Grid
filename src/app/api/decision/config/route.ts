import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rejectCitizenMutation } from '@/lib/auth';

export async function GET() {
  try {
    const config = await prisma.priorityConfig.findUnique({
      where: { id: 'default-config' },
    });
    return NextResponse.json({ config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const forbidden = rejectCitizenMutation(req);
  if (forbidden) return forbidden;

  try {
    const body = await req.json();
    const {
      safetyWeight,
      severityWeight,
      peopleWeight,
      locationWeight,
      slaWeight,
      corroborationWeight,
      criticalThreshold,
      highThreshold,
      mediumThreshold,
    } = body;

    const totalWeight =
      parseFloat(safetyWeight) +
      parseFloat(severityWeight) +
      parseFloat(peopleWeight) +
      parseFloat(locationWeight) +
      parseFloat(slaWeight) +
      parseFloat(corroborationWeight);

    // Validate weights sum to ~1.0
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      return NextResponse.json(
        { error: `Weights must sum to 1.0 (100%). Current sum: ${(totalWeight * 100).toFixed(1)}%` },
        { status: 400 }
      );
    }

    const updated = await prisma.priorityConfig.upsert({
      where: { id: 'default-config' },
      create: {
        id: 'default-config',
        safetyWeight: parseFloat(safetyWeight),
        severityWeight: parseFloat(severityWeight),
        peopleWeight: parseFloat(peopleWeight),
        locationWeight: parseFloat(locationWeight),
        slaWeight: parseFloat(slaWeight),
        corroborationWeight: parseFloat(corroborationWeight),
        criticalThreshold: parseFloat(criticalThreshold),
        highThreshold: parseFloat(highThreshold),
        mediumThreshold: parseFloat(mediumThreshold),
      },
      update: {
        safetyWeight: parseFloat(safetyWeight),
        severityWeight: parseFloat(severityWeight),
        peopleWeight: parseFloat(peopleWeight),
        locationWeight: parseFloat(locationWeight),
        slaWeight: parseFloat(slaWeight),
        corroborationWeight: parseFloat(corroborationWeight),
        criticalThreshold: parseFloat(criticalThreshold),
        highThreshold: parseFloat(highThreshold),
        mediumThreshold: parseFloat(mediumThreshold),
      },
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update config' }, { status: 500 });
  }
}
