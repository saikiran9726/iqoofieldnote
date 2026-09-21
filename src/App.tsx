import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useThemeStore } from './lib/theme';
import { useSettingsStore } from './lib/stores';
import { initDatabase } from './data/db';
import { CaptureScreen } from './features/capture';
import { ReportsScreen } from './features/reports';
import { ReportDetailScreen } from './features/reports/ReportDetail';
import { TasksScreen } from './features/tasks';
import { MoreScreen } from './features/more';
import { AssetsScreen } from './features/assets';
import { RollupScreen } from './features/rollup';
import { PrivacyScreen } from './features/privacy';
import { OfficeKitScreen } from './features/officekit';
import { ExportScreen } from './features/export';
import { SearchScreen } from './features/search';
import { ComponentKitScreen } from './features/kit';

export const App: React.FC = () => {
  const initTheme = useThemeStore((s) => s.initTheme);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    const cleanup = initTheme();
    initDatabase().catch(console.error);
    loadSettings().catch(console.error);
    return cleanup;
  }, [initTheme, loadSettings]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/capture" replace />} />
          <Route path="/capture" element={<CaptureScreen />} />
          <Route path="/reports" element={<ReportsScreen />} />
          <Route path="/reports/:id" element={<ReportDetailScreen />} />
          <Route path="/report/:id" element={<ReportDetailScreen />} />
          <Route path="/tasks" element={<TasksScreen />} />
          <Route path="/more" element={<MoreScreen />} />
          <Route path="/assets" element={<AssetsScreen />} />
          <Route path="/rollup" element={<RollupScreen />} />
          <Route path="/privacy" element={<PrivacyScreen />} />
          <Route path="/officekit" element={<OfficeKitScreen />} />
          <Route path="/export" element={<ExportScreen />} />
          <Route path="/search" element={<SearchScreen />} />
          <Route path="/kit" element={<ComponentKitScreen />} />
          <Route path="*" element={<Navigate to="/capture" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
