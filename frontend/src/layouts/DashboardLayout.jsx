import { Outlet } from 'react-router-dom';
import { useNavigation } from '@/lib/navigation-store';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { TopNavBar } from '@/components/layout/top-nav-bar';
import { StatusBar, FloatingActionButton } from '@/components/layout/status-bar-fab';
import { ContextPanel } from '@/components/layout/context-panel';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { GlobalCommandMenu } from '@/components/ui/command-menu';
import { cn } from '@/lib/utils';

export default function DashboardLayout() {
  const { sidebarCollapsed, contextPanelOpen } = useNavigation();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans bg-glow-container selection:bg-primary/20 selection:text-primary">
      <GlobalCommandMenu />
      {/* Global Ambient UI Glows */}
      <div className="bg-glow-primary w-[800px] h-[800px] top-[-200px] left-[-200px] opacity-15 fixed" />
      <div className="bg-glow-primary w-[1000px] h-[1000px] bottom-[-300px] right-[-300px] opacity-10 fixed" />
      <ErrorBoundary>
        {/* Top Navigation Bar — fixed */}
        <TopNavBar />

        {/* Sidebar — fixed */}
        <AppSidebar />

        {/* Main content area — accounts for top nav (h-14), sidebar, and status bar (h-[28px]) */}
        <main
          className={cn(
            'pt-14 pb-[28px] transition-all duration-300',
            sidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-[220px]',
            contextPanelOpen ? 'lg:pr-[340px]' : 'pr-0'
          )}
        >
          <div className="p-6 lg:p-8 max-w-7xl mx-auto h-full page-enter">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>

        {/* Right Context Panel */}
        <div className="hidden lg:block">
          <ContextPanel />
        </div>

        {/* Status Bar */}
        <StatusBar />

        {/* Floating Action Button */}
        <FloatingActionButton />
      </ErrorBoundary>
    </div>
  );
}
