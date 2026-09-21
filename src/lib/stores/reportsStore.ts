import { create } from 'zustand';
import type { Report, Finding } from '../../shared/types';
import { db } from '../../data/db';
import { createEditHistoryEntry } from '../hashChain';

interface ReportsStoreState {
  reports: Report[];
  activeReport: Report | null;
  isLoading: boolean;
  loadReports: () => Promise<void>;
  selectReport: (id: string) => Promise<void>;
  updateReportField: (reportId: string, field: keyof Report, value: unknown) => Promise<void>;
  verifyFinding: (reportId: string, findingId: string) => Promise<void>;
  assignMissingEntity: (reportId: string, entityField: string, value: string) => Promise<void>;
  undoReportEdit: (reportId: string) => Promise<void>;
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
}));
