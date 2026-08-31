import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Mail, Lock, User, Briefcase, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'ROLE_ATHLETE'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      full_name: `${formData.first_name} ${formData.last_name}`.trim(),
      email: formData.email,
      password: formData.password,
      role_name: formData.role
    };

    try {
      const response = await api.post('/auth/register', payload);
      if (response.status === 201) {
        navigate('/login?registered=true');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans selection:bg-[#2563EB] selection:text-foreground relative overflow-hidden">
      
      {/* Subtle Background Accent */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#EFF6FF] to-transparent pointer-events-none"></div>

      <div className="w-full max-w-[500px] py-8 relative z-10">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/20 mb-5">
            <span className="text-3xl font-extrabold text-foreground">A</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Join AthleteHub</h1>
          <p className="text-muted-foreground font-medium mt-1">Create your professional account</p>
        </div>

        <Card className="!p-8 animate-slide-up shadow-xl border-0 shadow-slate-200/50">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl mb-6 flex items-start gap-3 text-sm shadow-sm">
              <span className="mt-0.5">⚠️</span>
              <p className="font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="First Name"
                type="text" 
                name="first_name" 
                placeholder="John" 
                value={formData.first_name} 
                onChange={handleChange}
                icon={User}
                required 
              />
              <Input 
                label="Last Name"
                type="text" 
                name="last_name" 
                placeholder="Doe" 
                value={formData.last_name} 
                onChange={handleChange}
                icon={User}
                required 
              />
            </div>
            
            <Input 
              label="Email Address"
              type="email" 
              name="email"
              placeholder="athlete@example.com" 
              value={formData.email} 
              onChange={handleChange}
              icon={Mail}
              required 
            />
            
            <Input 
              label="Password"
              type="password" 
              name="password"
              placeholder="••••••••" 
              value={formData.password} 
              onChange={handleChange}
              icon={Lock}
              required 
            />
            
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-semibold text-foreground">Account Type</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none">
                  <Briefcase size={18} />
                </div>
                <select 
                  name="role" 
                  className="w-full bg-card border border-white/10 hover:border-[#CBD5E1] focus:border-[#2563EB] focus:ring-4 focus:ring-[#EFF6FF] rounded-xl pl-11 pr-10 py-2.5 text-foreground text-sm font-medium outline-none appearance-none transition-all shadow-sm cursor-pointer"
                  value={formData.role} 
                  onChange={handleChange} 
                  required
                >
                  <option value="ROLE_ATHLETE">Athlete</option>
                  <option value="ROLE_COACH">Coach</option>
                  <option value="ROLE_ORG_ADMIN">Organization Admin</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#94A3B8]">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              className="w-full mt-2 font-bold shadow-md shadow-blue-500/20" 
              isLoading={loading}
            >
              Create Account
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm font-medium text-muted-foreground mt-8 animate-fade-in delay-200">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:text-[#1D4ED8] transition-colors ml-1">Sign in here</Link>
        </p>

      </div>
    </div>
  );
}


