import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Check user role after login to navigate accordingly
      const token = localStorage.getItem('algura_token');
      if (token) {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (data.data?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Image Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1400"
          alt="Luxury interior"
          className="w-full h-full object-cover scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-primary/20" />
        <div className="absolute bottom-16 left-16 right-16 text-white">
          <Link to="/" className="text-3xl font-headline font-extrabold tracking-tighter text-white mb-8 block">
            ALGURA
          </Link>
          <h2 className="text-4xl font-bold tracking-tighter mb-4 leading-tight">
            Welcome back to <br />
            <span className="italic font-light">exceptional design.</span>
          </h2>
          <p className="text-white/50 text-sm max-w-md leading-relaxed">
            Sign in to access your account, track orders, and discover exclusive collections.
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-surface px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-10">
            <Link to="/" className="text-2xl font-headline font-extrabold tracking-tighter text-gradient">
              ALGURA
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-extrabold tracking-tighter mb-3">Sign In</h1>
            <p className="text-on-surface-variant text-sm">
              Welcome back. Enter your credentials to continue.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 text-sm mb-6 rounded-xl"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="input-premium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-premium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-on-surface-variant text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:text-primary-container transition-colors">
                Create Account
              </Link>
            </p>
          </div>

          {/* Admin hint */}
          <div className="mt-10 p-5 bg-surface-container-low border border-outline-variant/15 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center">
                <Shield size={14} className="text-tertiary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Admin Access</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Admin users will be redirected to the dashboard upon login.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link to="/" className="text-xs text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest font-bold inline-flex items-center gap-2">
              <ArrowRight size={12} className="rotate-180" /> Back to Store
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
