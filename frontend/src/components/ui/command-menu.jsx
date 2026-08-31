import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Users, Activity, Target, Trophy, Settings, 
  LogOut, PlusCircle, LayoutDashboard, Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { ROLES } from '@/lib/permissions';

export function GlobalCommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isRole } = usePermissions();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command) => {
    setOpen(false);
    command();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Command className="w-full flex flex-col h-full cmdk-root">
              <div className="flex items-center border-b border-border px-3 cmdk-input-wrapper">
                <Search className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
                <Command.Input 
                  autoFocus
                  placeholder="What do you need to do? (Search athletes, actions, or pages...)"
                  className="w-full bg-transparent border-0 h-14 outline-none placeholder:text-muted-foreground/60 text-foreground text-base focus:ring-0" 
                />
              </div>
              <Command.List className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </Command.Empty>

                <Command.Group heading="General" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 mt-2">
                  <Command.Item onSelect={() => runCommand(() => navigate('/dashboard'))} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted/50 data-[selected=true]:bg-muted">
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    <span>Dashboard</span>
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => navigate('/dashboard/profile'))} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted/50 data-[selected=true]:bg-muted">
                    <Settings className="w-4 h-4 text-primary" />
                    <span>My Profile & Settings</span>
                  </Command.Item>
                </Command.Group>

                {(isRole(ROLES.ORG_ADMIN) || isRole(ROLES.SUPER_ADMIN)) && (
                  <Command.Group heading="Administration" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 mt-4">
                    <Command.Item onSelect={() => runCommand(() => navigate('/dashboard/athletes'))} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted/50 data-[selected=true]:bg-muted">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span>Manage Roster (Athletes)</span>
                    </Command.Item>
                    <Command.Item onSelect={() => runCommand(() => navigate('/dashboard/coaches'))} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted/50 data-[selected=true]:bg-muted">
                      <Target className="w-4 h-4 text-purple-500" />
                      <span>Manage Coaches</span>
                    </Command.Item>
                    <Command.Item onSelect={() => runCommand(() => navigate('/dashboard/tournaments'))} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted/50 data-[selected=true]:bg-muted">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span>Tournaments & Events</span>
                    </Command.Item>
                  </Command.Group>
                )}

                {(isRole(ROLES.COACH) || isRole(ROLES.ORG_ADMIN)) && (
                  <Command.Group heading="Performance" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 mt-4">
                    <Command.Item onSelect={() => runCommand(() => navigate('/dashboard/training-plans/new'))} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted/50 data-[selected=true]:bg-muted">
                      <PlusCircle className="w-4 h-4 text-emerald-500" />
                      <span>Create New Training Plan</span>
                    </Command.Item>
                    <Command.Item onSelect={() => runCommand(() => navigate('/dashboard/training-sessions'))} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted/50 data-[selected=true]:bg-muted">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      <span>Schedule & Attendance</span>
                    </Command.Item>
                    <Command.Item onSelect={() => runCommand(() => navigate('/dashboard/performance'))} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted/50 data-[selected=true]:bg-muted">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <span>Performance Telemetry</span>
                    </Command.Item>
                  </Command.Group>
                )}

                <Command.Separator className="h-px bg-border my-2" />
                <Command.Item 
                  onSelect={() => runCommand(() => logout())}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer text-destructive hover:bg-destructive/10 data-[selected=true]:bg-destructive/10 data-[selected=true]:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </Command.Item>
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
