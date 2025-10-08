import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Reorder } from 'motion/react';
import pb, { getImageUrl } from '../../config/pocketbase';
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
  const [heroTitle, setHeroTitle] = useState<string>('');
  const [homepageId, setHomepageId] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState<string>('');
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
        sort: 'Order',
        requestKey: null // Disable auto-cancellation
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
  const handleDragEnd = (_event: any, info: any) => {
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
      const homepage = await pb.collection('Homepage').getFirstListItem<Homepage>('Is_Active = true', {
        requestKey: null // Disable auto-cancellation
      });
      if (homepage) {
        if (homepage.Hero_Image) {
          const imageUrl = getImageUrl(homepage, homepage.Hero_Image);
          setHeroImage(imageUrl);
        }
        if (homepage.Hero_Image_Mobile) {
          const imageUrlMobile = getImageUrl(homepage, homepage.Hero_Image_Mobile);
          setHeroImageMobile(imageUrlMobile);
        }
        setHeroTitle(homepage.Hero_Title || '');
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

  // Handle hero title edit
  const handleTitleClick = () => {
    setTempTitle(heroTitle);
    setIsEditingTitle(true);
  };

  const handleTitleInput = (e: React.FormEvent<HTMLHeadingElement>) => {
    setTempTitle(e.currentTarget.textContent || '');
  };

  const handleTitleSave = async () => {
    if (!homepageId || tempTitle.trim() === heroTitle) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await pb.collection('Homepage').update(homepageId, {
        Hero_Title: tempTitle.trim()
      });

      setHeroTitle(tempTitle.trim());
      setIsEditingTitle(false);
    } catch (err: any) {
      console.error('Error updating hero title:', err);
      alert('Failed to update hero title: ' + (err?.message || 'Unknown error'));
      setIsEditingTitle(false);
    }
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setTempTitle('');
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    try {
      await pb.collection('Portfolio_Projects').delete(projectId);

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-black"
      style={{ fontFamily: 'EnduroWeb, sans-serif' }}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {/* Header */}
      <header className="border-b border-neutral-800/70 backdrop-blur-sm bg-black/80 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-medium text-white tracking-tight">
              Portfolio
            </h1>
            <p className="text-xs text-neutral-500 mt-1 tracking-wide">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="px-4 py-2 text-xs tracking-wide text-neutral-400 hover:text-white transition-colors uppercase"
            >
              View Portfolio
            </a>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
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
              className="px-4 py-2 text-xs tracking-wide bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-sm transition-colors uppercase"
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
                  className="relative w-full rounded-sm overflow-hidden bg-neutral-900/30 border border-neutral-800/70 group"
                  style={{ height: '680px', boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.4)' }}
                >
                  <img
                    src={heroImage}
                    alt="Hero Desktop"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Draggable Trigger Zones */}
                  <div className="absolute top-0 left-0 w-1/2 h-1/2 cursor-grab active:cursor-grabbing" />
                  <div className="absolute bottom-0 left-0 w-1/2 h-1/2 cursor-grab active:cursor-grabbing" />

                  {/* Hero Title Overlay */}
                  {heroTitle && (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center px-6">
                          <h1
                            contentEditable={isEditingTitle}
                            suppressContentEditableWarning
                            onInput={handleTitleInput}
                            onClick={!isEditingTitle ? handleTitleClick : undefined}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleTitleSave();
                              }
                              if (e.key === 'Escape') {
                                e.preventDefault();
                                handleTitleCancel();
                              }
                            }}
                            className={`text-white uppercase leading-none text-4xl outline-none pointer-events-auto inline-block ${
                              isEditingTitle
                                ? 'cursor-text'
                                : 'cursor-pointer hover:opacity-80 transition-opacity'
                            }`}
                            style={{
                              fontFamily: 'EnduroWeb, sans-serif',
                              letterSpacing: '0.03em',
                            }}
                            title={!isEditingTitle ? "Click to edit" : undefined}
                          >
                            {heroTitle}
                          </h1>
                        </div>
                      </div>
                      {isEditingTitle && (
                        <div className="absolute bottom-6 right-6 flex gap-2 z-10 pointer-events-none">
                          <button
                            onClick={handleTitleCancel}
                            className="w-10 h-10 flex items-center justify-center bg-black/60 border border-white/30 text-white rounded-sm hover:bg-black/80 transition-all shadow-lg backdrop-blur-md pointer-events-auto"
                            title="Cancel"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                          <button
                            onClick={handleTitleSave}
                            className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-sm hover:bg-neutral-100 transition-all shadow-lg pointer-events-auto"
                            title="Save"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Update Button Overlay - Bottom Right Corner Only */}
                  {!isEditingTitle && (
                    <div className="absolute bottom-0 right-0 p-6 pointer-events-auto group/update">
                      <button
                        onClick={() => heroFileInputRef.current?.click()}
                        className="w-10 h-10 flex items-center justify-center bg-black/60 border border-neutral-700/60 text-neutral-200 rounded-sm hover:bg-black/80 hover:text-white hover:border-neutral-600/60 transition-all shadow-lg backdrop-blur-md opacity-0 group-hover/update:opacity-100"
                        title="Update Desktop Hero"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </button>
                    </div>
                  )}
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
                  className="relative w-full rounded-sm overflow-hidden bg-neutral-900/30 border border-neutral-800/70 group"
                  style={{ height: '680px', boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.4)' }}
                >
                  <img
                    src={heroImageMobile}
                    alt="Hero Mobile"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Draggable Trigger Zones */}
                  <div className="absolute top-0 left-0 w-1/2 h-1/2 cursor-grab active:cursor-grabbing" />
                  <div className="absolute bottom-0 left-0 w-1/2 h-1/2 cursor-grab active:cursor-grabbing" />

                  {/* Hero Title Overlay */}
                  {heroTitle && (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center px-6">
                          <h1
                            contentEditable={isEditingTitle}
                            suppressContentEditableWarning
                            onInput={handleTitleInput}
                            onClick={!isEditingTitle ? handleTitleClick : undefined}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleTitleSave();
                              }
                              if (e.key === 'Escape') {
                                e.preventDefault();
                                handleTitleCancel();
                              }
                            }}
                            className={`text-white uppercase leading-none text-xl outline-none pointer-events-auto inline-block ${
                              isEditingTitle
                                ? 'cursor-text'
                                : 'cursor-pointer hover:opacity-80 transition-opacity'
                            }`}
                            style={{
                              fontFamily: 'EnduroWeb, sans-serif',
                              letterSpacing: '0.03em',
                            }}
                            title={!isEditingTitle ? "Click to edit" : undefined}
                          >
                            {heroTitle}
                          </h1>
                        </div>
                      </div>
                      {isEditingTitle && (
                        <div className="absolute bottom-6 right-6 flex gap-2 z-10 pointer-events-none">
                          <button
                            onClick={handleTitleCancel}
                            className="w-9 h-9 flex items-center justify-center bg-black/60 border border-white/30 text-white rounded-sm hover:bg-black/80 transition-all shadow-lg backdrop-blur-md pointer-events-auto"
                            title="Cancel"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                          <button
                            onClick={handleTitleSave}
                            className="w-9 h-9 flex items-center justify-center bg-white text-black rounded-sm hover:bg-neutral-100 transition-all shadow-lg pointer-events-auto"
                            title="Save"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Update Button Overlay - Bottom Right Corner Only */}
                  {!isEditingTitle && (
                    <div className="absolute bottom-0 right-0 p-6 pointer-events-auto group/update">
                      <button
                        onClick={() => heroMobileFileInputRef.current?.click()}
                        className="w-9 h-9 flex items-center justify-center bg-black/60 border border-neutral-700/60 text-neutral-200 rounded-sm hover:bg-black/80 hover:text-white hover:border-neutral-600/60 transition-all shadow-lg backdrop-blur-md opacity-0 group-hover/update:opacity-100"
                        title="Update Mobile Hero"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </button>
                    </div>
                  )}
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
              className="group bg-gradient-to-br from-neutral-900/50 to-neutral-900/30 rounded-sm border border-neutral-800/70 hover:border-neutral-700 hover:from-neutral-900/70 hover:to-neutral-900/50 cursor-grab active:cursor-grabbing flex items-stretch gap-0 overflow-hidden backdrop-blur-sm"
              style={{ position: 'relative' }}
              animate={{
                scale: 1,
                boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.4)",
                zIndex: 1,
                cursor: 'grab'
              }}
              whileDrag={{
                scale: 1.01,
                boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                zIndex: 50,
                cursor: 'grabbing'
              }}
            >
              {/* Thumbnail */}
              <div className="relative w-1/3 bg-neutral-900/80 overflow-hidden flex-shrink-0 border-r border-neutral-800/70 self-stretch">
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
                  <div className="w-full h-full flex items-center justify-center bg-neutral-900/50">
                    <span className="text-neutral-600 text-sm">–</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white px-2 py-1 rounded-sm text-xs font-medium tracking-wide">
                  {project.Images?.length || 0} {project.Images?.length === 1 ? 'image' : 'images'}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 p-5">
                <div className="mb-2">
                  <h3 className="font-semibold text-base text-white tracking-tight">
                    {project.Title}
                  </h3>
                </div>
                <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                  {project.Description}
                </p>

                {/* Responsibilities */}
                {((project.Responsibility && project.Responsibility.length > 0) ||
                  (project.Responsibility_json && project.Responsibility_json.length > 0)) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(project.Responsibility_json || project.Responsibility || []).map((resp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-neutral-800/70 border border-neutral-700/60 text-neutral-300 rounded-sm text-xs uppercase tracking-wider font-medium backdrop-blur-sm"
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
                    className="px-5 py-2.5 bg-neutral-800/70 border border-neutral-700/60 text-neutral-200 rounded-sm text-xs hover:bg-neutral-700/60 hover:text-white hover:border-neutral-600 font-medium transition-all duration-200 uppercase tracking-wider shadow-sm hover:shadow-md"
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
              <div className="flex items-center px-4 text-neutral-700 group-hover:text-neutral-500 transition-colors duration-200 border-l border-neutral-800/70">
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
            <p className="text-neutral-600 text-sm uppercase tracking-wider">No projects yet</p>
            <p className="text-neutral-700 text-xs mt-2">Create your first project to get started</p>
          </div>
        )}

        {/* Create New Project Button */}
        <div className="mt-12">
          <button
            onClick={() => setShowNewProjectForm(true)}
            className="px-8 py-2.5 bg-white text-black rounded-sm text-sm hover:bg-neutral-100 transition-all font-medium tracking-wide uppercase hover:shadow-lg hover:shadow-white/5"
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
