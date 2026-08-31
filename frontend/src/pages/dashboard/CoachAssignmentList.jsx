import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { coachAssignmentApi } from '../../api/coachAssignmentApi';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import SearchBar from '../../components/ui/SearchBar';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { Plus, BarChart2 } from 'lucide-react';

export default function CoachAssignmentList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['coachAssignments', page, search, statusFilter],
    queryFn: () => coachAssignmentApi.getAssignments({ page, page_size: 10, search, status: statusFilter }),
    placeholderData: (prev) => prev
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1); 
  };

  const assignments = response?.data || [];
  const totalPages = response?.pagination?.total_pages || 1;
  const totalRecords = response?.pagination?.total_records || 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-h2">Coach Assignments</h1>
          <p className="text-muted-foreground mt-1">Total: {totalRecords}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/coach-assignments/dashboard" className="btn btn-outline flex items-center gap-2">
            <BarChart2 size={18} /> Stats
          </Link>
          <Link to="/dashboard/coach-assignments/new" className="btn btn-primary flex items-center gap-2">
            <Plus size={18} /> New Assignment
          </Link>
        </div>
      </div>

      <div className="card mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex-1 w-full">
          <SearchBar 
            search={searchInput} 
            setSearch={setSearchInput} 
            onSearch={handleSearch} 
            placeholder="Search by code, coach, athlete, organization..." 
          />
        </div>
        <div className="w-full md:w-48">
          <select 
            className="input w-full"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-xl mb-6">
          {error.response?.data?.message || error.message || 'Failed to fetch assignments'}
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner text="Loading assignments..." />
      ) : (
        <div className="card">
          {assignments.length === 0 ? (
            <EmptyState title="No assignments found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-muted-foreground text-sm">
                    <th className="pb-3 pr-4 font-medium">Code</th>
                    <th className="pb-3 pr-4 font-medium">Coach</th>
                    <th className="pb-3 pr-4 font-medium">Athlete</th>
                    <th className="pb-3 pr-4 font-medium">Duration</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {assignments.map(assignment => (
                    <tr key={assignment.id} className="border-b border-white/10/50 hover:bg-background transition-colors">
                      <td className="py-4 pr-4 font-mono text-primary">{assignment.assignmentCode || 'N/A'}</td>
                      <td className="py-4 pr-4">
                        <div className="font-medium text-foreground">{assignment.coachName || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{assignment.organizationName || 'N/A'}</div>
                      </td>
                      <td className="py-4 pr-4 font-medium text-foreground">{assignment.athleteName || 'N/A'}</td>
                      <td className="py-4 pr-4 text-muted-foreground">
                        {assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : 'N/A'} - {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : 'Present'}
                      </td>
                      <td className="py-4 pr-4">
                        <StatusBadge status={assignment.status || 'UNKNOWN'} />
                      </td>
                      <td className="py-4 text-right">
                        <Link to={`/dashboard/coach-assignments/${assignment.id}`} className="btn btn-outline py-1 px-3 text-xs inline-block">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/10 mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-sm text-muted-foreground mx-4">
                      Page {page} of {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
