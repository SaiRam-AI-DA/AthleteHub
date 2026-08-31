import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ShieldCheck, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(email, password);

    if (result.success) {
      if (result.user.role === 'ROLE_ATHLETE' && result.user.has_profile === false) {
        navigate('/dashboard/complete-profile');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error || 'Login failed.');
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8 font-sans text-foreground sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-[-8%] h-80 w-80 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute right-[-10%] top-[12%] h-[28rem] w-[28rem] rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute bottom-[-18%] left-[20%] h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%,rgba(255,255,255,0.01))]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr] xl:gap-16">
          <section className="flex flex-col justify-center rounded-[2rem] border border-border bg-card p-8 shadow-lg backdrop-blur-xl sm:p-10 lg:min-h-[760px] lg:p-14">
            <div className="max-w-2xl space-y-10">
              <div className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(198,241,2,0.8)]" />
                AthleteHub Platform
              </div>

              <div className="space-y-7">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-[#071108] shadow-[0_24px_45px_rgba(198,241,2,0.24)]">
                  <Trophy size={30} />
                </div>

                <div className="space-y-5">
                  <h1 className="text-[2.6rem] font-extrabold leading-[0.96] tracking-[-0.05em] text-foreground sm:text-[3.8rem] lg:text-[4.4rem]">
                    Run your sports operations from one elite control room.
                  </h1>
                  <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                    AthleteHub helps teams manage athletes, coaches, training, events, and performance with a cleaner workflow and a stronger competitive edge.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard
                  title="Unified sports workspace"
                  description="Manage athletes, coaches, training, and events from one consistent operations layer."
                />
                <InfoCard
                  title="Secure and structured"
                  description="Your existing authentication and role-based access stay exactly as they are."
                />
              </div>
            </div>
          </section>

          <section className="flex items-center">
            <Card className="w-full !rounded-[2rem] !border-border !bg-card !p-0 shadow-xl">
              <div className="border-b border-border/60 px-7 py-7 sm:px-10 sm:py-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary text-[#071108] shadow-[0_18px_36px_rgba(198,241,2,0.22)]">
                    <span className="text-2xl font-black">A</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.24em] text-muted-foreground">
                      Welcome Back
                    </p>
                    <h2 className="mt-1 text-3xl font-extrabold tracking-[-0.04em] text-foreground">
                      Sign in
                    </h2>
                  </div>
                </div>
                <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
                  Access your dashboard and continue managing your athletes, events, and performance workflows.
                </p>
              </div>

              <div className="px-7 py-8 sm:px-10 sm:py-10">
                {error && (
                  <div className="mb-8 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-base">⚠</span>
                      <p className="font-semibold">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="athlete@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={Mail}
                    required
                  />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label className="form-label !mb-0">Password</label>
                      <button
                        type="button"
                        className="text-xs font-bold uppercase tracking-[0.18em] text-primary transition-colors hover:text-primary-hover"
                      >
                        Forgot?
                      </button>
                    </div>

                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      icon={Lock}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="mt-2 w-full"
                    isLoading={loading}
                  >
                    Sign In
                    {!loading && <ArrowRight size={18} />}
                  </Button>
                </form>

                <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border/60 bg-card/65 px-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Secure sign-in experience</p>
                    <p className="text-xs leading-5 text-muted-foreground">Your existing authentication flow remains unchanged.</p>
                  </div>
                </div>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?
                  <Link
                    to="/register"
                    className="ml-2 font-bold text-primary transition-colors hover:text-primary-hover"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, description }) {
  return (
    <div className="rounded-[1.6rem] border border-border/60 bg-card/60 p-5 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{title}</p>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}


