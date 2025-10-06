import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb, { getImageUrl, clearCache } from '../../config/pocketbase';
import type { PortfolioProject } from '../../config/pocketbase';
import ProjectEditor from '../../components/admin/ProjectEditor';

export default function AdminDashboard() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!pb.authStore.isValid) {
      navigate('/admin');
    }
  }, [navigate]);

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await pb.collection('Portfolio_Projects').getFullList<PortfolioProject>({
        sort: 'Order'
      });
      setProjects(response);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching projects:', err);

      // Check if error is due to authentication
      if (err?.status === 401 || err?.status === 403) {
        pb.authStore.clear();
        navigate('/admin');
        return;
      }

      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleLogout = () => {
    pb.authStore.clear();
    navigate('/admin');
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    try {
      await pb.collection('Portfolio_Projects').delete(projectId);

      // Clear cache so frontend shows updated data immediately
      clearCache('Portfolio_Projects');

      await fetchProjects();
    } catch (err: any) {
      console.error('Error deleting project:', err);

      // Check if error is due to authentication
      if (err?.status === 401 || err?.status === 403) {
        pb.authStore.clear();
        navigate('/admin');
        return;
      }

      alert('Failed to delete project: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleSave = async () => {
    setEditingProject(null);
    setShowNewProjectForm(false);
    await fetchProjects();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950" style={{ fontFamily: 'EnduroWeb, sans-serif' }}>
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm bg-gray-950/80 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-medium text-white tracking-tight">
              Portfolio
            </h1>
            <p className="text-xs text-gray-500 mt-1 tracking-wide">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="px-4 py-2 text-xs tracking-wide text-gray-400 hover:text-white transition-colors uppercase"
            >
              View Portfolio
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs tracking-wide bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white rounded transition-colors uppercase"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-950/20 border border-red-800/30 text-red-200 px-4 py-3 rounded mb-8 text-sm">
            {error}
          </div>
        )}

        {/* Create New Project Button */}
        <div className="mb-12">
          <button
            onClick={() => setShowNewProjectForm(true)}
            className="px-8 py-3 bg-white text-black rounded text-sm hover:bg-gray-100 transition-all font-medium tracking-wide uppercase hover:shadow-lg hover:shadow-white/5"
          >
            + New Project
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group bg-gray-900/30 rounded-lg overflow-hidden border border-gray-800/50 hover:border-gray-700/50 transition-all hover:shadow-xl hover:shadow-black/20"
            >
              {/* Project Preview */}
              <div className="relative h-56 bg-gray-900/50 overflow-hidden">
                {project.Images && project.Images.length > 0 ? (
                  <img
                    src={getImageUrl(project, project.Images[0])}
                    alt={project.Title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-600 text-xs uppercase tracking-wide">No images</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs tracking-wide">
                  {project.Images?.length || 0}
                </div>
              </div>

              {/* Project Info */}
              <div className="p-5">
                <div className="mb-4">
                  <h3 className="font-medium text-base mb-1.5 text-white tracking-tight">
                    {project.Title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {project.Description}
                  </p>
                </div>

                {/* Order */}
                <div className="text-xs text-gray-600 mb-4 uppercase tracking-wider">
                  Position {project.Order}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingProject(project)}
                    className="flex-1 px-4 py-2.5 bg-black/30 border border-gray-700/50 text-gray-300 rounded text-xs hover:bg-black/50 hover:text-white hover:border-gray-600/50 font-medium transition-all uppercase tracking-wide"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="flex-1 px-4 py-2.5 bg-red-600/10 text-red-400 rounded text-xs hover:bg-red-600/20 hover:text-red-300 font-medium transition-all uppercase tracking-wide border border-red-600/20 hover:border-red-600/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 text-sm uppercase tracking-wider">No projects yet</p>
            <p className="text-gray-700 text-xs mt-2">Create your first project to get started</p>
          </div>
        )}
      </main>

      {/* Project Editor Overlay */}
      {(editingProject || showNewProjectForm) && (
        <ProjectEditor
          project={editingProject}
          onSave={handleSave}
          onCancel={() => {
            setEditingProject(null);
            setShowNewProjectForm(false);
          }}
        />
      )}
    </div>
  );
}
