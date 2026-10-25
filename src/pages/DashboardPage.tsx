import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { MetricCard } from '../components/analytics/MetricCard';
import { researchApi } from '../services/researchApi';
import { ResearchProject } from '../types/research';
import {
  FolderKanban,
  Users,
  CheckCircle2,
  HelpCircle,
  Plus,
  Search,
  ExternalLink,
  BarChart2,
  Send,
  Eye,
} from 'lucide-react';
import { TableRowSkeleton } from '../components/common/Skeleton';

export function DashboardPage() {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await researchApi.listProjects();
        setProjects(data);
      } catch (err) {
        console.error('Failed to load projects', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.id).includes(searchTerm);
    const isActive = p.status === 'active' || p.status === 'survey_active';
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && isActive) ||
      (statusFilter === 'not_active' && !isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Research Dashboard"
        description="Monitor active adaptive research studies, respondent throughput, and dimensional saturation."
        kicker="Dentsu Organisation"
        actions={
          <Link
            to="/research/new"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Research Study</span>
          </Link>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Research Studies"
          value={isLoading ? '—' : projects.length}
          subtext="Active studies in registry"
          icon={<FolderKanban className="w-4 h-4 text-teal-600" />}
        />
        <MetricCard
          label="Total Survey Sessions"
          value={isLoading ? '—' : '42'}
          subtext="Across active studies"
          icon={<Users className="w-4 h-4 text-indigo-600" />}
        />
        <MetricCard
          label="Completed Surveys"
          value={isLoading ? '—' : '38'}
          subtext="90.5% completion rate"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <MetricCard
          label="Total Responses"
          value={isLoading ? '—' : '266'}
          subtext="Adaptive data points captured"
          icon={<HelpCircle className="w-4 h-4 text-amber-600" />}
        />
      </div>

      {/* Recent Studies Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by topic or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="not_active">Not Active</option>
            </select>
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 w-16">ID</th>
                <th className="py-3 px-4 min-w-[240px]">Topic & Target Cohort</th>
                <th className="py-3 px-4">Geography</th>
                <th className="py-3 px-4">Dimensions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <>
                  <TableRowSkeleton columns={6} />
                  <TableRowSkeleton columns={6} />
                  <TableRowSkeleton columns={6} />
                </>
              )}

              {!isLoading && filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No research studies found matching your criteria.
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredProjects.map((project) => {
                  const isActive = project.status === 'active' || project.status === 'survey_active';
                  return (
                    <tr key={project.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                        #{project.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/research/${project.id}`}
                          className="font-semibold text-slate-900 hover:text-teal-700 block transition-colors leading-tight"
                        >
                          {project.topic}
                        </Link>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {project.target_audience}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {project.geography}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-800 font-medium">
                          {project.dimensions?.length || 0}
                        </span>
                        <span className="text-slate-400 text-[10px] ml-1">constructs</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isActive ? (
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            Active
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            Not Active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/research/${project.id}`}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="View Study Overview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/research/${project.id}/survey`}
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Configure & Distribute Survey"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/research/${project.id}/analytics`}
                          className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Research Analytics & Reports"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                        </Link>
                        <a
                          href={`/s/${project.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Open Public Survey Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
