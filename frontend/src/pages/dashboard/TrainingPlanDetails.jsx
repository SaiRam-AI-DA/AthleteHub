import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { ArrowLeft, Edit, Trash2, Calendar, User, AlignLeft } from 'lucide-react';

export default function TrainingPlanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/training-plans/${id}`);
      setPlan(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch plan details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this training plan?')) {
      try {
        await api.delete(`/training-plans/${id}`);
        navigate('/dashboard/training-plans');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete plan');
      }
    }
  };

  if (loading) return <LoadingSpinner text="Loading plan details..." />;
  if (error) return <div className="text-destructive p-4">{error}</div>;
  if (!plan) return <div className="text-muted-foreground p-4">Plan not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/training-plans" className="p-2 hover:bg-background rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-h2">Plan Details</h1>
        </div>
        <div className="flex gap-3">
          <Link to={`/dashboard/training-plans/${id}/edit`} className="btn btn-outline flex items-center gap-2">
            <Edit size={18} /> Edit
          </Link>
          <button onClick={handleDelete} className="btn border border-destructive/30 text-destructive hover:bg-destructive/10 flex items-center gap-2">
            <Trash2 size={18} /> Delete
          </button>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><User size={16} /> Coach ID: {plan.coachId || 'N/A'}</span>
              <span className="flex items-center gap-1"><User size={16} /> Athlete ID: {plan.athleteId || 'N/A'}</span>
            </div>
          </div>
          <StatusBadge status={plan.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-white/10 mb-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <AlignLeft size={16} /> Description
            </h3>
            <p className="text-foreground whitespace-pre-wrap">{plan.description || 'No description provided.'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Calendar size={16} /> Duration
            </h3>
            <div className="text-foreground">
              <p><strong>Sport:</strong> {plan.sportName || plan.sport?.name || 'N/A'}</p>
              <p className="mt-2"><strong>Difficulty:</strong> {plan.difficultyLevel || 'N/A'}</p>
              <p className="mt-2"><strong>Duration:</strong> {plan.durationWeeks ? `${plan.durationWeeks} Weeks` : 'N/A'}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">Sessions in this Plan</h3>
          <p className="text-muted-foreground text-sm mb-4">Sessions linked to this plan will appear here.</p>
          <Link to={`/dashboard/training-sessions/new?planId=${plan.id}`} className="btn btn-outline inline-flex items-center gap-2">
            <Calendar size={18} /> Add Session
          </Link>
        </div>
      </div>
    </div>
  );
}


