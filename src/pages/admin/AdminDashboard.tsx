import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Reorder } from 'motion/react';
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
  const [heroImageMobile, setHeroImageMobile] = useState<string>('');
  const [homepageId, setHomepageId] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const heroMobileFileInputRef = useRef<HTMLInputElement>(null);
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

  // Handle swipe gesture
  const handleDragEnd = (event: any, info: any) => {
    const swipeVelocityThreshold = 500;
    const swipeOffsetThreshold = 50;

    // Detect swipe based on velocity or offset
    if (info.velocity.x < -swipeVelocityThreshold || info.offset.x < -swipeOffsetThreshold) {
      // Swiped left - show mobile preview
      setShowMobilePreview(true);
    } else if (info.velocity.x > swipeVelocityThreshold || info.offset.x > swipeOffsetThreshold) {
      // Swiped right - hide mobile preview
      setShowMobilePreview(false);
    }
  };

  // Fetch hero image
  const fetchHeroImage = async () => {
    try {
      const homepage = await pb.collection('Homepage').getFirstListItem<Homepage>('Is_Active = true');
      if (homepage) {
        if (homepage.Hero_Image) {
          const imageUrl = getImageUrl(homepage, homepage.Hero_Image);
          setHeroImage(imageUrl);
        }
        if (homepage.Hero_Image_Mobile) {
          const imageUrlMobile = getImageUrl(homepage, homepage.Hero_Image_Mobile);
          setHeroImageMobile(imageUrlMobile);
        }
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

  // Handle mobile hero image update
  const handleHeroImageMobileUpdate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !homepageId) return;

    try {
      const formData = new FormData();
      formData.append('Hero_Image_Mobile', file);

      await pb.collection('Homepage').update(homepageId, formData);

      // Clear cache so frontend shows updated image immediately
      clearCache('Homepage');

      // Refresh hero image
      await fetchHeroImage();
    } catch (err: any) {
      console.error('Error updating mobile hero image:', err);
      alert('Failed to update mobile hero image: ' + (err?.message || 'Unknown error'));
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

  // Handle reorder - called by Reorder.Group
  const handleReorder = async (newOrder: PortfolioProject[]) => {
    // Prevent concurrent reordering
    if (isReordering) return;

    // Update local state immediately for visual feedback
    setProjects(newOrder);
    setIsReordering(true);

    try {
      // Batch update all projects with new Order values
      // Use requestKey: null to prevent auto-cancellation of parallel requests
      const updatePromises = newOrder.map((project, index) => {
        const newOrderValue = index + 1; // Order starts at 1
        return pb.collection('Portfolio_Projects').update(project.id, {
          Order: newOrderValue
        }, {
          requestKey: null // Disable auto-cancellation for batch updates
        });
      });

      await Promise.all(updatePromises);

      // Clear cache so frontend shows updated order immediately
      clearCache('Portfolio_Projects');

      console.log('Projects reordered successfully');
    } catch (err: any) {
      console.error('Error reordering projects:', err);

      // Revert to original order on error
      await fetchProjects();

      alert('Failed to reorder projects: ' + (err?.message || 'Unknown error'));
    } finally {
      // Re-enable dragging after update completes
      setIsReordering(false);
    }
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
        {(heroImage || heroImageMobile) && (
          <div className="mb-12">
            {/* Drag Container */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="flex gap-6 cursor-grab active:cursor-grabbing"
            >
              {/* Desktop Preview */}
              <motion.div
                className="flex-shrink-0"
                animate={{
                  width: showMobilePreview ? '66.67%' : '100%'
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <div
                  className="relative w-full rounded-sm overflow-hidden bg-zinc-900/30 border border-zinc-800/50 group"
                  style={{ height: '680px' }}
                >
                  <img
                    src={heroImage}
                    alt="Hero Desktop"
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
                      Update Desktop Hero
                    </button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Mobile Preview (9:16) */}
              <motion.div
                className="flex-shrink-0"
                initial={{ width: '0%', opacity: 0 }}
                animate={{
                  width: showMobilePreview ? 'calc(33.33% - 24px)' : '0%',
                  opacity: showMobilePreview ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  className="relative w-full rounded-sm overflow-hidden bg-zinc-900/30 border border-zinc-800/50 group"
                  style={{ height: '680px' }}
                >
                  <img
                    src={heroImageMobile}
                    alt="Hero Mobile"
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
                      onClick={() => heroMobileFileInputRef.current?.click()}
                      className="px-6 py-2.5 bg-black/30 border border-zinc-700/50 text-zinc-300 rounded-sm text-xs hover:bg-black/50 hover:text-white hover:border-zinc-600/50 font-medium transition-all uppercase tracking-wide"
                    >
                      Update Mobile Hero
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Hidden File Inputs */}
            <input
              ref={heroFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleHeroImageUpdate}
              className="hidden"
            />
            <input
              ref={heroMobileFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleHeroImageMobileUpdate}
              className="hidden"
            />
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-white/10 mb-12"></div>

        {/* Projects List */}
        <Reorder.Group
          as="div"
          axis="y"
          values={projects}
          onReorder={handleReorder}
          className="flex flex-col gap-3"
        >
          {projects.map((project) => (
            <Reorder.Item
              key={project.id}
              value={project}
              className="group bg-gradient-to-br from-zinc-900/40 to-zinc-900/20 rounded-sm border border-zinc-800/60 hover:border-zinc-700 hover:from-zinc-900/60 hover:to-zinc-900/40 cursor-grab active:cursor-grabbing flex items-stretch gap-0 overflow-hidden backdrop-blur-sm"
              style={{ position: 'relative' }}
              animate={{ scale: 1 }}
              whileDrag={{
                scale: 1.01,
                boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                zIndex: 50,
                cursor: 'grabbing'
              }}
            >
              {/* Thumbnail */}
              <div className="relative w-1/3 bg-zinc-900/80 overflow-hidden flex-shrink-0 border-r border-zinc-800/60 self-stretch">
                {project.Images && project.Images.length > 0 ? (
                  <>
                    <img
                      src={getImageUrl(project, project.Images[0])}
                      alt={project.Title}
                      className="w-full h-full object-cover absolute inset-0"
                    />
                    {/* Blur Overlay on Hover */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{
                        opacity: 1,
                        transition: { duration: 0.3, ease: "easeIn" }
                      }}
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900/40">
                    <span className="text-zinc-600 text-sm">–</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white px-2 py-1 rounded-sm text-xs font-medium tracking-wide">
                  {project.Images?.length || 0} {project.Images?.length === 1 ? 'image' : 'images'}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 p-5">
                <div className="flex items-baseline gap-3 mb-2">
                  <h3 className="font-semibold text-base text-white tracking-tight">
                    {project.Title}
                  </h3>
                  <span className="text-xs text-zinc-500 uppercase tracking-widest flex-shrink-0 font-medium">
                    #{project.Order}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                  {project.Description}
                </p>

                {/* Responsibilities */}
                {((project.Responsibility && project.Responsibility.length > 0) ||
                  (project.Responsibility_json && project.Responsibility_json.length > 0)) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(project.Responsibility_json || project.Responsibility || []).map((resp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-zinc-800/50 border border-zinc-700/60 text-zinc-300 rounded-sm text-xs uppercase tracking-wider font-medium backdrop-blur-sm"
                      >
                        {resp}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setEditingProject(project)}
                    className="px-5 py-2.5 bg-zinc-800/40 border border-zinc-700/60 text-zinc-200 rounded-sm text-xs hover:bg-zinc-700/60 hover:text-white hover:border-zinc-600 font-medium transition-all duration-200 uppercase tracking-wider shadow-sm hover:shadow-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="px-5 py-2.5 bg-red-950/30 text-red-400 rounded-sm text-xs hover:bg-red-900/40 hover:text-red-300 font-medium transition-all duration-200 uppercase tracking-wider border border-red-900/40 hover:border-red-800/60 shadow-sm hover:shadow-md"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Drag Handle */}
              <div className="flex items-center px-4 text-zinc-700 group-hover:text-zinc-500 transition-colors duration-200 border-l border-zinc-800/60">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="9" cy="6" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" />
                  <circle cx="9" cy="18" r="1.5" />
                  <circle cx="15" cy="6" r="1.5" />
                  <circle cx="15" cy="12" r="1.5" />
                  <circle cx="15" cy="18" r="1.5" />
                </svg>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

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
