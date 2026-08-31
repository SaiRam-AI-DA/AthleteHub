import React, { useState, useEffect } from 'react';
import { useNavigation } from '@/lib/navigation-store';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Search,
  Bell,
  Command,
  ChevronsUpDown,
  CircleDot,
  Trophy,
  LogOut,
  User,
  Settings,
  HelpCircle,
  Keyboard,
  Info,
  CheckCircle2,
  Menu,
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  CalendarDays,
  Radio,
  Plus
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';

// Extracted from original notifications mock
const initialNotifications = [
  { id: '1', title: 'Marcus Johnson scored a 3-pointer', time: '2m ago', unread: true },
  { id: '2', title: 'Sarah Williams completed training', time: '5m ago', unread: true },
  { id: '3', title: 'New athlete Priya Sharma registered', time: '30m ago', unread: false },
  { id: '4', title: 'Thunder FC won their match 3-1', time: '1h ago', unread: false },
  { id: '5', title: 'Regional Tennis Open quarter finals', time: '3h ago', unread: false },
];

export function TopNavBar() {
  const { commandPaletteOpen, closeCommandPalette, mobileSidebarOpen, toggleMobileSidebar } = useNavigation();
  const { currentUser, currentRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    logout();
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 h-14 glass-panel border-b border-border/40">
        <div className="flex items-center h-full px-4 gap-3">
          {/* Hamburger Menu (Mobile) */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Logo */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
              <Trophy className="h-4 w-4" />
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-sm min-w-0">
            <span className="text-muted-foreground">AthleteHub</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="font-medium truncate capitalize">{location.pathname.split('/').pop() || 'Dashboard'}</span>
          </div>

          {/* Global Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 h-9 px-3 rounded-lg bg-muted/40 border border-transparent hover:border-border hover:bg-muted/60 text-muted-foreground transition-all ml-auto w-[260px] lg:w-[360px]"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="text-sm truncate">Search athletes, coaches, organizations...</span>
            <kbd className="ml-auto hidden lg:inline-flex items-center gap-0.5 rounded-md border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>

          {/* Mobile search trigger */}
          <button onClick={() => setSearchOpen(true)} className="md:hidden ml-auto h-8 w-8 rounded-lg bg-muted/40 flex items-center justify-center hover:bg-muted/60 transition-colors">
            <Search className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative h-8 w-8 rounded-lg hover:bg-muted/60 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <Bell className="h-4 w-4 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between bg-muted/30">
                <div>
                  <p className="font-semibold text-sm">Notifications</p>
                  <p className="text-xs text-muted-foreground">You have {unreadCount} unread messages</p>
                </div>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={handleMarkAllAsRead} title="Mark all as read">
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <DropdownMenuItem key={n.id} className="px-4 py-3 flex items-start gap-3 cursor-pointer rounded-none border-b last:border-b-0 focus:bg-muted/50">
                      {n.unread ? (
                        <CircleDot className="h-3 w-3 text-blue-500 mt-1 shrink-0" />
                      ) : (
                        <div className="h-3 w-3 mt-1 shrink-0" /> // Spacer
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm truncate", n.unread ? "font-semibold" : "font-medium text-muted-foreground")}>{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">All caught up!</p>
                    <p className="text-xs">No new notifications</p>
                  </div>
                )}
              </div>
              <div className="border-t p-1 bg-muted/10">
                <Button variant="ghost" className="w-full text-xs h-8 justify-center" onClick={() => navigate('/dashboard/notifications')}>
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile / Account Center */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 h-8 pl-2 pr-1.5 rounded-lg hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <Avatar className="h-6 w-6 border border-border/50">
                  <AvatarFallback className="text-[10px] bg-foreground text-background">
                    {currentUser?.name?.substring(0, 2).toUpperCase() || 'AH'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start justify-center text-sm min-w-0">
                  <span className="font-medium truncate leading-none mb-0.5">{currentUser?.name || 'User'}</span>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-1" sideOffset={8}>
              {/* User Card */}
              <div className="px-2 py-3 flex items-start gap-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {currentUser?.name?.substring(0, 2).toUpperCase() || 'AH'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">{currentUser?.name || 'User'}</p>
                  <div className="flex items-center">
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                      {currentRole?.replace('_', ' ').toUpperCase() || 'USER'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-none truncate max-w-[150px]">
                    {currentUser?.orgInfo?.organization || currentUser?.email || 'user@athletehub.io'}
                  </p>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              {/* Account */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate('/dashboard/profile')} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard/settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard/settings?tab=notifications')} className="cursor-pointer">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />

              {/* Support */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Support</DropdownMenuLabel>
                <DropdownMenuItem className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help Center</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Keyboard className="mr-2 h-4 w-4" />
                  <span>Keyboard Shortcuts</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Info className="mr-2 h-4 w-4" />
                  <span>About AthleteHub</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* Danger Zone */}
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer dark:focus:bg-red-950/50"
                onClick={() => setShowLogoutDialog(true)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out of AthleteHub? You will need to log in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Command Palette Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search athletes, coaches, organizations, events..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => { navigate('/dashboard'); setSearchOpen(false); }}>
              <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" /> Dashboard
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/athletes'); setSearchOpen(false); }}>
              <Users className="mr-2 h-4 w-4 text-muted-foreground" /> Athletes
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/coaches'); setSearchOpen(false); }}>
              <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" /> Coaches
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/organizations'); setSearchOpen(false); }}>
              <Building2 className="mr-2 h-4 w-4 text-muted-foreground" /> Organizations
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/training'); setSearchOpen(false); }}>
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" /> Training
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/events'); setSearchOpen(false); }}>
              <Trophy className="mr-2 h-4 w-4 text-muted-foreground" /> Events
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/matches/calendar'); setSearchOpen(false); }}>
              <Radio className="mr-2 h-4 w-4 text-muted-foreground" /> Live Matches
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => { navigate('/dashboard/athletes/new'); setSearchOpen(false); }}>
              <Plus className="mr-2 h-4 w-4 text-muted-foreground" /> Register New Athlete
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/tournaments'); setSearchOpen(false); }}>
              <Trophy className="mr-2 h-4 w-4 text-muted-foreground" /> View Tournaments
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}


