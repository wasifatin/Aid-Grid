import { prisma } from './prisma';
import {
  calculateExplainablePriority,
  evaluateIntelligentAssignment,
  calculateHaversineDistance,
} from './decision-engine';
import { WORKFLOW_STEPS_DEF } from './constants';

export interface WorkflowExecutionResult {
  workflowRunId: string;
  reportId: string;
  status: 'COMPLETED' | 'RETRY_PENDING' | 'FAILED' | 'REQUIRES_MANUAL_REVIEW';
  currentStep: number;
  lastSuccessfulStep: number;
  stepsCompleted: number;
  error?: string | null;
}

/**
 * A07 Engine: Initialize and execute multi-step workflow for a report
 */
export async function executeReportWorkflow(params: {
  reportId: string;
  injectFailAtStep?: number | null;
  runNumber?: number;
}): Promise<WorkflowExecutionResult> {
  const { reportId, injectFailAtStep = null, runNumber = 1 } = params;

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      category: true,
      department: true,
      serviceZone: true,
    },
  });

  if (!report) {
    throw new Error(`Report ${reportId} not found`);
  }

  const idempotencyKey = `wf-${report.referenceNumber}-run${runNumber}`;

  // Find or create WorkflowRun
  let workflowRun = await prisma.workflowRun.findUnique({
    where: { idempotencyKey },
    include: { steps: true },
  });

  if (!workflowRun) {
    workflowRun = await prisma.workflowRun.create({
      data: {
        reportId,
        runNumber,
        status: 'PROCESSING',
        currentStep: 1,
        lastSuccessfulStep: 0,
        maxRetries: 3,
        retryCount: 0,
        idempotencyKey,
        failureInjected: injectFailAtStep !== null,
        injectFailAtStep,
        startedAt: new Date(),
      },
      include: { steps: true },
    });
  } else {
    // If resuming, mark PROCESSING
    workflowRun = await prisma.workflowRun.update({
      where: { id: workflowRun.id },
      data: {
        status: 'PROCESSING',
        updatedAt: new Date(),
      },
      include: { steps: true },
    });
  }

  const startStep = Math.max(1, workflowRun.lastSuccessfulStep + 1);

  // Execute steps sequentially from startStep to 8 (Triage & Dispatch pipeline)
  for (let stepNum = startStep; stepNum <= 8; stepNum++) {
    const stepDef = WORKFLOW_STEPS_DEF.find((s) => s.step === stepNum);
    const stepName = stepDef ? stepDef.name : `STEP_${stepNum}`;
    const startTime = Date.now();

    // Check for Judge-Injected Simulated Failure
    if (workflowRun.injectFailAtStep === stepNum) {
      const errorMsg = `SIMULATED_FAILURE: Worker failure injected at Step ${stepNum} [${stepName}] for Judge Demonstration.`;

      // Upsert failed step
      await prisma.workflowStep.upsert({
        where: {
          workflowRunId_stepNumber: {
            workflowRunId: workflowRun.id,
            stepNumber: stepNum,
          },
        },
        create: {
          workflowRunId: workflowRun.id,
          stepNumber: stepNum,
          stepName,
          status: 'FAILED',
          attemptCount: 1,
          inputPayloadJson: JSON.stringify({ reportId, ref: report.referenceNumber }),
          errorDetailsJson: JSON.stringify({
            error: errorMsg,
            stepNumber: stepNum,
            injected: true,
            timestamp: new Date().toISOString(),
          }),
          executionDurationMs: Date.now() - startTime,
          executedAt: new Date(),
        },
        update: {
          status: 'FAILED',
          attemptCount: { increment: 1 },
          errorDetailsJson: JSON.stringify({
            error: errorMsg,
            stepNumber: stepNum,
            injected: true,
            timestamp: new Date().toISOString(),
          }),
          executedAt: new Date(),
        },
      });

      // Update WorkflowRun to RETRY_PENDING
      await prisma.workflowRun.update({
        where: { id: workflowRun.id },
        data: {
          status: 'RETRY_PENDING',
          currentStep: stepNum,
          errorMessage: errorMsg,
          retryCount: { increment: 1 },
          nextRetryAt: new Date(Date.now() + 5000), // 5s backoff
        },
      });

      return {
        workflowRunId: workflowRun.id,
        reportId,
        status: 'RETRY_PENDING',
        currentStep: stepNum,
        lastSuccessfulStep: stepNum - 1,
        stepsCompleted: stepNum - 1,
        error: errorMsg,
      };
    }

    try {
      let outputData: Record<string, unknown> = {};

      // STEP 1: REPORT_CREATED
      if (stepNum === 1) {
        outputData = {
          referenceNumber: report.referenceNumber,
          createdAt: report.createdAt,
          verified: true,
        };
      }

      // STEP 2: INPUT_VALIDATION
      else if (stepNum === 2) {
        if (!report.title || !report.description) {
          throw new Error('Validation failed: Title and Description are required.');
        }
        if (report.latitude < -90 || report.latitude > 90 || report.longitude < -180 || report.longitude > 180) {
          throw new Error('Validation failed: Invalid geographic coordinates.');
        }
        outputData = {
          validated: true,
          coordinatesValid: true,
          addressValid: Boolean(report.address),
        };
        await prisma.report.update({
          where: { id: reportId },
          data: { status: 'VALIDATING' },
        });
      }

      // STEP 3: DUPLICATE_DETECTION
      else if (stepNum === 3) {
        // Find existing reports in same category within 500m
        const existingNearby = await prisma.report.findMany({
          where: {
            categoryId: report.categoryId,
            id: { not: report.id },
            status: { notIn: ['CLOSED', 'REJECTED'] },
          },
        });

        let duplicateFoundId: string | null = null;
        for (const other of existingNearby) {
          const dist = calculateHaversineDistance(
            report.latitude,
            report.longitude,
            other.latitude,
            other.longitude
          );
          if (dist <= 0.5) {
            // within 500 meters
            duplicateFoundId = other.id;
            break;
          }
        }

        outputData = {
          nearbyChecked: existingNearby.length,
          duplicateFound: Boolean(duplicateFoundId),
          duplicateOfId: duplicateFoundId,
        };

        if (duplicateFoundId) {
          // Increment corroboration count on original report
          await prisma.report.update({
            where: { id: duplicateFoundId },
            data: {
              corroborationCount: { increment: 1 },
              corroborationScore: { increment: 10 },
            },
          });
        }
      }

      // STEP 4: INTELLIGENT_TRIAGE (A02 Decision Engine)
      else if (stepNum === 4) {
        const triageResult = await calculateExplainablePriority({
          safety: report.safetyScore,
          severity: report.severityScore,
          people: report.peopleScore,
          location: report.locationScore,
          sla: report.slaScore,
          corroboration: report.corroborationScore,
        });

        await prisma.report.update({
          where: { id: reportId },
          data: {
            status: 'TRIAGED',
            priority: triageResult.priorityBand,
            priorityScore: triageResult.totalScore,
          },
        });

        // Upsert decision explanation
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
            factorCorroboration: report.corroborationScore,
            totalScore: triageResult.totalScore,
            priorityBand: triageResult.priorityBand,
            weightsJson: JSON.stringify(triageResult.weights),
            rulesAppliedJson: JSON.stringify(triageResult.rulesApplied),
            narrativeExplanation: triageResult.narrativeExplanation,
          },
          update: {
            totalScore: triageResult.totalScore,
            priorityBand: triageResult.priorityBand,
            rulesAppliedJson: JSON.stringify(triageResult.rulesApplied),
            narrativeExplanation: triageResult.narrativeExplanation,
          },
        });

        outputData = {
          score: triageResult.totalScore,
          priority: triageResult.priorityBand,
          rulesCount: triageResult.rulesApplied.length,
        };
      }

      // STEP 5: DEPARTMENT_EVALUATION (A02 Skill & Jurisdiction Assignment)
      else if (stepNum === 5) {
        const deptId = report.departmentId || report.category.defaultDepartmentId;
        const assignmentEval = await evaluateIntelligentAssignment({
          reportId: report.id,
          departmentId: deptId,
          serviceZoneId: report.serviceZoneId,
          categoryCode: report.category.code,
          reportLat: report.latitude,
          reportLng: report.longitude,
          priorityScore: report.priorityScore,
        });

        outputData = {
          isFeasible: assignmentEval.isFeasible,
          recommendedTeamId: assignmentEval.recommendedTeam?.teamId || null,
          recommendedTeamName: assignmentEval.recommendedTeam?.teamName || null,
          assignmentCost: assignmentEval.recommendedTeam?.assignmentCost || null,
          infeasibilityReason: assignmentEval.infeasibilityReason,
        };

        if (!assignmentEval.isFeasible) {
          // Send to supervisor review
          await prisma.report.update({
            where: { id: reportId },
            data: { status: 'NEEDS_INFORMATION' },
          });

          await prisma.decisionExplanation.update({
            where: { id: `de-${report.id}` },
            data: {
              isSupervisorReviewReq: true,
              infeasibilityReason: assignmentEval.infeasibilityReason,
            },
          });
        }
      }

      // STEP 6: WORK_ASSIGNMENT
      else if (stepNum === 6) {
        // Retrieve recommended team from step 5 output or find primary team
        const deptId = report.departmentId || report.category.defaultDepartmentId;
        const assignmentEval = await evaluateIntelligentAssignment({
          reportId: report.id,
          departmentId: deptId,
          serviceZoneId: report.serviceZoneId,
          categoryCode: report.category.code,
          reportLat: report.latitude,
          reportLng: report.longitude,
          priorityScore: report.priorityScore,
        });

        if (assignmentEval.recommendedTeam) {
          const team = assignmentEval.recommendedTeam;

          // Check for existing assignment to prevent duplicates
          const existingAssignment = await prisma.assignment.findFirst({
            where: { reportId: report.id, teamId: team.teamId },
          });

          if (!existingAssignment) {
            await prisma.assignment.create({
              data: {
                reportId: report.id,
                teamId: team.teamId,
                status: 'PENDING_ACK',
                assignmentCost: team.assignmentCost,
                distanceKm: team.distanceKm,
                assignedAt: new Date(),
              },
            });

            // Increment team workload
            await prisma.team.update({
              where: { id: team.teamId },
              data: { activeWorkload: { increment: 1 } },
            });
          }

          await prisma.report.update({
            where: { id: report.id },
            data: {
              status: 'ASSIGNED',
              departmentId: deptId,
            },
          });

          outputData = {
            assigned: true,
            teamId: team.teamId,
            teamName: team.teamName,
          };
        } else {
          outputData = {
            assigned: false,
            reason: 'Assignment infeasible, awaiting manual supervisor dispatch.',
          };
        }
      }

      // STEP 7: NOTIFICATION_DISPATCH
      else if (stepNum === 7) {
        // Dispatch in-app notification to Citizen
        await prisma.notification.create({
          data: {
            userId: report.citizenId,
            title: `Issue ${report.referenceNumber} Triaged & Assigned`,
            titleBn: `অভিযোগ ${report.referenceNumber} মূল্যায়ন ও টিম বরাদ্দ সম্পন্ন`,
            message: `Your report "${report.title}" has been assigned for municipal resolution. Priority: ${report.priority}.`,
            messageBn: `আপনার অভিযোগ "${report.title}" সমাধানের জন্য রেসপন্স টিমের কাছে পাঠানো হয়েছে।`,
            type: 'STATUS_CHANGE',
            linkUrl: '/citizen',
          },
        });

        outputData = {
          citizenNotified: true,
          notificationsSent: 1,
        };
      }

      // STEP 8: SLA_MONITORING
      else if (stepNum === 8) {
        // Lookup SLA policy
        const policy = await prisma.slaPolicy.findFirst({
          where: {
            issueCategoryId: report.categoryId,
            priority: report.priority,
          },
        });

        const ackHours = policy ? policy.maxAckHours : 4;
        const resHours = policy ? policy.maxResolutionHours : 24;

        const ackDeadline = new Date(Date.now() + ackHours * 3600 * 1000);
        const resDeadline = new Date(Date.now() + resHours * 3600 * 1000);

        await prisma.report.update({
          where: { id: report.id },
          data: {
            ackDeadline,
            resolutionDeadline: resDeadline,
          },
        });

        outputData = {
          ackDeadline: ackDeadline.toISOString(),
          resolutionDeadline: resDeadline.toISOString(),
          maxAckHours: ackHours,
          maxResolutionHours: resHours,
        };
      }

      const durationMs = Date.now() - startTime;

      // Mark step completed
      await prisma.workflowStep.upsert({
        where: {
          workflowRunId_stepNumber: {
            workflowRunId: workflowRun.id,
            stepNumber: stepNum,
          },
        },
        create: {
          workflowRunId: workflowRun.id,
          stepNumber: stepNum,
          stepName,
          status: 'COMPLETED',
          attemptCount: 1,
          inputPayloadJson: JSON.stringify({ reportId, stepNum }),
          outputPayloadJson: JSON.stringify(outputData),
          executionDurationMs: durationMs,
          executedAt: new Date(),
        },
        update: {
          status: 'COMPLETED',
          attemptCount: { increment: 1 },
          outputPayloadJson: JSON.stringify(outputData),
          errorDetailsJson: null,
          executionDurationMs: durationMs,
          executedAt: new Date(),
        },
      });

      // Update WorkflowRun last successful step
      await prisma.workflowRun.update({
        where: { id: workflowRun.id },
        data: {
          currentStep: stepNum + 1,
          lastSuccessfulStep: stepNum,
          errorMessage: null,
        },
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);

      await prisma.workflowStep.upsert({
        where: {
          workflowRunId_stepNumber: {
            workflowRunId: workflowRun.id,
            stepNumber: stepNum,
          },
        },
        create: {
          workflowRunId: workflowRun.id,
          stepNumber: stepNum,
          stepName,
          status: 'FAILED',
          attemptCount: 1,
          inputPayloadJson: JSON.stringify({ reportId, stepNum }),
          errorDetailsJson: JSON.stringify({ error: errorMsg }),
          executionDurationMs: Date.now() - startTime,
          executedAt: new Date(),
        },
        update: {
          status: 'FAILED',
          attemptCount: { increment: 1 },
          errorDetailsJson: JSON.stringify({ error: errorMsg }),
          executedAt: new Date(),
        },
      });

      await prisma.workflowRun.update({
        where: { id: workflowRun.id },
        data: {
          status: 'FAILED',
          errorMessage: errorMsg,
        },
      });

      return {
        workflowRunId: workflowRun.id,
        reportId,
        status: 'FAILED',
        currentStep: stepNum,
        lastSuccessfulStep: stepNum - 1,
        stepsCompleted: stepNum - 1,
        error: errorMsg,
      };
    }
  }

  // Completed all pipeline steps
  await prisma.workflowRun.update({
    where: { id: workflowRun.id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  return {
    workflowRunId: workflowRun.id,
    reportId,
    status: 'COMPLETED',
    currentStep: 8,
    lastSuccessfulStep: 8,
    stepsCompleted: 8,
    error: null,
  };
}

/**
 * A07 Engine: Resumes and recovers a failed or retry-pending workflow run
 */
export async function resumeWorkflowRun(workflowRunId: string): Promise<WorkflowExecutionResult> {
  const workflowRun = await prisma.workflowRun.findUnique({
    where: { id: workflowRunId },
  });

  if (!workflowRun) {
    throw new Error(`Workflow run ${workflowRunId} not found`);
  }

  // Clear injected failure to allow clean resumption
  await prisma.workflowRun.update({
    where: { id: workflowRunId },
    data: {
      injectFailAtStep: null,
      failureInjected: false,
      status: 'PROCESSING',
    },
  });

  // Re-run execution starting from last successful step
  return executeReportWorkflow({
    reportId: workflowRun.reportId,
    injectFailAtStep: null,
    runNumber: workflowRun.runNumber,
  });
}

/**
 * SLA Escalation Heartbeat Worker
 * Evaluates all open reports and auto-escalates overdue work
 */
export async function runSlaEscalationHeartbeat(): Promise<{
  scannedCount: number;
  escalatedCount: number;
  escalatedReportRefs: string[];
}> {
  const now = new Date();

  // Find reports that have breached deadlines and are not yet escalated
  const overdueReports = await prisma.report.findMany({
    where: {
      status: { in: ['ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS'] },
      OR: [
        {
          ackDeadline: { lt: now },
          status: 'ASSIGNED',
        },
        {
          resolutionDeadline: { lt: now },
          status: { in: ['ACKNOWLEDGED', 'IN_PROGRESS'] },
        },
      ],
    },
  });

  const escalatedReportRefs: string[] = [];

  for (const rep of overdueReports) {
    const reason =
      rep.status === 'ASSIGNED'
        ? `SLA Breach: Acknowledgement deadline exceeded (${rep.ackDeadline?.toISOString()})`
        : `SLA Breach: Resolution deadline exceeded (${rep.resolutionDeadline?.toISOString()})`;

    await prisma.report.update({
      where: { id: rep.id },
      data: {
        status: 'ESCALATED',
        escalatedAt: now,
        escalationReason: reason,
      },
    });

    await prisma.statusHistory.create({
      data: {
        reportId: rep.id,
        previousStatus: rep.status,
        newStatus: 'ESCALATED',
        changeReason: reason,
      },
    });

    // Notify Department Manager
    const managers = await prisma.profile.findMany({
      where: { role: 'DEPARTMENT_MANAGER' },
    });

    for (const mgr of managers) {
      await prisma.notification.create({
        data: {
          userId: mgr.id,
          title: `Overdue SLA Escalation: ${rep.referenceNumber}`,
          titleBn: `এসএলএ সময়সীমা অতিক্রান্ত: ${rep.referenceNumber}`,
          message: `${reason}. Report "${rep.title}" moved to supervisor escalation queue.`,
          messageBn: `${rep.title} রিপোর্টটির সময়সীমা শেষ হওয়ায় ঊর্ধ্বতন তদারকি তালিকায় স্থানান্তর করা হয়েছে।`,
          type: 'ESCALATION',
          linkUrl: '/workflow',
        },
      });
    }

    escalatedReportRefs.push(rep.referenceNumber);
  }

  return {
    scannedCount: overdueReports.length,
    escalatedCount: escalatedReportRefs.length,
    escalatedReportRefs,
  };
}
