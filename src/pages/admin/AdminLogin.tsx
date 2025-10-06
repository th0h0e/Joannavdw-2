import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb, { getImageUrl } from '../../config/pocketbase';
import type { PortfolioProject } from '../../config/pocketbase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const navigate = useNavigate();

  // Check if already authenticated
  useEffect(() => {
    if (pb.authStore.isValid) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  // Fetch background image from Maria Bodil for Smart project
  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const projects = await pb.collection('Portfolio_Projects').getFullList<PortfolioProject>();
        const smartProject = projects.find(p => p.Title.includes('Maria Bodil for Smart'));

        if (smartProject && smartProject.Images && smartProject.Images.length >= 3) {
          // Get the 3rd image (index 2)
          const imageUrl = getImageUrl(smartProject, smartProject.Images[2]);
          setBackgroundImage(imageUrl);
        }
      } catch (err) {
        console.error('Error fetching background image:', err);
      }
    };

    fetchBackgroundImage();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authenticate with PocketBase (automatically updates authStore)
      const authData = await pb.collection('users').authWithPassword(email, password);

      // Log successful authentication (optional - for debugging)
      console.log('Authenticated user:', authData.record.id);
      console.log('Auth token:', pb.authStore.token);
      console.log('Auth valid:', pb.authStore.isValid);

      // Redirect to dashboard on success
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      // PocketBase returns detailed error messages
      setError(err?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6 relative overflow-hidden" style={{ fontFamily: 'EnduroWeb, sans-serif' }}>
      {/* Background Image */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            filter: 'blur(8px)',
            transform: 'scale(1.1)'
          }}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Login Form */}
      <div className="max-w-md w-full bg-black/80 rounded-lg border border-gray-800/50 p-10 backdrop-blur-xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-xl font-medium text-white tracking-tight">
            Admin Login
          </h1>
          <p className="text-xs text-gray-500 mt-2 tracking-wide uppercase">
            Access Dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600 placeholder-gray-600 text-sm transition-all"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600 placeholder-gray-600 text-sm transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-950/20 border border-red-800/30 text-red-200 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 bg-black/30 border border-gray-700/50 text-gray-300 rounded hover:bg-black/50 hover:text-white hover:border-gray-600/50 disabled:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed transition-all text-sm uppercase tracking-wide h-[48px] flex items-center justify-center"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-wide"
          >
            ← Back to Portfolio
          </a>
        </div>
      </div>
    </div>
  );
}
