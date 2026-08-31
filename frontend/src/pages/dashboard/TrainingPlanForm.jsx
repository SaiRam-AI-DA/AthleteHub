import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { referenceApi } from '../../api/referenceApi';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, Save } from 'lucide-react';

export default function TrainingPlanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sportId: '',
    organizationId: '',
    difficultyLevel: 'BEGINNER',
    durationWeeks: 4,
    status: 'DRAFT',
    createdBy: '',
  });

  const [coaches, setCoaches] = useState([]);
  const [sports, setSports] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    fetchOptions();
    if (isEditMode) {
      fetchPlan();
    }
  }, [id]);

  const fetchOptions = async () => {
    try {
      const [coachesRes, sportsRes, orgsRes] = await Promise.all([
        api.get('/coaches', { params: { page_size: 100 } }),
        referenceApi.getSports(),
        referenceApi.getOrganizations()
      ]);
      setCoaches(coachesRes.data.data || []);
      setSports(sportsRes || []);
      setOrganizations(orgsRes || []);

      // If not editing, try to default organization and creator coach
      if (!isEditMode && currentUser) {
        const userOrgId = currentUser.organizationId || currentUser.organization?.id;
        const matchingCoach = (coachesRes.data.data || []).find(c => c.email === currentUser.email);
        
        setFormData(prev => ({
          ...prev,
          organizationId: userOrgId ? String(userOrgId) : '',
          createdBy: matchingCoach ? String(matchingCoach.id) : '',
        }));
      }
    } catch (err) {
      console.error('Failed to fetch options', err);
    }
  };

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/training-plans/${id}`);
      const data = response.data?.data || response.data;
      
      setFormData({
        title: data.title || '',
        description: data.description || '',
        sportId: data.sportId || data.sport?.id || '',
        organizationId: data.organizationId || data.organization?.id || '',
        difficultyLevel: data.difficultyLevel || 'BEGINNER',
        durationWeeks: data.durationWeeks || 4,
        status: data.status || 'DRAFT',
        createdBy: data.createdBy || data.creator?.id || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        sportId: formData.sportId ? parseInt(formData.sportId) : null,
        organizationId: formData.organizationId ? parseInt(formData.organizationId) : null,
        createdBy: formData.createdBy ? parseInt(formData.createdBy) : null,
        difficultyLevel: formData.difficultyLevel,
        durationWeeks: formData.durationWeeks ? parseInt(formData.durationWeeks) : 4,
        status: formData.status,
      };

      if (isEditMode) {
        await api.put(`/training-plans/${id}`, payload);
      } else {
        await api.post('/training-plans', payload);
      }
      navigate('/dashboard/training');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors || err.message || 'Failed to save training plan');
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading form..." />;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/dashboard/training" className="p-2 hover:bg-background rounded-full transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-h2">{isEditMode ? 'Edit Training Plan' : 'New Training Plan'}</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-xl mb-6">
          {Array.isArray(error) ? error.join(', ') : error}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Plan Title *</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              className="input w-full"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              className="input w-full h-32"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Sport *</label>
              <select 
                name="sportId" 
                value={formData.sportId} 
                onChange={handleChange} 
                className="input w-full"
                required
              >
                <option value="">Select Sport</option>
                {sports.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Organization *</label>
              <select 
                name="organizationId" 
                value={formData.organizationId} 
                onChange={handleChange} 
                className="input w-full"
                required
              >
                <option value="">Select Organization</option>
                {organizations.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Difficulty Level *</label>
              <select 
                name="difficultyLevel" 
                value={formData.difficultyLevel} 
                onChange={handleChange} 
                className="input w-full"
                required
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Duration (Weeks) *</label>
              <input 
                type="number" 
                name="durationWeeks" 
                value={formData.durationWeeks} 
                onChange={handleChange} 
                className="input w-full"
                min="1"
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Created By Coach *</label>
              <select 
                name="createdBy" 
                value={formData.createdBy} 
                onChange={handleChange} 
                className="input w-full"
                required
              >
                <option value="">Select Creator Coach</option>
                {coaches.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} (ID: {c.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Status *</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="input w-full"
                required
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Link to="/dashboard/training" className="btn btn-outline">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
