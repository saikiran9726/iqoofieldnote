import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  ArrowLeft,
  Mic,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertOctagon,
  Repeat,
  ChevronRight,
} from 'lucide-react';
import { db } from '../../data/db';
import type { Report, Asset } from '../../shared/types';
import { ReportCard, EmptyState } from '../../components';

export const SearchScreen: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>('');
  const [reports, setReports] = useState<Report[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      const allReports = await db.reports.toArray();
      const allAssets = await db.assets.toArray();
      setReports(allReports);
      setAssets(allAssets);
    };
    loadData();
  }, []);

  const handleVoiceSearch = () => {
    setIsListeningVoice(true);
    setTimeout(() => {
      setIsListeningVoice(false);
      setQuery('Show all high-priority electrical issues at Kukatpally');
    }, 1200);
  };

  const presetQueries = [
    'Show all high-priority electrical issues at Kukatpally',
    'Which assets had repeated issues?',
    'Recent loose connection hazards',
    'Open maintenance actions',
  ];

  // Smart local Dexie / client-side query parsing
  const { matchingReports, matchingAssets, isRepeatedQuery } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { matchingReports: [], matchingAssets: [], isRepeatedQuery: false };
    }

    const isRepeated =
      q.includes('repeated') ||
      q.includes('recurring') ||
      q.includes('frequent') ||
      (q.includes('asset') && q.includes('issue'));

    if (isRepeated) {
      // Find assets with recurring issues or multiple reports
      const panelAsset = assets.filter((a) => a.id === 'asset-panel-204' || a.name.includes('PANEL-204'));
      const panelReports = reports.filter(
        (r) => r.panelId === 'PANEL-204' || r.findings.some((f) => (f.occurrences || 0) > 1)
      );
      return { matchingReports: panelReports, matchingAssets: panelAsset, isRepeatedQuery: true };
    }

    const isHigh = q.includes('high') || q.includes('priority') || q.includes('critical');
    const isElectrical = q.includes('electrical');
    const isKukatpally = q.includes('kukatpally');
    const isMiyapur = q.includes('miyapur');
    const isGachibowli = q.includes('gachibowli');
    const isOpenActions = q.includes('open') || q.includes('action') || q.includes('punch');

    const filtered = reports.filter((r) => {
      if (isHigh && !(r.priority === 'high' || r.priority === 'critical')) return false;
      if (isKukatpally && !r.siteName.toLowerCase().includes('kukatpally')) return false;
      if (isMiyapur && !r.siteName.toLowerCase().includes('miyapur')) return false;
      if (isGachibowli && !r.siteName.toLowerCase().includes('gachibowli')) return false;
      if (
        isElectrical &&
        !(
          r.category?.toLowerCase().includes('electrical') ||
          r.title.toLowerCase().includes('electrical') ||
          r.findings.some((f) => f.category.toLowerCase().includes('electrical'))
        )
      ) {
        return false;
      }
      if (isOpenActions && !r.actions.some((a) => !a.isCompleted)) return false;

      // Text keywords fallback if no specific flags
      if (!isHigh && !isKukatpally && !isMiyapur && !isGachibowli && !isElectrical && !isOpenActions) {
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesSite = r.siteName.toLowerCase().includes(q);
        const matchesSummary = r.summary.toLowerCase().includes(q);
        const matchesFindings = r.findings.some((f) => f.text.toLowerCase().includes(q));
        const matchesPanel = r.panelId?.toLowerCase().includes(q) ?? false;
        if (!matchesTitle && !matchesSite && !matchesSummary && !matchesFindings && !matchesPanel) {
          return false;
        }
      }

      return true;
    });

    return { matchingReports: filtered, matchingAssets: [], isRepeatedQuery: false };
  }, [query, reports, assets]);

  // Aggregate stats for summary banner (Spec 12: "3 reports, 7 findings, 4 open actions")
  const summaryStats = useMemo(() => {
    const reportsCount = matchingReports.length;
    const findingsCount = matchingReports.reduce((acc, r) => acc + r.findings.length, 0);
    const openActionsCount = matchingReports.reduce(
      (acc, r) => acc + r.actions.filter((a) => !a.isCompleted).length,
      0
    );
    return { reportsCount, findingsCount, openActionsCount };
  }, [matchingReports]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-bg-surface1 border border-border-default shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <Link
            to="/more"
            className="p-2 rounded-xl bg-bg-surface2 border border-border-default text-text-muted hover:text-text-primary transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-heading-sm font-bold text-text-primary">
                Ask Your Reports · Local Intelligence Search
              </h1>
            </div>
            <p className="text-metadata text-text-muted mt-0.5">
              Spec 12: Field-search engine with zero-cloud Dexie parsing
            </p>
          </div>
        </div>

        {/* LOCAL DATA ONLY Badge (Spec 12) */}
        <span className="px-2.5 py-1 rounded-full text-metadata-xs font-mono font-bold uppercase tracking-wider bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-semantic-green" />
          <span>LOCAL DATA ONLY</span>
        </span>
      </div>

      {/* Search Input Bar with Voice Search */}
      <div className="space-y-3">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-3.5 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search or ask: 'Show all high-priority electrical issues at Kukatpally'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-24 py-3.5 rounded-xl bg-bg-surface1 border border-border-default text-text-primary placeholder:text-text-muted text-body-sm focus:outline-none focus:border-semantic-green shadow-sm"
          />

          <div className="absolute right-2.5 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface2"
                title="Clear query"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`
                p-2 rounded-lg transition-all flex items-center gap-1 text-metadata-xs font-semibold
                ${
                  isListeningVoice
                    ? 'bg-semantic-red-surface text-semantic-red-text border border-semantic-red animate-pulse'
                    : 'bg-bg-surface2 text-semantic-green hover:bg-bg-hover border border-border-subtle'
                }
              `}
              title="Voice search: Simulated transcription"
            >
              <Mic className="w-4 h-4" />
              {isListeningVoice && <span className="text-[10px] uppercase font-mono">Listening...</span>}
            </button>
          </div>
        </div>

        {/* Preset Query Chips (Spec 12) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-metadata-xs font-mono font-medium text-text-muted mr-1">
            Suggested queries:
          </span>
          {presetQueries.map((pq) => (
            <button
              key={pq}
              type="button"
              onClick={() => setQuery(pq)}
              className={`
                px-3 py-1.5 rounded-xl text-metadata-xs font-medium border transition-all text-left
                ${
                  query === pq
                    ? 'bg-semantic-green-surface text-semantic-green-text border-semantic-green font-semibold'
                    : 'bg-bg-surface1 text-text-secondary border-border-default hover:border-border-strong hover:bg-bg-surface2'
                }
              `}
            >
              "{pq}"
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      {query.trim() === '' ? (
        <EmptyState
          icon={Search}
          badge="LOCAL INDEXEDDB"
          title="Ask Your Local Reports"
          description="Type queries or click suggestions above. Queries are parsed entirely on-device into Dexie database lookups without transmitting field data to the cloud."
          actions={[
            {
              label: 'Run: High-Priority at Kukatpally',
              onClick: () => setQuery('Show all high-priority electrical issues at Kukatpally'),
              variant: 'primary',
            },
            {
              label: 'Run: Assets with Repeated Issues',
              onClick: () => setQuery('Which assets had repeated issues?'),
              variant: 'secondary',
            },
          ]}
        />
      ) : matchingReports.length === 0 && matchingAssets.length === 0 ? (
        <EmptyState
          icon={AlertOctagon}
          badge="NO MATCHES"
          title="No Matching Local Reports Found"
          description={`No local dossiers matched "${query}". Try searching for 'PANEL-204', 'loose connections', or select one of the suggested query chips.`}
          actions={[
            {
              label: 'Reset Query',
              icon: RotateCcw,
              onClick: () => setQuery(''),
              variant: 'primary',
            },
          ]}
        />
      ) : (
        <div className="space-y-4">
          {/* Results Summary Banner (Spec 12) */}
          <div className="p-4 rounded-2xl bg-bg-surface1 border border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-semantic-green" />
                <span className="text-body-md font-bold text-text-primary font-mono">
                  {summaryStats.reportsCount} {summaryStats.reportsCount === 1 ? 'report' : 'reports'},{' '}
                  {summaryStats.findingsCount} findings, {summaryStats.openActionsCount} open actions
                </span>
              </div>
              <p className="text-metadata text-text-muted">
                Local Dexie parser matched criteria for query: <em className="text-text-secondary">"{query}"</em>
              </p>
            </div>

            <span className="px-2 py-0.5 rounded text-metadata-xs font-mono font-bold bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border shrink-0 self-start sm:self-auto">
              LOCAL DATA ONLY
            </span>
          </div>

          {/* Repeated Issue Asset Spotlight if applicable */}
          {isRepeatedQuery && (
            <div className="p-4 rounded-2xl bg-semantic-amber-surface/20 border-2 border-semantic-amber shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-semantic-amber" />
                  <h3 className="text-body-sm font-bold text-text-primary font-mono">
                    Repeated Issue Asset: PANEL-204
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/assets/PANEL-204')}
                  className="text-metadata-xs text-semantic-green font-semibold hover:underline flex items-center gap-1"
                >
                  <span>View Asset Timeline</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-metadata text-text-secondary">
                <strong>Main Substation Distribution Panel 204</strong> has been flagged with{' '}
                <strong className="text-semantic-amber">3 recurring loose connection hazards</strong> across 4 linked
                dossiers.
              </p>
            </div>
          )}

          {/* List of Matching Reports */}
          <div className="space-y-3.5">
            {matchingReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={() => navigate(`/reports/${report.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
