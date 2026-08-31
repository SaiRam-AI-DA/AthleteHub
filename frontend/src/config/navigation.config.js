import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  CalendarDays,
  Trophy,
  Radio,
  Settings,
  Download,
  BarChart3,
  Activity,
  Briefcase,
  Search,
  List,
  CheckSquare
} from 'lucide-react';
import { ROLES, PERMISSIONS } from '../lib/permissions';

export const NAVIGATION_CONFIG = [
  {
    label: 'Overview',
    showForRoles: [ROLES.SUPER_ADMIN, ROLES.ORG_ADMIN],
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'My Desk',
    showForRoles: [ROLES.COACH],
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'My Space',
    showForRoles: [ROLES.ATHLETE],
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/dashboard/performance', label: 'My Performance', icon: Activity },
    ],
  },
  {
    label: 'Recruitment',
    requireAnyPermission: [PERMISSIONS.RECRUITMENT_VIEW],
    items: [
      { path: '/dashboard/recruitment', label: 'Dashboard', icon: LayoutDashboard, requirePermission: PERMISSIONS.RECRUITMENT_VIEW },
      { path: '/dashboard/recruitment/discover', label: 'Discovery', icon: Search, requirePermission: PERMISSIONS.RECRUITMENT_VIEW },
      { path: '/dashboard/recruitment/pipeline', label: 'Pipeline', icon: Briefcase, requirePermission: PERMISSIONS.RECRUITMENT_VIEW },
      { path: '/dashboard/recruitment/shortlists', label: 'Shortlists', icon: List, requirePermission: PERMISSIONS.RECRUITMENT_VIEW },
      { path: '/dashboard/recruitment/tasks', label: 'Tasks', icon: CheckSquare, requirePermission: PERMISSIONS.RECRUITMENT_VIEW },
    ],
  },
  {
    label: 'Directory',
    requireAnyPermission: [PERMISSIONS.ORG_VIEW, PERMISSIONS.ATHLETE_VIEW, PERMISSIONS.COACH_VIEW],
    items: [
      { path: '/dashboard/athletes', label: 'Athletes', icon: Users, requirePermission: PERMISSIONS.ATHLETE_VIEW },
      { path: '/dashboard/coaches', label: 'Coaches', icon: GraduationCap, requirePermission: PERMISSIONS.COACH_VIEW },
      { path: '/dashboard/organizations', label: 'Organizations', icon: Building2, requirePermission: PERMISSIONS.ORG_VIEW },
    ],
  },
  {
    label: 'Schedule',
    items: [
      { path: '/dashboard/training', label: 'Training', icon: CalendarDays, requirePermission: PERMISSIONS.TRAINING_VIEW },
      { path: '/dashboard/events', label: 'Events', icon: Trophy, requirePermission: PERMISSIONS.EVENT_VIEW },
      { path: '/dashboard/tournaments', label: 'Tournaments', icon: Trophy, requirePermission: PERMISSIONS.EVENT_VIEW },
      { path: '/dashboard/matches/calendar', label: 'Matches', icon: Radio, requirePermission: PERMISSIONS.EVENT_VIEW },
    ],
  },
  {
    label: 'Insights',
    requireAnyPermission: [PERMISSIONS.ANALYTICS_ORG_VIEW, PERMISSIONS.ANALYTICS_GLOBAL_VIEW, PERMISSIONS.PERFORMANCE_VIEW],
    items: [
      { path: '/dashboard/performance', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    requireAnyPermission: [PERMISSIONS.PLATFORM_MANAGE, PERMISSIONS.ORG_UPDATE],
    items: [
      { path: '/dashboard/imports', label: 'Imports', icon: Download, requirePermission: PERMISSIONS.PLATFORM_MANAGE },
      { path: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
];
