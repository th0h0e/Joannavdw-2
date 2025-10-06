import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import pb, { clearCache, getImageUrl } from '../../config/pocketbase';
import type { About, Homepage, Settings } from '../../config/pocketbase';

type SettingsSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SettingsSidebar({ isOpen, onClose }: SettingsSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [aboutData, setAboutData] = useState<About | null>(null);
  const [homepageData, setHomepageData] = useState<Homepage | null>(null);
  const [settingsData, setSettingsData] = useState<Settings | null>(null);
  const faviconFileInputRef = useRef<HTMLInputElement>(null);

  // Form fields - Homepage
  const [heroTitle, setHeroTitle] = useState('');

  // Form fields - Settings
  const [showTopProgressBar, setShowTopProgressBar] = useState(false);
  const [mobileFontSize, setMobileFontSize] = useState(1.25);
  const [tabletFontSize, setTabletFontSize] = useState(1.875);
  const [desktopFontSize, setDesktopFontSize] = useState(2.25);
  const [largeDesktopFontSize, setLargeDesktopFontSize] = useState(3);
  const [faviconUrl, setFaviconUrl] = useState<string>('');

  // Form fields - About
  const [aboutDescription, setAboutDescription] = useState('');
  const [expertiseDescription, setExpertiseDescription] = useState('');
  const [clientList, setClientList] = useState<string[]>([]);
  const [newClient, setNewClient] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Fetch data when sidebar opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch About data
      const about = await pb.collection('About').getFirstListItem<About>('Is_Active = true');
      setAboutData(about);
      setAboutDescription(about.About_Description);
      setExpertiseDescription(about.Expertise_Description);
      setClientList(about.Client_List_Json || about.Client_List || []);
      setContactEmail(about.Contact_Email);

      // Fetch Homepage data
      const homepage = await pb.collection('Homepage').getFirstListItem<Homepage>('Is_Active = true');
      setHomepageData(homepage);
      setHeroTitle(homepage.Hero_Title);

      // Fetch Settings data
      const settings = await pb.collection('Settings').getFirstListItem<Settings>('');
      setSettingsData(settings);
      setShowTopProgressBar(settings.Show_Top_Progress_Bar);
      setMobileFontSize(settings.Mobile_Font_Size);
      setTabletFontSize(settings.Tablet_Font_Size);
      setDesktopFontSize(settings.Desktop_Font_Size);
      setLargeDesktopFontSize(settings.Large_Desktop_Font_Size);

      // Load favicon if exists
      if (settings.favicon) {
        const faviconImageUrl = getImageUrl(settings, settings.favicon);
        setFaviconUrl(faviconImageUrl);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = () => {
    if (newClient.trim()) {
      setClientList([...clientList, newClient.trim().toUpperCase()]);
      setNewClient('');
    }
  };

  const handleRemoveClient = (index: number) => {
    setClientList(clientList.filter((_, i) => i !== index));
  };

  const handleFaviconUpdate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !settingsData) return;

    try {
      const formData = new FormData();
      formData.append('favicon', file);

      await pb.collection('Settings').update(settingsData.id, formData);

      // Clear cache so frontend shows updated favicon immediately
      clearCache('Settings');

      // Refresh favicon URL
      const updatedSettings = await pb.collection('Settings').getOne<Settings>(settingsData.id);
      if (updatedSettings.favicon) {
        const faviconImageUrl = getImageUrl(updatedSettings, updatedSettings.favicon);
        setFaviconUrl(faviconImageUrl);
      }

      alert('Favicon updated! Please refresh the page to see the changes.');
    } catch (err: any) {
      console.error('Error updating favicon:', err);
      alert('Failed to update favicon: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update Homepage
      if (homepageData) {
        await pb.collection('Homepage').update(homepageData.id, {
          Hero_Title: heroTitle
        });
        clearCache('Homepage');
      }

      // Update About
      if (aboutData) {
        await pb.collection('About').update(aboutData.id, {
          About_Description: aboutDescription,
          Expertise_Description: expertiseDescription,
          Client_List_Json: clientList,
          Contact_Email: contactEmail
        });
        clearCache('About');
      }

      // Update Settings
      if (settingsData) {
        await pb.collection('Settings').update(settingsData.id, {
          Show_Top_Progress_Bar: showTopProgressBar,
          Mobile_Font_Size: mobileFontSize,
          Tablet_Font_Size: tabletFontSize,
          Desktop_Font_Size: desktopFontSize,
          Large_Desktop_Font_Size: largeDesktopFontSize
        });
        clearCache('Settings');
      }

      onClose();
    } catch (err: any) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed right-0 top-0 h-full w-3/4 md:w-1/2 bg-black/85 backdrop-blur-xl border-l border-zinc-700/50 shadow-2xl z-50 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ fontFamily: 'EnduroWeb, sans-serif' }}
          >
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="p-8 border-b border-zinc-700/50 flex items-center gap-4">
                {/* Header Text */}
                <div className="flex-1">
                  <h2 className="text-xl font-medium text-white tracking-tight">
                    Settings
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1 tracking-wide uppercase">
                    Configure site content
                  </p>
                </div>

                {/* Favicon Avatar */}
                <div
                  onClick={() => faviconFileInputRef.current?.click()}
                  className="flex-shrink-0 w-12 h-12 rounded-sm bg-white/10 border border-zinc-700/50 hover:border-white/30 cursor-pointer transition-all overflow-hidden group"
                  title="Click to update favicon"
                >
                  {faviconUrl ? (
                    <img
                      src={faviconUrl}
                      alt="Favicon"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 group-hover:text-zinc-400 transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={faviconFileInputRef}
                  type="file"
                  accept="image/png,image/x-icon,image/svg+xml"
                  onChange={handleFaviconUpdate}
                  className="hidden"
                />
              </div>

              {/* Content */}
              <div className="p-8 space-y-8">
                {/* Hero Section */}
                <div>
                  <h3 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">Hero Section</h3>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                      Hero Title
                    </label>
                    <input
                      type="text"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-black/30 border border-zinc-700/50 text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 placeholder-zinc-600 text-sm transition-all"
                      placeholder="Creative Strategy and Communication"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-700/50"></div>

                {/* About Section */}
                <div>
                  <h3 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">About Section</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                        About Description
                      </label>
                      <textarea
                        value={aboutDescription}
                        onChange={(e) => setAboutDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-black/30 border border-zinc-700/50 text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 placeholder-zinc-600 text-sm transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                        Expertise Description
                      </label>
                      <textarea
                        value={expertiseDescription}
                        onChange={(e) => setExpertiseDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-black/30 border border-zinc-700/50 text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 placeholder-zinc-600 text-sm transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-3 uppercase tracking-wider">
                        Client List
                      </label>

                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newClient}
                          onChange={(e) => setNewClient(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddClient())}
                          className="flex-1 px-4 py-2.5 bg-black/30 border border-zinc-700/50 text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 placeholder-zinc-600 text-sm transition-all"
                          placeholder="e.g., NIKE"
                        />
                        <button
                          type="button"
                          onClick={handleAddClient}
                          className="px-6 py-3 bg-white text-black rounded-sm text-sm hover:bg-zinc-100 font-medium transition-all uppercase tracking-wide"
                        >
                          Add
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {clientList.map((client, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 text-zinc-300 rounded-sm text-xs border border-zinc-700/50"
                          >
                            {client}
                            <button
                              type="button"
                              onClick={() => handleRemoveClient(idx)}
                              className="text-red-400 hover:text-red-300 text-sm transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-700/50"></div>

                {/* Global Settings */}
                <div>
                  <h3 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">Global Settings</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-black/30 border border-zinc-700/50 text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 placeholder-zinc-600 text-sm transition-all"
                        placeholder="hello@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                        Font Sizes (rem)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Mobile</label>
                          <input
                            type="number"
                            step="0.125"
                            value={mobileFontSize}
                            onChange={(e) => setMobileFontSize(parseFloat(e.target.value))}
                            className="w-full px-2 py-3 bg-black/30 border border-zinc-700/50 text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 placeholder-zinc-600 text-sm transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Tablet</label>
                          <input
                            type="number"
                            step="0.125"
                            value={tabletFontSize}
                            onChange={(e) => setTabletFontSize(parseFloat(e.target.value))}
                            className="w-full px-2 py-3 bg-black/30 border border-zinc-700/50 text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 placeholder-zinc-600 text-sm transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Desktop</label>
                          <input
                            type="number"
                            step="0.125"
                            value={desktopFontSize}
                            onChange={(e) => setDesktopFontSize(parseFloat(e.target.value))}
                            className="w-full px-2 py-3 bg-black/30 border border-zinc-700/50 text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 placeholder-zinc-600 text-sm transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Large</label>
                          <input
                            type="number"
                            step="0.125"
                            value={largeDesktopFontSize}
                            onChange={(e) => setLargeDesktopFontSize(parseFloat(e.target.value))}
                            className="w-full px-2 py-3 bg-black/30 border border-zinc-700/50 text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 placeholder-zinc-600 text-sm transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showTopProgressBar}
                          onChange={(e) => setShowTopProgressBar(e.target.checked)}
                          className="w-4 h-4 bg-black/30 border border-zinc-700/50 rounded-sm text-white focus:ring-1 focus:ring-white/20"
                        />
                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                          Show Top Progress Bar
                        </span>
                      </label>
                      <p className="text-xs text-zinc-600 mt-1 ml-7">
                        Display progress bar at top of carousel
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-zinc-700/50 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-black/30 border border-zinc-700/50 text-zinc-300 rounded-sm text-sm hover:bg-black/50 hover:text-white hover:border-zinc-600/50 font-medium transition-all uppercase tracking-wide"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-white text-black rounded-sm text-sm hover:bg-zinc-100 transition-all font-medium tracking-wide uppercase disabled:bg-zinc-600 disabled:text-zinc-400"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
