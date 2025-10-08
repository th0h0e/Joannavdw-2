import { useState, useEffect, useRef } from 'react';
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
  const isMountedRef = useRef(true);

  // Track component mount/unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Check if already authenticated
  useEffect(() => {
    if (pb.authStore.isValid) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isMountedRef.current) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Authenticate with PocketBase (automatically updates authStore)
      await pb.collection('users').authWithPassword(email, password);

      // Only navigate if still mounted
      if (isMountedRef.current) {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);

      // Only update state if still mounted
      if (isMountedRef.current) {
        const errorMsg = err?.response?.message || err?.message || 'Failed to login. Please check your credentials.';
        setError(errorMsg);
        setLoading(false);
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-neutral-900 flex items-center justify-center px-6 relative overflow-hidden"
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
      <div className="absolute inset-0 bg-black/70" />

      {/* Login Form */}
      <div className="max-w-md w-full bg-black/80 rounded-sm border border-neutral-800/60 p-10 backdrop-blur-xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-xl font-medium text-white tracking-tight">
            Admin Login
          </h1>
          <p className="text-xs text-neutral-400 mt-2 tracking-wide uppercase">
            Access Dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700/60 text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600 placeholder-neutral-500 text-sm transition-all"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-neutral-400 mb-2 uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-800/60 border border-neutral-700/60 text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-neutral-600 focus:border-neutral-600 placeholder-neutral-500 text-sm transition-all"
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
            className="w-full px-6 py-2.5 bg-black/30 border border-neutral-700/60 text-neutral-200 rounded-sm hover:bg-black/50 hover:text-white hover:border-neutral-600/60 disabled:bg-neutral-600 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all text-sm uppercase tracking-wide"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-xs text-neutral-400 hover:text-white transition-colors uppercase tracking-wide"
          >
            ← Back to Portfolio
          </a>
        </div>
      </div>
    </motion.div>
  );
}
