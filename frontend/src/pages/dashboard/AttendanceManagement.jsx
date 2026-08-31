import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, Save, Check } from 'lucide-react';

export default function AttendanceManagement() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch session details
      const sessionRes = await api.get(`/training-sessions/${id}`);
      setSession(sessionRes.data?.data || sessionRes.data);

      // Fetch attendance records for this session
      const attendanceRes = await api.get(`/training-attendance/session/${id}`);
      const records = attendanceRes.data?.data?.content || attendanceRes.data?.data || [];
      setAttendanceRecords(records);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (recordId, newStatus) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.id === recordId ? { ...record, attendanceStatus: newStatus } : record
      )
    );
  };

  const handleNotesChange = (recordId, coachNotes) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.id === recordId ? { ...record, coachNotes } : record
      )
    );
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      await Promise.all(attendanceRecords.map(record => 
        api.put(`/training-attendance/${record.id}`, {
          trainingSessionId: record.trainingSessionId,
          athleteId: record.athleteId,
          attendanceStatus: record.attendanceStatus,
          coachNotes: record.coachNotes,
          athleteFeedback: record.athleteFeedback || '',
          injuryReport: record.injuryReport || ''
        })
      ));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save attendance records. ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading attendance..." />;
  if (error && !session) return <div className="text-destructive p-4">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`/dashboard/training-sessions/${id}`} className="p-2 hover:bg-background rounded-full transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-h2">Attendance</h1>
          {session && (
            <p className="text-muted-foreground text-sm mt-1">
              Session: {session.title || `Session #${session.id}`} | 
              Date: {session.sessionDate ? new Date(session.sessionDate).toLocaleDateString() : 'N/A'}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-xl mb-6 flex items-center gap-2">
          <Check size={18} /> Attendance saved successfully!
        </div>
      )}

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-foreground">Athletes</h2>
          <button 
            onClick={handleSaveAll}
            disabled={saving || attendanceRecords.length === 0}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>

        {attendanceRecords.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
            <p className="text-muted-foreground">No attendance records found for this session.</p>
            <p className="text-xs text-gray-500 mt-2">Make sure athletes are assigned to this session or its training plan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-muted-foreground text-sm">
                  <th className="pb-3 pr-4 font-medium">Athlete</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Coach Notes</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {attendanceRecords.map(record => (
                  <tr key={record.id} className="border-b border-white/10/50 hover:bg-background transition-colors">
                    <td className="py-4 pr-4 font-medium text-foreground">
                      {record.athleteName || `Athlete ID: ${record.athleteId}`}
                    </td>
                    <td className="py-4 pr-4">
                      <select 
                        value={record.attendanceStatus || 'PRESENT'} 
                        onChange={(e) => handleStatusChange(record.id, e.target.value)}
                        className={`input py-1 px-2 text-sm w-32 ${
                          record.attendanceStatus === 'PRESENT' ? 'border-green-500/50 text-green-400' :
                          record.attendanceStatus === 'ABSENT' ? 'border-red-500/50 text-red-400' :
                          record.attendanceStatus === 'LATE' ? 'border-amber-500/50 text-amber-400' :
                          'border-white/10'
                        }`}
                      >
                        <option value="PRESENT">Present</option>
                        <option value="ABSENT">Absent</option>
                        <option value="LATE">Late</option>
                        <option value="EXCUSED">Excused</option>
                      </select>
                    </td>
                    <td className="py-4">
                      <input 
                        type="text" 
                        value={record.coachNotes || ''} 
                        onChange={(e) => handleNotesChange(record.id, e.target.value)}
                        className="input py-1 text-sm w-full"
                        placeholder="Add notes..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
