import React from 'react';
import { NavLink } from 'react-router-dom';
import { navItems } from './navigation';
import { useTranslation } from '../lib/i18n';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();

  const getLabel = (to: string, defaultLabel: string): string => {
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

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-surface1/95 backdrop-blur-md border-t border-border-default safe-pb px-2 py-1 transition-colors"
      aria-label="Primary Mobile Navigation"
    >
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all select-none
                ${
                  isActive
                    ? 'text-semantic-green font-semibold bg-bg-surface2/60'
                    : 'text-text-muted hover:text-text-secondary active:scale-95'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-semantic-green" />
                    )}
                  </div>
                  <span className="text-[11px] mt-1 font-medium tracking-tight">
                    {getLabel(item.to, item.label)}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
