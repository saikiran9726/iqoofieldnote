import React from 'react';
import { Mic, FileText, CheckSquare, MoreHorizontal } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const navItems: NavItem[] = [
  { to: '/capture', label: 'Capture', icon: Mic },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/more', label: 'More', icon: MoreHorizontal },
];
