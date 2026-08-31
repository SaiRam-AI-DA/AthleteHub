import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, Trophy, Target, ShieldAlert, ArrowRight, CheckCircle2, TrendingUp, Medal, CalendarDays, LineChart as ChartIcon, Zap, ChevronRight, BarChart3, Database, Lock, Search, Bell, LayoutDashboard } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden font-sans">
      
      {/* Background glow effects & particles */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px] animate-glow-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[150px] animate-glow-pulse animation-delay-1000"></div>
        
        {/* Subtle floating particles */}
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className={`absolute w-1 h-1 bg-foreground/20 rounded-full animate-particle`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${100 + Math.random() * 20}%`,
              animationDelay: `${i * 2}s`
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">AthleteHub</span>
          </div>
          <div className="hidden lg:flex items-center gap-10">
            <a href="#platform" className="nav-link">Platform</a>
            <a href="#showcase" className="nav-link">Showcase</a>
            <a href="#solutions" className="nav-link">Solutions</a>
            <a href="#security" className="nav-link">Security</a>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Sign In
            </button>
            <Button 
              onClick={() => navigate('/register')}
              className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-7 font-bold shadow-xl shadow-foreground/5 transition-all hover:scale-105"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 lg:pt-52 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center">
        
        <div className="flex flex-col items-center text-center opacity-0 animate-fade-in-up w-full">
          <a href="#platform" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-10 backdrop-blur-sm hover:bg-primary/20 transition-colors cursor-pointer">
            <Zap className="w-4 h-4" />
            Discover AthleteHub 2.0 <ArrowRight className="w-4 h-4 ml-1" />
          </a>
          
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight max-w-5xl leading-[1.05] mb-8">
            The unified sports <br className="hidden md:block"/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-purple-600">
              management platform
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 font-medium leading-relaxed">
            AthleteHub connects organizations, coaches, and athletes. Manage global rosters, track performance telemetry, and schedule tournaments from one centralized workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button 
              onClick={() => navigate('/register')}
              className="h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-bold text-lg transition-all hover:scale-105 shadow-[0_0_40px_rgba(var(--primary),0.3)] group"
            >
              Start Building <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Hero Visual Composition - Authentic UI Replicas */}
        <div className="mt-32 w-full max-w-6xl mx-auto relative opacity-0 animate-fade-in-up animation-delay-300">
          
          {/* Base Layer: Dashboard Command Center */}
          <div className="w-full h-[550px] glass-panel rounded-2xl overflow-hidden border border-border relative z-10 shadow-[0_30px_100px_rgba(0,0,0,0.4)] flex flex-col">
            {/* Topbar */}
            <div className="h-16 border-b border-border bg-muted/20 flex items-center px-6 justify-between backdrop-blur-xl">
              <div className="flex items-center gap-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="hidden sm:flex bg-background border border-border rounded-lg px-3 py-1.5 items-center gap-2 w-64">
                   <Search className="w-3.5 h-3.5 text-muted-foreground" />
                   <div className="h-2 w-24 bg-muted rounded"></div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center"><Bell className="w-4 h-4 text-muted-foreground"/></div>
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-border"></div>
              </div>
            </div>
            {/* Main Area */}
            <div className="flex-1 bg-background flex p-6 gap-6">
              {/* Sidebar */}
              <div className="w-56 hidden md:flex flex-col gap-2">
                 <div className="px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-semibold flex items-center gap-3"><LayoutDashboard className="w-4 h-4"/> Command Center</div>
                 <div className="px-3 py-2 text-muted-foreground hover:text-foreground rounded-lg text-sm font-medium flex items-center gap-3"><Users className="w-4 h-4"/> Roster</div>
                 <div className="px-3 py-2 text-muted-foreground hover:text-foreground rounded-lg text-sm font-medium flex items-center gap-3"><Activity className="w-4 h-4"/> Performance</div>
                 <div className="px-3 py-2 text-muted-foreground hover:text-foreground rounded-lg text-sm font-medium flex items-center gap-3"><CalendarDays className="w-4 h-4"/> Schedule</div>
              </div>
              {/* Content */}
              <div className="flex-1 flex flex-col gap-6">
                 <div className="h-6 w-48 bg-muted rounded-md mb-2"></div>
                 {/* Recharts replica */}
                 <div className="flex-1 bg-card border border-border rounded-xl p-6 relative flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                       <div>
                         <div className="h-4 w-32 bg-muted-foreground/30 rounded mb-2"></div>
                         <div className="h-3 w-48 bg-muted rounded"></div>
                       </div>
                       <div className="h-8 w-24 bg-muted/50 border border-border rounded-lg"></div>
                    </div>
                    {/* SVG Chart Line */}
                    <div className="flex-1 relative w-full h-full">
                       <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                          <path d="M0,80 Q10,70 20,60 T40,50 T60,20 T80,40 T100,10" fill="none" stroke="rgba(59, 130, 246, 0.8)" strokeWidth="3" strokeLinecap="round" />
                          <path d="M0,80 Q10,70 20,60 T40,50 T60,20 T80,40 T100,10 L100,100 L0,100 Z" fill="url(#grad)" />
                          <defs>
                            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
                              <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                            </linearGradient>
                          </defs>
                       </svg>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Floating UI: Athlete Profile Card */}
          <div className="absolute top-12 -left-6 lg:-left-20 w-80 glass-panel border border-border rounded-2xl p-6 z-20 shadow-2xl animate-float">
             <div className="flex gap-4 items-center mb-6">
                <div className="w-14 h-14 rounded-full bg-[url('https://i.pravatar.cc/150?img=44')] bg-cover border-2 border-background"></div>
                <div>
                   <div className="text-base font-bold text-foreground flex items-center gap-2">Elena Rostova <CheckCircle2 className="w-4 h-4 text-primary"/></div>
                   <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Elite Sprinter</div>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-muted/30 rounded-xl p-3 border border-border">
                   <div className="text-xs text-muted-foreground mb-1">Global Rank</div>
                   <div className="text-xl font-bold text-emerald-600 flex items-center gap-1"><TrendingUp className="w-4 h-4"/> #4</div>
                </div>
                <div className="bg-muted/30 rounded-xl p-3 border border-border">
                   <div className="text-xs text-muted-foreground mb-1">Conditioning</div>
                   <div className="text-xl font-bold text-foreground">98%</div>
                </div>
             </div>
          </div>

          {/* Floating UI: Training Session / Match Calendar */}
          <div className="absolute bottom-16 -right-6 lg:-right-16 w-72 glass-panel border border-border rounded-2xl p-5 z-20 shadow-2xl animate-float-delayed bg-background/80">
             <div className="text-sm font-bold text-foreground mb-4 flex items-center justify-between">
                Upcoming Events
                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] uppercase">Live</span>
             </div>
             <div className="space-y-3">
                <div className="flex gap-3 items-center p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                   <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-600 flex flex-col items-center justify-center border border-emerald-500/30">
                      <span className="text-[9px] font-bold uppercase">Oct</span>
                      <span className="text-sm font-black leading-none">14</span>
                   </div>
                   <div>
                      <div className="text-sm font-semibold text-foreground">National Qualifiers</div>
                      <div className="text-xs text-muted-foreground">Track & Field</div>
                   </div>
                </div>
                <div className="flex gap-3 items-center p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                   <div className="w-10 h-10 rounded-lg bg-muted text-muted-foreground flex flex-col items-center justify-center border border-border">
                      <span className="text-[9px] font-bold uppercase">Oct</span>
                      <span className="text-sm font-black leading-none">18</span>
                   </div>
                   <div>
                      <div className="text-sm font-semibold text-foreground">Strength Assessment</div>
                      <div className="text-xs text-muted-foreground">Internal Combine</div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* Social Proof / Trusted By */}
      <section className="relative z-10 py-16 border-y border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">Powering elite sports organizations worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Tasteful Abstract Placeholder Logos */}
             <div className="flex items-center gap-2 font-black text-xl tracking-tighter"><div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-background"></div></div> FEDERATION</div>
             <div className="flex items-center gap-2 font-black text-xl tracking-tighter"><Activity className="w-6 h-6"/> APEX SPORTS</div>
             <div className="flex items-center gap-2 font-black text-xl tracking-tighter"><Target className="w-6 h-6"/> OLYMPIA</div>
             <div className="flex items-center gap-2 font-black text-xl tracking-tighter"><Medal className="w-6 h-6"/> GLOBAL ATHLETICS</div>
          </div>
        </div>
      </section>

      {/* Features Showcase / Platform Capabilities */}
      <section id="platform" className="relative z-10 py-40 px-6 max-w-7xl mx-auto">
        <div className="mb-24 md:text-center max-w-3xl md:mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Designed for <span className="text-gradient-primary">scale and precision.</span></h2>
          <p className="text-muted-foreground text-lg md:text-xl font-medium">
            AthleteHub replaces fragmented spreadsheets, group chats, and legacy software with one unified intelligence engine.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Feature 1 - Performance Analytics (Spans 2 columns) */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-card border border-border hover:border-primary/50 transition-all duration-500 p-10 min-h-[420px] flex flex-col justify-between shadow-sm hover:shadow-lg hover:shadow-primary/5">
            <div className="relative z-10 max-w-lg">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Performance Telemetry</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Track micro-metrics over time. Identify trends, prevent injuries, and visualize progression with real-time analytics syncing directly to coach dashboards.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 w-[60%] h-[80%] bg-gradient-to-tl from-blue-500/10 to-transparent rounded-tl-3xl translate-y-10 group-hover:translate-y-0 transition-transform duration-700">
               <div className="absolute bottom-0 right-10 flex items-end gap-4 opacity-50 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="w-12 h-24 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl border-t border-x border-border/50"></div>
                  <div className="w-12 h-36 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl border-t border-x border-border/50"></div>
                  <div className="w-12 h-48 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl border-t border-x border-border/50 shadow-[0_0_30px_rgba(96,165,250,0.5)]"></div>
               </div>
            </div>
          </div>

          {/* Feature 2 - Global Roster */}
          <div className="group relative overflow-hidden rounded-3xl bg-card border border-border hover:border-purple-500/50 transition-all duration-500 p-10 min-h-[420px] flex flex-col justify-between shadow-sm hover:shadow-lg hover:shadow-purple-500/5">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-8 border border-purple-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Global Rosters</h3>
              <p className="text-muted-foreground text-lg">
                Manage vast hierarchies of athletes, assign dedicated coaches, and maintain centralized, pristine data.
              </p>
            </div>
            <div className="w-full flex -space-x-4 mt-8 opacity-60 group-hover:opacity-100 transition-opacity">
               <div className="w-12 h-12 rounded-full border-2 border-background bg-purple-800"></div>
               <div className="w-12 h-12 rounded-full border-2 border-background bg-indigo-800"></div>
               <div className="w-12 h-12 rounded-full border-2 border-background bg-blue-800"></div>
               <div className="w-12 h-12 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold text-foreground">+99</div>
            </div>
          </div>

          {/* Feature 3 - Tournaments */}
          <div className="group relative overflow-hidden rounded-3xl bg-card border border-border hover:border-emerald-500/50 transition-all duration-500 p-10 min-h-[420px] flex flex-col justify-between shadow-sm hover:shadow-lg hover:shadow-emerald-500/5">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
                <Trophy className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Tournament Brackets</h3>
              <p className="text-muted-foreground text-lg">
                Orchestrate live events, schedule matches dynamically, and automatically update global athlete rankings upon completion.
              </p>
            </div>
          </div>

          {/* Feature 4 - Architecture (Spans 2 columns) */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-card border border-border hover:border-orange-500/50 transition-all duration-500 p-10 min-h-[420px] flex flex-col justify-between shadow-sm hover:shadow-lg hover:shadow-orange-500/5" id="security">
            <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start lg:items-center">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-8 border border-orange-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
                  <Lock className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Enterprise Grade Infrastructure</h3>
                <p className="text-muted-foreground text-lg mb-8">
                  Powered by a stateless Java Spring Boot architecture and optimized React frontend, ensuring sub-second latency and uncompromised security.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm font-semibold text-foreground/80"><CheckCircle2 className="w-5 h-5 mr-3 text-orange-600" /> Multi-tenant RBAC</div>
                  <div className="flex items-center text-sm font-semibold text-foreground/80"><CheckCircle2 className="w-5 h-5 mr-3 text-orange-600" /> Stateless JWT Auth</div>
                  <div className="flex items-center text-sm font-semibold text-foreground/80"><CheckCircle2 className="w-5 h-5 mr-3 text-orange-600" /> Strict DTO Validation</div>
                  <div className="flex items-center text-sm font-semibold text-foreground/80"><CheckCircle2 className="w-5 h-5 mr-3 text-orange-600" /> MySQL ACID Compliance</div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Perspectives / Solutions */}
      <section id="solutions" className="relative z-10 py-40 px-6 bg-gradient-to-b from-transparent to-muted/20 border-t border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div>
             <h2 className="text-4xl md:text-5xl font-extrabold mb-10 leading-tight">Built for the entire <br/><span className="text-gradient">sports ecosystem.</span></h2>
             
             <div className="space-y-4">
                <div className="p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all group cursor-pointer shadow-sm hover:shadow-lg">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20"><ShieldAlert className="w-5 h-5 text-blue-600" /></div>
                      <h4 className="text-2xl font-bold text-foreground">Organizations</h4>
                   </div>
                   <p className="text-muted-foreground text-lg leading-relaxed">Govern thousands of athletes. Issue global announcements, oversee coach assignments, and analyze macro performance trends across your entire federation.</p>
                </div>
                
                <div className="p-8 rounded-3xl bg-transparent border border-transparent hover:bg-card hover:border-border transition-all group cursor-pointer">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20"><Target className="w-5 h-5 text-purple-600" /></div>
                      <h4 className="text-2xl font-bold text-foreground">Coaches</h4>
                   </div>
                   <p className="text-muted-foreground text-lg leading-relaxed">Design precision training plans, track attendance securely, and monitor micro-adjustments in athlete performance through personalized telemetry dashboards.</p>
                </div>
                
                <div className="p-8 rounded-3xl bg-transparent border border-transparent hover:bg-card hover:border-border transition-all group cursor-pointer">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"><Medal className="w-5 h-5 text-emerald-600" /></div>
                      <h4 className="text-2xl font-bold text-foreground">Athletes</h4>
                   </div>
                   <p className="text-muted-foreground text-lg leading-relaxed">Focus entirely on execution. Access training regimens, view historical rankings, and track personal bests on a distraction-free mobile-optimized profile.</p>
                </div>
             </div>
           </div>
           
           {/* Visual Stack representing RBAC/Ecosystem */}
           <div className="relative h-[700px] w-full hidden lg:block perspective-1000">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] max-w-lg">
                <div className="absolute inset-0 glass-panel rounded-3xl border border-border translate-x-8 translate-y-8 rotate-3 scale-95 opacity-40"></div>
                <div className="absolute inset-0 glass-panel rounded-3xl border border-border translate-x-4 translate-y-4 rotate-1 scale-95 opacity-70"></div>
                <div className="absolute inset-0 glass-panel rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden bg-background">
                   <div className="h-14 border-b border-border flex items-center px-6 bg-muted/30">
                      <ShieldAlert className="w-4 h-4 text-muted-foreground mr-3"/>
                      <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Admin Command Center</span>
                   </div>
                   <div className="flex-1 p-8 space-y-6">
                      <div className="flex justify-between items-center mb-4">
                         <div className="h-4 w-32 bg-muted rounded"></div>
                         <Button variant="outline" className="h-8 bg-muted/50 border-border text-xs">Manage Roles</Button>
                      </div>
                      <div className="h-16 w-full rounded-xl border border-border bg-muted/30 flex items-center px-4 gap-4">
                         <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center"><Users className="w-4 h-4"/></div>
                         <div className="flex-1 h-3 bg-muted rounded"></div>
                      </div>
                      <div className="h-16 w-full rounded-xl border border-border bg-muted/30 flex items-center px-4 gap-4">
                         <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-600 flex items-center justify-center"><Activity className="w-4 h-4"/></div>
                         <div className="flex-1 h-3 bg-muted rounded"></div>
                      </div>
                      <div className="h-16 w-full rounded-xl border border-border bg-muted/30 flex items-center px-4 gap-4">
                         <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-600 flex items-center justify-center"><Lock className="w-4 h-4"/></div>
                         <div className="flex-1 h-3 bg-muted rounded"></div>
                      </div>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-40 px-6">
        <div className="max-w-6xl mx-auto rounded-[3rem] bg-gradient-to-br from-primary/20 via-background to-purple-900/20 border border-border p-16 md:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-8 relative z-10 text-foreground">Deploy AthleteHub today.</h2>
          <p className="text-muted-foreground text-xl md:text-2xl mb-12 max-w-3xl mx-auto relative z-10 font-medium">
            Stop managing elite performance in spreadsheets. Move your organization to the platform built for champions.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
            <Button 
              onClick={() => navigate('/register')}
              className="h-16 px-12 bg-foreground text-background hover:bg-foreground/90 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-xl"
            >
              Get Started for Free
            </Button>
            <Button 
              onClick={() => navigate('/login')}
              variant="outline"
              className="h-16 px-12 bg-muted/50 border-border text-foreground hover:bg-muted rounded-full font-bold text-lg"
            >
              Sign In to Workspace
            </Button>
          </div>
        </div>
      </section>

      {/* Complete Enterprise Footer */}
      <footer className="border-t border-border bg-background pt-24 pb-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 lg:gap-8 mb-20">
          <div className="col-span-2">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Activity className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-foreground">AthleteHub</span>
             </div>
             <p className="text-muted-foreground text-base leading-relaxed max-w-sm mb-8">
               The premier operating system for sports federations, elite academies, and professional athletes. Engineered for performance.
             </p>
             <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-muted/50 border border-border flex items-center justify-center hover:bg-muted transition-colors" aria-label="Twitter">
                   <svg className="w-4 h-4 text-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-muted/50 border border-border flex items-center justify-center hover:bg-muted transition-colors" aria-label="LinkedIn">
                   <svg className="w-4 h-4 text-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
             </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-foreground text-sm tracking-wider uppercase">Platform</h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Organizations</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Coaches</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Athletes</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Tournaments</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Analytics</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-foreground text-sm tracking-wider uppercase">Resources</h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-foreground text-sm tracking-wider uppercase">Company</h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Customers</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-foreground text-sm tracking-wider uppercase">Legal</h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-border pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-medium text-muted-foreground">
          <p>© {new Date().getFullYear()} AthleteHub Inc. All rights reserved.</p>
          <div className="flex gap-2">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
