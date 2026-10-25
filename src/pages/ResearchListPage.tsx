import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { researchApi } from '../services/researchApi';
import { ResearchProject } from '../types/research';
import { Plus, Search, ExternalLink, Send, BarChart3, Layers, Trash2, AlertTriangle } from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';
import { Modal } from '../components/common/Modal';
import { useToast } from '../lib/toast';

export function ResearchListPage() {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<ResearchProject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

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

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await researchApi.deleteProject(projectToDelete.id);
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      toast.success('Study Removed', `Study #${projectToDelete.id} "${projectToDelete.topic}" has been deleted.`);
      setProjectToDelete(null);
    } catch (err: any) {
      toast.error('Failed to delete study', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.target_audience.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.geography.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Research Studies Registry"
        description="Catalog of all defined research projects, dimensional frameworks, and adaptive distribution pipelines."
        kicker="Dentsu Organisation"
        actions={
          <Link
            to="/research/new"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Study</span>
          </Link>
        }
      />

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter studies by topic, audience, or geography..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
        />
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          No research projects found. Create your first study to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((project) => {
            const isActive = project.status === 'active' || project.status === 'survey_active';
            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-semibold text-slate-400">
                      STUDY #{project.id}
                    </span>
                    {isActive ? (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        Not Active
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/research/${project.id}`}
                    className="text-sm font-bold text-slate-900 hover:text-teal-700 block transition-colors leading-snug mb-1"
                  >
                    {project.topic}
                  </Link>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    <strong className="text-slate-800">Target:</strong> {project.target_audience} · {project.geography}
                  </p>

                  {/* Dimension tags */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-4">
                    <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                    {project.dimensions?.map((dim, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded"
                      >
                        {dim}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/research/${project.id}`}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                  >
                    Study Details →
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/research/${project.id}/survey`}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1"
                      title="Survey Distribution & Status"
                    >
                      <Send className="w-3 h-3" />
                      <span>Survey</span>
                    </Link>

                    <Link
                      to={`/research/${project.id}/analytics`}
                      className="px-2.5 py-1 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors flex items-center gap-1"
                      title="Research Analytics & Insights"
                    >
                      <BarChart3 className="w-3 h-3" />
                      <span>Analytics</span>
                    </Link>

                    <a
                      href={`/s/${project.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Open Public Respondent Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => setProjectToDelete(project)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors ml-1"
                      title="Delete Study"
                      aria-label={`Delete study ${project.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        title="Remove Research Study"
        description="Are you sure you want to delete this research study from the registry?"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 space-y-1">
              <p className="font-semibold">This action cannot be undone.</p>
              <p className="text-rose-700">
                Study <strong>#{projectToDelete?.id}</strong> &quot;{projectToDelete?.topic}&quot; and its public survey endpoint will be permanently removed.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setProjectToDelete(null)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Removing...' : 'Delete Study'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
