import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, Save } from 'lucide-react';

export default function TrainingSessionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = !!id;
  const planIdParam = searchParams.get('planId');

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    trainingPlanId: planIdParam || '',
    coachAssignmentId: '',
    title: '',
    description: '',
    sessionType: 'GENERAL',
    intensity: 'MEDIUM',
    sessionDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    status: 'SCHEDULED',
    remarks: ''
  });

  const [plans, setPlans] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchPlans();
    fetchAssignments();
    if (isEditMode) {
      fetchSession();
    }
  }, [id]);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/training-plans', { params: { page_size: 100 } });
      setPlans(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Failed to fetch plans', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/coach-assignments', { params: { page_size: 100 } });
      setAssignments(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Failed to fetch coach assignments', err);
    }
  };

  const fetchSession = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/training-sessions/${id}`);
      const data = response.data?.data || response.data;
      
      setFormData({
        trainingPlanId: data.trainingPlanId || '',
        coachAssignmentId: data.coachAssignmentId || '',
        title: data.title || '',
        description: data.description || '',
        sessionType: data.sessionType || 'GENERAL',
        intensity: data.intensity || 'MEDIUM',
        sessionDate: data.sessionDate ? data.sessionDate.split('T')[0] : '',
        startTime: data.startTime ? data.startTime.substring(0, 5) : '',
        endTime: data.endTime ? data.endTime.substring(0, 5) : '',
        venue: data.venue || '',
        status: data.status || 'SCHEDULED',
        remarks: data.remarks || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load session details');
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
        trainingPlanId: formData.trainingPlanId ? parseInt(formData.trainingPlanId) : null,
        coachAssignmentId: formData.coachAssignmentId ? parseInt(formData.coachAssignmentId) : null,
        title: formData.title,
        description: formData.description,
        sessionType: formData.sessionType,
        intensity: formData.intensity,
        sessionDate: formData.sessionDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        venue: formData.venue,
        status: formData.status,
        remarks: formData.remarks
      };
      
      // format time strings properly if provided (HH:MM:SS)
      if (payload.startTime && payload.startTime.length === 5) payload.startTime += ':00';
      if (payload.endTime && payload.endTime.length === 5) payload.endTime += ':00';

      if (isEditMode) {
        await api.put(`/training-sessions/${id}`, payload);
      } else {
        await api.post('/training-sessions', payload);
      }
      navigate('/dashboard/training');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors || err.message || 'Failed to save training session');
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
        <h1 className="text-h2">{isEditMode ? 'Edit Session' : 'New Session'}</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-xl mb-6">
          {Array.isArray(error) ? error.join(', ') : error}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Session Title *</label>
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
              <label className="block text-sm font-medium text-muted-foreground mb-2">Training Plan *</label>
              <select 
                name="trainingPlanId" 
                value={formData.trainingPlanId} 
                onChange={handleChange} 
                className="input w-full"
                required
              >
                <option value="">Select Training Plan</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.title} (ID: {p.id})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Coach & Athlete Assignment *</label>
              <select 
                name="coachAssignmentId" 
                value={formData.coachAssignmentId} 
                onChange={handleChange} 
                className="input w-full"
                required
              >
                <option value="">Select Assignment</option>
                {assignments.map(asg => (
                  <option key={asg.id} value={asg.id}>
                    Coach: {asg.coachName || asg.coachId} → Athlete: {asg.athleteName || asg.athleteId} (ID: {asg.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Session Type *</label>
              <select name="sessionType" value={formData.sessionType} onChange={handleChange} className="input w-full" required>
                <option value="GENERAL">General</option>
                <option value="STRENGTH">Strength</option>
                <option value="CARDIO">Cardio</option>
                <option value="RECOVERY">Recovery</option>
                <option value="SKILL">Skill</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Intensity *</label>
              <select name="intensity" value={formData.intensity} onChange={handleChange} className="input w-full" required>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Status *</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input w-full" required>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Date *</label>
              <input 
                type="date" 
                name="sessionDate" 
                value={formData.sessionDate} 
                onChange={handleChange} 
                className="input w-full"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Start Time *</label>
              <input 
                type="time" 
                name="startTime" 
                value={formData.startTime} 
                onChange={handleChange} 
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">End Time *</label>
              <input 
                type="time" 
                name="endTime" 
                value={formData.endTime} 
                onChange={handleChange} 
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Venue *</label>
              <input 
                type="text" 
                name="venue" 
                value={formData.venue} 
                onChange={handleChange} 
                className="input w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              className="input w-full h-24"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Remarks</label>
            <textarea 
              name="remarks" 
              value={formData.remarks} 
              onChange={handleChange} 
              className="input w-full h-24"
              placeholder="Session notes / remarks"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Link to="/dashboard/training" className="btn btn-outline">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="btn btn-primary flex items-center gap-2">
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
