import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import pb, { getImageUrl, clearCache } from '../../config/pocketbase';
import type { PortfolioProject, Homepage } from '../../config/pocketbase';
import ProjectEditor from '../../components/admin/ProjectEditor';
import SettingsSidebar from '../../components/admin/SettingsSidebar';

export default function AdminDashboard() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [heroImage, setHeroImage] = useState<string>('');
  const [homepageId, setHomepageId] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
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
    fetchHeroImage();
  }, []);

  // Fetch hero image
  const fetchHeroImage = async () => {
    try {
      const homepage = await pb.collection('Homepage').getFirstListItem<Homepage>('Is_Active = true');
      if (homepage && homepage.Hero_Image) {
        const imageUrl = getImageUrl(homepage, homepage.Hero_Image);
        setHeroImage(imageUrl);
        setHomepageId(homepage.id);
      }
    } catch (err) {
      console.error('Error fetching hero image:', err);
    }
  };

  // Handle hero image update
  const handleHeroImageUpdate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !homepageId) return;

    try {
      const formData = new FormData();
      formData.append('Hero_Image', file);

      await pb.collection('Homepage').update(homepageId, formData);

      // Clear cache so frontend shows updated image immediately
      clearCache('Homepage');

      // Refresh hero image
      await fetchHeroImage();
    } catch (err: any) {
      console.error('Error updating hero image:', err);
      alert('Failed to update hero image: ' + (err?.message || 'Unknown error'));
    }
  };

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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-zinc-950"
      style={{ fontFamily: 'EnduroWeb, sans-serif' }}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {/* Header */}
      <header className="border-b border-zinc-800/50 backdrop-blur-sm bg-zinc-950/80 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-medium text-white tracking-tight">
              Portfolio
            </h1>
            <p className="text-xs text-zinc-500 mt-1 tracking-wide">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="px-4 py-2 text-xs tracking-wide text-zinc-400 hover:text-white transition-colors uppercase"
            >
              View Portfolio
            </a>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
              aria-label="Settings"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                <path d="M16.5 10c0 .5-.1 1-.2 1.4l1.4.8c.2.1.2.4.1.6l-1.5 2.6c-.1.2-.4.3-.6.2l-1.4-.8c-.6.5-1.3.9-2 1.1l-.3 1.6c0 .2-.2.4-.5.4h-3c-.3 0-.5-.2-.5-.4l-.3-1.6c-.7-.2-1.4-.6-2-1.1l-1.4.8c-.2.1-.5 0-.6-.2l-1.5-2.6c-.1-.2 0-.5.1-.6l1.4-.8c-.1-.4-.2-.9-.2-1.4s.1-1 .2-1.4l-1.4-.8c-.2-.1-.2-.4-.1-.6l1.5-2.6c.1-.2.4-.3.6-.2l1.4.8c.6-.5 1.3-.9 2-1.1l.3-1.6c0-.2.2-.4.5-.4h3c.3 0 .5.2.5.4l.3 1.6c.7.2 1.4.6 2 1.1l1.4-.8c.2-.1.5 0 .6.2l1.5 2.6c.1.2 0 .5-.1.6l-1.4.8c.1.4.2.9.2 1.4z" />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs tracking-wide bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-sm transition-colors uppercase"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-950/20 border border-red-800/30 text-red-200 px-4 py-3 rounded-sm mb-8 text-sm">
            {error}
          </div>
        )}

        {/* Hero Image Section */}
        {heroImage && (
          <div className="mb-12">
            <div
              className="relative w-full rounded-sm overflow-hidden bg-zinc-900/30 border border-zinc-800/50 group"
              style={{ paddingBottom: '56.25%' }}
            >
              <img
                src={heroImage}
                alt="Hero"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Update Button Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{
                  opacity: 1,
                  transition: { duration: 0.3, ease: "easeIn" }
                }}
                className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-end justify-end p-6"
              >
                <button
                  onClick={() => heroFileInputRef.current?.click()}
                  className="px-6 py-2.5 bg-black/30 border border-zinc-700/50 text-zinc-300 rounded-sm text-xs hover:bg-black/50 hover:text-white hover:border-zinc-600/50 font-medium transition-all uppercase tracking-wide"
                >
                  Update Hero Image
                </button>
              </motion.div>

              {/* Hidden File Input */}
              <input
                ref={heroFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleHeroImageUpdate}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-white/10 mb-12"></div>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group bg-zinc-900/30 rounded-sm overflow-hidden border border-zinc-800/50 hover:border-zinc-700/50 transition-all hover:shadow-xl hover:shadow-black/20"
            >
              {/* Project Preview */}
              <div className="relative h-56 bg-zinc-900/50 overflow-hidden">
                {project.Images && project.Images.length > 0 ? (
                  <>
                    <img
                      src={getImageUrl(project, project.Images[0])}
                      alt={project.Title}
                      className="w-full h-full object-cover"
                    />
                    {/* Blur Overlay on Hover */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{
                        opacity: 1,
                        transition: { duration: 0.3, ease: "easeIn" }
                      }}
                      className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-zinc-600 text-xs uppercase tracking-wide">No images</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-sm text-xs tracking-wide">
                  {project.Images?.length || 0}
                </div>
              </div>

              {/* Project Info */}
              <div className="p-5">
                <div className="mb-4">
                  <h3 className="font-medium text-base mb-1.5 text-white tracking-tight">
                    {project.Title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {project.Description}
                  </p>
                </div>

                {/* Order */}
                <div className="text-xs text-zinc-600 mb-4 uppercase tracking-wider">
                  Position {project.Order}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingProject(project)}
                    className="flex-1 px-4 py-2.5 bg-black/30 border border-zinc-700/50 text-zinc-300 rounded-sm text-xs hover:bg-black/50 hover:text-white hover:border-zinc-600/50 font-medium transition-all uppercase tracking-wide"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="flex-1 px-4 py-2.5 bg-red-600/10 text-red-400 rounded-sm text-xs hover:bg-red-600/20 hover:text-red-300 font-medium transition-all uppercase tracking-wide border border-red-600/20 hover:border-red-600/30"
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
            <p className="text-zinc-600 text-sm uppercase tracking-wider">No projects yet</p>
            <p className="text-zinc-700 text-xs mt-2">Create your first project to get started</p>
          </div>
        )}

        {/* Create New Project Button */}
        <div className="mt-12">
          <button
            onClick={() => setShowNewProjectForm(true)}
            className="px-8 py-2.5 bg-white text-black rounded-sm text-sm hover:bg-zinc-100 transition-all font-medium tracking-wide uppercase hover:shadow-lg hover:shadow-white/5"
          >
            + New Project
          </button>
        </div>
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

      {/* Settings Sidebar */}
      <SettingsSidebar
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </motion.div>
  );
}
