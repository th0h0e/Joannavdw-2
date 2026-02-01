import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import pb, { getImageUrl } from '../../config/pocketbase';
import type { PortfolioProject } from '../../config/pocketbase';
import ProjectPopupPreview from './ProjectPopupPreview';

type ProjectEditorProps = {
  project: PortfolioProject | null;
  onSave: () => void;
  onCancel: () => void;
};

type ImageItem = {
  id: string;
  file?: File;
  url: string;
  filename: string;
  isExisting: boolean;
};

export default function ProjectEditor({ project, onSave, onCancel }: ProjectEditorProps) {
  const [title, setTitle] = useState(project?.Title || '');
  const [description, setDescription] = useState(project?.Description || '');
  const [order, setOrder] = useState(project?.Order || 0);
  const [responsibilities, setResponsibilities] = useState<string[]>(project?.Responsibility_json || project?.Responsibility || []);
  const [newResponsibility, setNewResponsibility] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Track window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize images from existing project
  useEffect(() => {
    if (project && project.Images) {
      const existingImages: ImageItem[] = project.Images.map((filename, index) => ({
        id: `existing-${index}`,
        url: getImageUrl(project, filename),
        filename,
        isExisting: true
      }));
      setImages(existingImages);
    }
  }, [project]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleAddResponsibility = () => {
    if (newResponsibility.trim()) {
      setResponsibilities([...responsibilities, newResponsibility.trim().toUpperCase()]);
      setNewResponsibility('');
    }
  };

  const handleRemoveResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageItem[] = Array.from(files).map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      file,
      url: URL.createObjectURL(file),
      filename: file.name,
      isExisting: false
    }));

    setImages([...images, ...newImages]);
  };

  // Drag and drop handlers for file upload
  const handleFileDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleFileDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    // Filter for image files only
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

    const newImages: ImageItem[] = imageFiles.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      file,
      url: URL.createObjectURL(file),
      filename: file.name,
      isExisting: false
    }));

    setImages([...images, ...newImages]);
  };

  const handleDeleteImage = (image: ImageItem) => {
    // Mark existing images for deletion
    if (image.isExisting) {
      setImagesToDelete([...imagesToDelete, image.filename]);
    }

    // Remove from display
    setImages(images.filter(img => img.id !== image.id));

    // Revoke object URL for new images
    if (!image.isExisting) {
      URL.revokeObjectURL(image.url);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];

    // Remove from old position
    newImages.splice(draggedIndex, 1);

    // Insert at new position
    newImages.splice(index, 0, draggedItem);

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('Title', title);
      formData.append('Description', description);
      formData.append('Order', order.toString());

      // Add responsibilities to the json field (not the select field)
      responsibilities.forEach((resp) => {
        formData.append('Responsibility_json', resp);
      });

      // Handle images - need to preserve order
      if (project && images.length > 0) {
        // For existing projects with reordered images:
        // 1. Delete all existing images
        // 2. Re-upload all images in the new order

        // First, delete all existing images
        if (project.Images && project.Images.length > 0) {
          project.Images.forEach((filename) => {
            formData.append('Images-', filename);
          });
        }

        // Now download and re-upload all images in the correct order
        for (const img of images) {
          if (img.file) {
            // New image - just append the file
            formData.append('Images', img.file);
          } else if (img.isExisting) {
            // Existing image - need to download and re-upload to preserve order
            try {
              const response = await fetch(img.url);
              const blob = await response.blob();
              const file = new File([blob], img.filename, { type: blob.type });
              formData.append('Images', file);
            } catch (error) {
              console.error('Error downloading existing image:', error);
              throw new Error(`Failed to download image: ${img.filename}`);
            }
          }
        }
      } else {
        // New project - just add all new images
        images.forEach((img) => {
          if (img.file) {
            formData.append('Images', img.file);
          }
        });
      }

      if (project) {
        // Update existing project
        await pb.collection('Portfolio_Projects').update(project.id, formData);
      } else {
        // Create new project
        await pb.collection('Portfolio_Projects').create(formData);
      }

      onSave();
    } catch (err: unknown) {
      console.error('Error saving project:', err);

      // Check if error is due to authentication
      const error = err as { status?: number; message?: string };
      if (error?.status === 401 || error?.status === 403) {
        alert('Your session has expired. Please login again.');
        pb.authStore.clear();
        window.location.href = '/admin';
        return;
      }

      alert('Failed to save project: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-neutral-900/70 backdrop-blur-md z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onCancel}
        />

        {/* Project Popup Preview (only when editing on desktop) */}
        {project && !isMobile && (
          <div
            className="absolute top-1/2"
            style={{
              left: '25%',
              transform: 'translate(-50%, -50%)',
              zIndex: 45,
              pointerEvents: 'none'
            }}
          >
            <ProjectPopupPreview
              projectTitle={title}
              projectDescription={description}
              projectResponsibility={responsibilities}
            />
          </div>
        )}

        {/* Sidebar */}
        <motion.div
          className="fixed right-0 top-0 w-3/4 md:w-2/3 lg:w-1/2 bg-black/85 backdrop-blur-xl border-l border-neutral-700/60 shadow-2xl z-50 flex flex-col"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ fontFamily: 'EnduroWeb, sans-serif', height: '100vh' }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Sticky Header */}
            <div className="flex-shrink-0 p-8 border-b border-neutral-800/60 backdrop-blur-sm">
              <h2 className="text-xl font-medium text-white tracking-tight">
                {project ? 'Edit Project' : 'New Project'}
              </h2>
              <p className="text-xs text-neutral-400 mt-1 tracking-wide uppercase">
                {project ? 'Update project details and images' : 'Create a new portfolio project'}
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Images */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-3 uppercase tracking-wider">
                Images (Drag to reorder)
              </label>

              {/* Drag and Drop Upload Zone with Images */}
              <div
                onDragEnter={handleFileDragEnter}
                onDragLeave={handleFileDragLeave}
                onDragOver={handleFileDragOver}
                onDrop={handleFileDrop}
                className={`relative border-2 border-dashed rounded-sm transition-all ${
                  isDraggingFile
                    ? 'border-white/40 bg-white/5'
                    : 'border-neutral-700/60 bg-black/30'
                } ${images.length === 0 ? 'cursor-pointer hover:border-neutral-600/60 hover:bg-black/40' : ''}`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="image-upload"
                  style={{ pointerEvents: images.length > 0 ? 'none' : 'auto' }}
                />

                {/* Empty State */}
                {images.length === 0 && (
                  <label htmlFor="image-upload" className="block py-12 px-6 text-center cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        className={`w-12 h-12 transition-colors ${
                          isDraggingFile ? 'text-white' : 'text-neutral-500'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <div>
                        <p className={`text-sm font-medium transition-colors ${
                          isDraggingFile ? 'text-white' : 'text-neutral-300'
                        } uppercase tracking-wide`}>
                          {isDraggingFile ? 'Drop images here' : 'Drag & drop images'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1 tracking-wide">
                          or click to browse
                        </p>
                      </div>
                    </div>
                  </label>
                )}

                {/* Image Grid */}
                {images.length > 0 && (
                  <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {images.map((image, index) => (
                        <div
                          key={image.id}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`relative group cursor-move border rounded-sm overflow-hidden ${
                            draggedIndex === index ? 'border-neutral-500 opacity-50' : 'border-neutral-700/60'
                          } hover:border-neutral-600 transition-all`}
                        >
                          <div className="aspect-square bg-black/50">
                            <img
                              src={image.url}
                              alt={image.filename}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Order Badge */}
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-sm text-xs font-medium">
                            {index + 1}
                          </div>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(image)}
                            className="absolute top-2 right-2 bg-red-600/10 backdrop-blur-md text-red-400 px-2.5 py-1 rounded-sm text-xs hover:bg-red-600/20 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all font-medium uppercase tracking-wide border border-red-600/20 hover:border-red-600/30"
                          >
                            Delete
                          </button>

                          {/* Filename */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white px-2 py-1.5 text-xs truncate">
                            {image.filename}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10"></div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-xs font-medium text-neutral-300 mb-2 uppercase tracking-wider">
                Project Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/30 border border-neutral-700/60 text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 placeholder-neutral-500 text-sm transition-all"
                placeholder="e.g., Maria Bodil for Nike"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xs font-medium text-neutral-300 mb-2 uppercase tracking-wider">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-3 bg-black/30 border border-neutral-700/60 text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 placeholder-neutral-500 text-sm transition-all resize-none"
                placeholder="Project description..."
              />
            </div>

            {/* Order */}
            <div>
              <label htmlFor="order" className="block text-xs font-medium text-neutral-300 mb-2 uppercase tracking-wider">
                Position in Portfolio *
              </label>
              <input
                id="order"
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value))}
                required
                min="0"
                className="w-full px-4 py-3 bg-black/30 border border-neutral-700/60 text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 text-sm transition-all"
              />
            </div>

            {/* Responsibilities */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-2 uppercase tracking-wider">
                Responsibilities
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newResponsibility}
                  onChange={(e) => setNewResponsibility(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddResponsibility())}
                  className="flex-1 px-4 py-2.5 bg-black/30 border border-neutral-700/60 text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 placeholder-neutral-500 text-sm transition-all"
                  placeholder="e.g., CREATIVE PRODUCTION"
                />
                <button
                  type="button"
                  onClick={handleAddResponsibility}
                  className="px-6 py-3 bg-white text-black rounded-sm text-sm hover:bg-neutral-100 font-medium transition-all uppercase tracking-wide"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {responsibilities.map((resp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 bg-black/30 border border-neutral-700/40 text-neutral-200 px-3 py-1.5 rounded-sm text-xs tracking-wide"
                  >
                    {resp}
                    <button
                      type="button"
                      onClick={() => handleRemoveResponsibility(idx)}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            </div>

            {/* Sticky Footer */}
            <div className="flex-shrink-0 p-8 border-t border-neutral-800/60 flex gap-3 backdrop-blur-sm">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 bg-black/30 border border-neutral-700/60 text-neutral-200 rounded-sm hover:bg-black/50 hover:text-white hover:border-neutral-600/60 transition-all text-sm uppercase tracking-wide font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-white text-black rounded-sm hover:bg-neutral-100 disabled:bg-neutral-600 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all font-medium text-sm uppercase tracking-wide hover:shadow-lg hover:shadow-white/10"
              >
                {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </form>
        </motion.div>
      </>
    </AnimatePresence>,
    document.body
  );
}
