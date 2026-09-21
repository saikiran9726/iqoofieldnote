import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RotateCcw, Search } from 'lucide-react';
import {
  EmptyState,
  ReportCard,
  QuestionCard,
  Button,
  SearchBar,
  FilterChip,
} from '../../components';
import { useReportsStore } from '../../lib/stores';
import { resetDemoData } from '../../data/db';

type FilterType = 'all' | 'high' | 'open' | 'completed' | 'kukatpally' | 'miyapur' | 'gachibowli';

export const ReportsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { reports, loadReports, assignMissingEntity } = useReportsStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedSite, setSelectedSite] = useState<string>('all');

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const heroReport = reports.find((r) => r.isHero);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // Filter tab criteria
      if (activeFilter === 'high') {
        if (report.priority !== 'high' && report.priority !== 'critical') return false;
      } else if (activeFilter === 'open') {
        if (report.status === 'verified' || report.status === 'archived') return false;
      } else if (activeFilter === 'completed') {
        if (report.status !== 'verified' && report.status !== 'archived') return false;
      } else if (activeFilter === 'kukatpally') {
        if (!report.siteName.toLowerCase().includes('kukatpally')) return false;
      } else if (activeFilter === 'miyapur') {
        if (!report.siteName.toLowerCase().includes('miyapur')) return false;
      } else if (activeFilter === 'gachibowli') {
        if (!report.siteName.toLowerCase().includes('gachibowli')) return false;
      }

      // Site dropdown filter if specified
      if (selectedSite !== 'all') {
        if (!report.siteName.toLowerCase().includes(selectedSite.toLowerCase())) return false;
      }

      // Search query criteria
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = report.title.toLowerCase().includes(q);
        const matchesSite = report.siteName.toLowerCase().includes(q);
        const matchesSummary = report.summary.toLowerCase().includes(q);
        const matchesCategory = report.category?.toLowerCase().includes(q) ?? false;
        const matchesPanel = report.panelId?.toLowerCase().includes(q) ?? false;
        const matchesFindings = report.findings.some((f) => f.text.toLowerCase().includes(q));

        if (!matchesTitle && !matchesSite && !matchesSummary && !matchesCategory && !matchesPanel && !matchesFindings) {
          return false;
        }
      }

      return true;
    });
  }, [reports, activeFilter, selectedSite, searchQuery]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-bg-surface1 border border-border-default shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-heading-sm font-bold text-text-primary">
              Inspection Dossiers & Audits
            </h1>
            <span className="px-2 py-0.5 rounded text-metadata-xs font-mono font-bold bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border">
              {reports.length} INDEXED
            </span>
          </div>
          <p className="text-metadata text-text-muted mt-0.5">
            Auto-compiled from voice transcripts, sensor readings & on-device NER
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={RotateCcw}
            onClick={async () => {
              await resetDemoData();
              await loadReports();
            }}
          >
            Reset Demo Data
          </Button>
        </div>
      </div>

      {/* Missing Panel ID Prompt on Hero Report if unresolved */}
      {heroReport && heroReport.isPanelIdMissing && (
        <QuestionCard
          question="Substation Panel identifier was not stated in the voice memo. Assign to PANEL-204 based on GPS coordinates?"
          missingField="Panel ID"
          suggestedValue="PANEL-204"
          onResolve={async (val) => {
            await assignMissingEntity(heroReport.id, 'panelId', val);
            await loadReports();
          }}
        />
      )}

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={(val) => setSearchQuery(val)}
              onClear={() => setSearchQuery('')}
              placeholder="Search by title, findings, panel ID, site, or inspector..."
            />
          </div>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            aria-label="Filter by site"
            className="px-3 py-2.5 rounded-xl bg-bg-surface1 border border-border-default text-text-primary text-body-sm font-medium focus:outline-none focus:border-semantic-green shrink-0"
          >
            <option value="all">All Sites</option>
            <option value="kukatpally">Kukatpally Metro Site</option>
            <option value="miyapur">Miyapur Depot</option>
            <option value="gachibowli">Gachibowli Hub</option>
          </select>
        </div>

        {/* Filter Chips Bar (Spec 9: All, High, Open, Completed, Site) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <FilterChip
            label="ALL DOSSIERS"
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
            count={reports.length}
          />
          <FilterChip
            label="HIGH PRIORITY"
            active={activeFilter === 'high'}
            onClick={() => setActiveFilter('high')}
            count={reports.filter((r) => r.priority === 'high' || r.priority === 'critical').length}
          />
          <FilterChip
            label="OPEN"
            active={activeFilter === 'open'}
            onClick={() => setActiveFilter('open')}
            count={reports.filter((r) => r.status !== 'verified' && r.status !== 'archived').length}
          />
          <FilterChip
            label="COMPLETED"
            active={activeFilter === 'completed'}
            onClick={() => setActiveFilter('completed')}
            count={reports.filter((r) => r.status === 'verified' || r.status === 'archived').length}
          />
          <FilterChip
            label="KUKATPALLY"
            active={activeFilter === 'kukatpally'}
            onClick={() => setActiveFilter('kukatpally')}
            count={reports.filter((r) => r.siteName.toLowerCase().includes('kukatpally')).length}
          />
          <FilterChip
            label="MIYAPUR"
            active={activeFilter === 'miyapur'}
            onClick={() => setActiveFilter('miyapur')}
            count={reports.filter((r) => r.siteName.toLowerCase().includes('miyapur')).length}
          />
          <FilterChip
            label="GACHIBOWLI"
            active={activeFilter === 'gachibowli'}
            onClick={() => setActiveFilter('gachibowli')}
            count={reports.filter((r) => r.siteName.toLowerCase().includes('gachibowli')).length}
          />
        </div>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={Plus}
          badge="Zero Dossiers"
          title="No Inspection Reports Generated"
          description="Structured inspection dossiers and site logs will appear here once audio or notes are compiled by the on-device intelligence engine."
          actions={[
            {
              label: 'Load Demo Reports',
              icon: Plus,
              onClick: async () => {
                await resetDemoData();
                await loadReports();
              },
              variant: 'primary',
            },
          ]}
        />
      ) : filteredReports.length === 0 ? (
        <EmptyState
          icon={Search}
          badge="No Matches"
          title="No Matching Dossiers Found"
          description={`No inspection records matched query "${searchQuery}" under current filter.`}
          actions={[
            {
              label: 'Clear Search & Filters',
              icon: RotateCcw,
              onClick: () => {
                setSearchQuery('');
                setActiveFilter('all');
              },
              variant: 'primary',
            },
          ]}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-metadata font-mono font-medium text-text-muted uppercase tracking-wider">
              Compiled Field Dossiers ({filteredReports.length})
            </span>
          </div>

          <div className="space-y-3.5">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={() => {
                  navigate(`/reports/${report.id}`);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
