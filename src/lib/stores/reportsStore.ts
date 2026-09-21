import { create } from 'zustand';
import type { Report, Finding, Action } from '../../shared/types';
import { db } from '../../data/db';
import { createEditHistoryEntry, recomputeChain } from '../hashChain';

interface ReportsStoreState {
  reports: Report[];
  activeReport: Report | null;
  isLoading: boolean;
  loadReports: () => Promise<void>;
  selectReport: (id: string) => Promise<void>;
  updateReportField: (reportId: string, field: keyof Report, value: unknown) => Promise<void>;
  verifyFinding: (reportId: string, findingId: string) => Promise<void>;
  toggleActionStatus: (reportId: string, actionId: string) => Promise<void>;
  assignMissingEntity: (reportId: string, entityField: string, value: string) => Promise<void>;
  undoReportEdit: (reportId: string) => Promise<void>;
  saveSignature: (reportId: string, signatureDataUrl: string) => Promise<void>;
  tamperAuditEntry: (reportId: string, entryIndex: number, fakeValue: string) => Promise<void>;
  restoreAuditChain: (reportId: string) => Promise<void>;
}

export const useReportsStore = create<ReportsStoreState>((set, get) => ({
  reports: [],
  activeReport: null,
  isLoading: false,

  loadReports: async () => {
    set({ isLoading: true });
    try {
      const allReports = await db.reports.toArray();
      // Sort newest first
      allReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      set({ reports: allReports, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  selectReport: async (id: string) => {
    const report = await db.reports.get(id);
    if (report) {
      set({ activeReport: report });
    }
  },

  updateReportField: async (reportId: string, field: keyof Report, value: unknown) => {
    const report = await db.reports.get(reportId);
    if (!report) return;

    const beforeVal = report[field];
    const prevHash =
      report.editHistory.length > 0
        ? report.editHistory[report.editHistory.length - 1]?.hash
        : undefined;

    const editEntry = await createEditHistoryEntry({
      entityId: reportId,
      entityType: 'report',
      field: String(field),
      before: beforeVal,
      after: value,
      prevHash,
    });

    const updatedReport: Report = {
      ...report,
      [field]: value,
      editHistory: [...report.editHistory, editEntry],
    };

    await db.reports.put(updatedReport);
    set({
      activeReport: get().activeReport?.id === reportId ? updatedReport : get().activeReport,
      reports: get().reports.map((r) => (r.id === reportId ? updatedReport : r)),
    });
  },

  verifyFinding: async (reportId: string, findingId: string) => {
    const report = await db.reports.get(reportId);
    if (!report) return;

    const updatedFindings: Finding[] = report.findings.map((f) =>
      f.id === findingId ? { ...f, isVerified: true } : f
    );

    const prevHash =
      report.editHistory.length > 0
        ? report.editHistory[report.editHistory.length - 1]?.hash
        : undefined;

    const editEntry = await createEditHistoryEntry({
      entityId: reportId,
      entityType: 'finding',
      field: `finding:${findingId}:isVerified`,
      before: false,
      after: true,
      prevHash,
    });

    const updatedReport: Report = {
      ...report,
      findings: updatedFindings,
      editHistory: [...report.editHistory, editEntry],
    };

    await db.reports.put(updatedReport);
    set({
      activeReport: get().activeReport?.id === reportId ? updatedReport : get().activeReport,
      reports: get().reports.map((r) => (r.id === reportId ? updatedReport : r)),
    });
  },

  toggleActionStatus: async (reportId: string, actionId: string) => {
    const report = await db.reports.get(reportId);
    if (!report) return;

    const targetAction = report.actions.find((a) => a.id === actionId);
    if (!targetAction) return;

    const newCompleted = !targetAction.isCompleted;
    const updatedActions: Action[] = report.actions.map((a) =>
      a.id === actionId
        ? {
            ...a,
            isCompleted: newCompleted,
            status: newCompleted ? 'done' : 'todo',
          }
        : a
    );

    const prevHash =
      report.editHistory.length > 0
        ? report.editHistory[report.editHistory.length - 1]?.hash
        : undefined;

    const editEntry = await createEditHistoryEntry({
      entityId: reportId,
      entityType: 'action',
      field: `action:${actionId}:isCompleted`,
      before: targetAction.isCompleted,
      after: newCompleted,
      prevHash,
    });

    const updatedReport: Report = {
      ...report,
      actions: updatedActions,
      editHistory: [...report.editHistory, editEntry],
    };

    await db.reports.put(updatedReport);
    set({
      activeReport: get().activeReport?.id === reportId ? updatedReport : get().activeReport,
      reports: get().reports.map((r) => (r.id === reportId ? updatedReport : r)),
    });
  },

  assignMissingEntity: async (reportId: string, entityField: string, value: string) => {
    const report = await db.reports.get(reportId);
    if (!report) return;

    const prevHash =
      report.editHistory.length > 0
        ? report.editHistory[report.editHistory.length - 1]?.hash
        : undefined;

    const editEntry = await createEditHistoryEntry({
      entityId: reportId,
      entityType: 'report',
      field: entityField,
      before: null,
      after: value,
      prevHash,
    });

    const updatedReport: Report = {
      ...report,
      [entityField]: value,
      isPanelIdMissing: entityField === 'panelId' ? false : report.isPanelIdMissing,
      editHistory: [...report.editHistory, editEntry],
    };

    await db.reports.put(updatedReport);
    set({
      activeReport: get().activeReport?.id === reportId ? updatedReport : get().activeReport,
      reports: get().reports.map((r) => (r.id === reportId ? updatedReport : r)),
    });
  },

  undoReportEdit: async (reportId: string) => {
    const report = await db.reports.get(reportId);
    if (!report || report.editHistory.length === 0) return;

    const lastEdit = report.editHistory[report.editHistory.length - 1];
    if (!lastEdit) return;

    const revertedHistory = report.editHistory.slice(0, -1);
    const updatedReport: Report = {
      ...report,
      [lastEdit.field]: lastEdit.before,
      editHistory: revertedHistory,
    };

    await db.reports.put(updatedReport);
    set({
      activeReport: get().activeReport?.id === reportId ? updatedReport : get().activeReport,
      reports: get().reports.map((r) => (r.id === reportId ? updatedReport : r)),
    });
  },

  saveSignature: async (reportId: string, signatureDataUrl: string) => {
    const report = await db.reports.get(reportId);
    if (!report) return;

    const prevHash =
      report.editHistory.length > 0
        ? report.editHistory[report.editHistory.length - 1]?.hash
        : undefined;

    const editEntry = await createEditHistoryEntry({
      entityId: reportId,
      entityType: 'report',
      field: 'signatureDataUrl',
      before: null,
      after: '[Cryptographic Inspector Signature Sealed]',
      prevHash,
    });

    const updatedReport: Report = {
      ...report,
      signatureDataUrl,
      signedAt: new Date().toISOString(),
      editHistory: [...report.editHistory, editEntry],
    };

    await db.reports.put(updatedReport);
    set({
      activeReport: get().activeReport?.id === reportId ? updatedReport : get().activeReport,
      reports: get().reports.map((r) => (r.id === reportId ? updatedReport : r)),
    });
  },

  tamperAuditEntry: async (reportId: string, entryIndex: number, fakeValue: string) => {
    const report = await db.reports.get(reportId);
    if (!report || !report.editHistory[entryIndex]) return;

    // Mutate the stored after value WITHOUT updating its SHA-256 hash or links
    const mutatedHistory = [...report.editHistory];
    const targetEntry = mutatedHistory[entryIndex];
    if (targetEntry) {
      mutatedHistory[entryIndex] = {
        ...targetEntry,
        after: fakeValue, // Tampered data!
      };
    }

    const tamperedReport: Report = {
      ...report,
      editHistory: mutatedHistory,
    };

    await db.reports.put(tamperedReport);
    set({
      activeReport: get().activeReport?.id === reportId ? tamperedReport : get().activeReport,
      reports: get().reports.map((r) => (r.id === reportId ? tamperedReport : r)),
    });
  },

  restoreAuditChain: async (reportId: string) => {
    const report = await db.reports.get(reportId);
    if (!report) return;

    const recomputed = await recomputeChain(report.editHistory);
    const restoredReport: Report = {
      ...report,
      editHistory: recomputed,
    };

    await db.reports.put(restoredReport);
    set({
      activeReport: get().activeReport?.id === reportId ? restoredReport : get().activeReport,
      reports: get().reports.map((r) => (r.id === reportId ? restoredReport : r)),
    });
  },
}));

