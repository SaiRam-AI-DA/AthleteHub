import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNavigation } from '@/lib/navigation-store';
import { usePermissions } from '@/hooks/usePermissions';
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
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { NAVIGATION_CONFIG } from '@/config/navigation.config';

export function AppSidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, closeMobileSidebar } = useNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isRole, ROLES, can } = usePermissions();

  const navGroups = useMemo(() => {
    return NAVIGATION_CONFIG.map(group => {
      // 1. Role-based group visibility
      if (group.showForRoles && !group.showForRoles.some(role => isRole(role))) {
        return null;
      }
      
      // 2. Permission-based group visibility
      if (group.requireAnyPermission && !group.requireAnyPermission.some(p => can(p))) {
        return null;
      }

      // 3. Filter group items by individual permissions
      const visibleItems = group.items.filter(item => {
        if (item.requirePermission && !can(item.requirePermission)) {
          return false;
        }
        return true;
      });

      if (visibleItems.length === 0) return null;

      return {
        ...group,
        items: visibleItems,
      };
    }).filter(Boolean);
  }, [isRole, ROLES, can]);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const renderSidebarContent = (isMobile = false) => (
    <>
      {/* Logo area */}
      <div className={cn('flex items-center h-12 px-4', (sidebarCollapsed && !isMobile) ? 'justify-center' : 'gap-3')}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background shrink-0">
          <Trophy className="h-4 w-4" />
        </div>
        {(!sidebarCollapsed || isMobile) && (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm tracking-tight">AthleteHub</span>
            <span className="text-[10px] text-muted-foreground/80">Sports Platform</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-4 px-2">
        <div className="space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              {(!sidebarCollapsed || isMobile) && (
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 px-3 mb-1.5">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  return (sidebarCollapsed && !isMobile) ? (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            navigate(item.path);
                            if (isMobile) closeMobileSidebar();
                          }}
                          className={cn(
                            'flex items-center justify-center w-full h-9 rounded-lg transition-all duration-150 relative group',
                            active
                              ? 'bg-foreground/10 text-foreground font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          )}
                        >
                          <item.icon className="h-[16px] w-[16px] shrink-0" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium text-xs">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        if (isMobile) closeMobileSidebar();
                      }}
                      className={cn(
                        'flex items-center gap-2.5 w-full rounded-lg transition-all duration-150 relative group',
                        'h-9 px-3',
                        active
                          ? 'bg-foreground/[0.08] text-foreground font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <item.icon className="h-[16px] w-[16px] shrink-0" />
                      <span className="text-[13px] truncate">{item.label}</span>
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-foreground transition-all" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Collapse toggle */}
      {!isMobile && (
        <div className="border-t px-2 py-2">
          <button
            onClick={toggleSidebar}
            className={cn(
              'flex items-center w-full h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors',
              sidebarCollapsed ? 'justify-center' : 'gap-2.5 px-3'
            )}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-[16px] w-[16px] shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="h-[16px] w-[16px] shrink-0" />
                <span className="text-[13px]">Collapse</span>
              </>
            )}
          </button>
        </div>
      )}
    </>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-14 bottom-[28px] z-30 hidden lg:flex flex-col glass-panel border-r border-border/40 transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-[68px]' : 'w-[220px]'
        )}
      >
        {renderSidebarContent(false)}
      </aside>

      <Sheet open={mobileSidebarOpen} onOpenChange={closeMobileSidebar}>
        <SheetContent side="left" className="w-[280px] p-0 flex flex-col pt-4 bg-background">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          {renderSidebarContent(true)}
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}

