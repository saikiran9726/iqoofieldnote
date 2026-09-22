import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { DemoTour } from './DemoTour';
import { navItems } from './navigation';
import { Activity, ShieldCheck, Database, Layers } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

export const Layout: React.FC = () => {
  const location = useLocation();

  const { t } = useTranslation();

  const getPageTitle = (pathname: string): { title: string; subtitle: string } => {
    switch (pathname) {
      case '/capture':
      case '/':
        return { title: t('navCapture'), subtitle: 'Voice memos, camera evidence & quick field drafts' };
      case '/reports':
        return { title: t('navReports'), subtitle: 'Structured dossiers, site audits & generated summaries' };
      case '/tasks':
        return { title: t('navTasks'), subtitle: 'Extracted punch lists, severity tags & action items' };
      case '/more':
        return { title: t('navMore'), subtitle: 'Assets, analytics, security vault, OfficeKit & exports' };
      case '/assets':
        return { title: 'Asset Inventory', subtitle: 'Equipment tracking, serial tags & maintenance logs' };
      case '/rollup':
        return { title: t('weeklyRollup'), subtitle: t('weeklyRollupDesc') };
      case '/privacy':
        return { title: t('privacyTrust'), subtitle: t('privacyTrustDesc') };
      case '/officekit':
        return { title: t('officeKit'), subtitle: t('officeKitDesc') };
      case '/templates':
        return { title: t('templatesGlossary'), subtitle: t('templatesGlossaryDesc') };
      case '/about':
        return { title: t('aboutApp'), subtitle: t('aboutAppDesc') };
      case '/export':
        return { title: 'Data Export', subtitle: 'Complete offline ZIP dossiers and CSV datasets' };
      case '/search':
        return { title: 'Local Search', subtitle: 'Instant full-text index across all local field notes' };
      default:
        return { title: t('appName'), subtitle: 'Offline Field Intelligence' };
    }
  };

  const getNavItemLabel = (to: string, defaultLabel: string): string => {
    switch (to) {
      case '/capture':
        return t('navCapture');
      case '/reports':
        return t('navReports');
      case '/tasks':
        return t('navTasks');
      case '/more':
        return t('navMore');
      default:
        return defaultLabel;
    }
  };

  const { title, subtitle } = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col font-sans transition-colors duration-200">
      <TopBar title={title} subtitle={subtitle} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop / Tablet Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-border-default bg-bg-surface1 p-4 shrink-0 transition-colors">
          <div className="space-y-1">
            <p className="px-3 py-1.5 text-metadata-xs font-mono font-semibold uppercase tracking-wider text-text-muted">
              Main Workflow
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium transition-all
                    ${
                      isActive
                        ? 'bg-semantic-green/10 text-semantic-green font-semibold border border-semantic-green/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface2'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{getNavItemLabel(item.to, item.label)}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-border-subtle space-y-1">
            <p className="px-3 py-1.5 text-metadata-xs font-mono font-semibold uppercase tracking-wider text-text-muted">
              Field Modules
            </p>
            <NavLink
              to="/rollup"
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm transition-all
                ${isActive ? 'bg-bg-surface2 text-text-primary font-semibold' : 'text-text-muted hover:text-text-secondary hover:bg-bg-surface2'}
              `}
            >
              <Activity className="w-4 h-4" />
              <span>{t('weeklyRollup')}</span>
            </NavLink>
            <NavLink
              to="/privacy"
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm transition-all
                ${isActive ? 'bg-bg-surface2 text-text-primary font-semibold' : 'text-text-muted hover:text-text-secondary hover:bg-bg-surface2'}
              `}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('privacyTrust')}</span>
            </NavLink>
            <NavLink
              to="/templates"
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm transition-all
                ${isActive ? 'bg-bg-surface2 text-text-primary font-semibold' : 'text-text-muted hover:text-text-secondary hover:bg-bg-surface2'}
              `}
            >
              <Layers className="w-4 h-4" />
              <span>{t('templatesGlossary')}</span>
            </NavLink>
            <NavLink
              to="/assets"
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm transition-all
                ${isActive ? 'bg-bg-surface2 text-text-primary font-semibold' : 'text-text-muted hover:text-text-secondary hover:bg-bg-surface2'}
              `}
            >
              <Database className="w-4 h-4" />
              <span>Assets</span>
            </NavLink>
          </div>

          <div className="mt-auto pt-4 border-t border-border-subtle text-metadata-xs text-text-muted">
            <div className="flex items-center gap-1.5 mb-1 text-semantic-green font-mono">
              <span className="w-2 h-2 rounded-full bg-semantic-green animate-pulse" />
              <span>Zero-Cloud Core</span>
            </div>
            <p className="leading-snug">Dexie IndexedDB storage + simulated demo engine.</p>
          </div>
        </aside>

        {/* Main Content View */}
        <main className="flex-1 min-w-0 pb-20 md:pb-8 p-4 sm:p-6 transition-colors">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Offline 9-Step Demo Tour Controller */}
      <DemoTour />
    </div>
  );
};
