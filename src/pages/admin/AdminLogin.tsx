import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import pb from '../../config/pocketbase';
import loginBackground from '../../assets/admin-login-bg.jpg';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if already authenticated
  useEffect(() => {
    if (pb.authStore.isValid) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

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
    <motion.div
      className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 relative overflow-hidden"
      style={{ fontFamily: 'EnduroWeb, sans-serif' }}
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${loginBackground})`,
          filter: 'blur(8px)',
          transform: 'scale(1.1)'
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Login Form */}
      <div className="max-w-md w-full bg-black/80 rounded-sm border border-zinc-800/50 p-10 backdrop-blur-xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-xl font-medium text-white tracking-tight">
            Admin Login
          </h1>
          <p className="text-xs text-zinc-500 mt-2 tracking-wide uppercase">
            Access Dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 placeholder-zinc-600 text-sm transition-all"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 placeholder-zinc-600 text-sm transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-950/20 border border-red-800/30 text-red-200 px-4 py-3 rounded-sm text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2.5 bg-black/30 border border-zinc-700/50 text-zinc-300 rounded-sm hover:bg-black/50 hover:text-white hover:border-zinc-600/50 disabled:bg-zinc-600 disabled:text-zinc-500 disabled:cursor-not-allowed transition-all text-sm uppercase tracking-wide"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-xs text-zinc-500 hover:text-white transition-colors uppercase tracking-wide"
          >
            ← Back to Portfolio
          </a>
        </div>
      </div>
    </motion.div>
  );
}
