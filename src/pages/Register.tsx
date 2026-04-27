import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserPlus, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const passwordChecks = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'Passwords match', met: formData.password === formData.password_confirmation && formData.password_confirmation.length > 0 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Image Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1400"
          alt="Modern furniture"
          className="w-full h-full object-cover scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-primary/20" />
        <div className="absolute bottom-16 left-16 right-16 text-white">
          <Link to="/" className="text-3xl font-headline font-extrabold tracking-tighter text-white mb-8 block">
            ALGURA
          </Link>
          <h2 className="text-4xl font-bold tracking-tighter mb-4 leading-tight">
            Join the world of <br />
            <span className="italic font-light">curated design.</span>
          </h2>
          <p className="text-white/50 text-sm max-w-md leading-relaxed">
            Create an account to save favorites, track orders, and get exclusive access to new collections.
          </p>
        </div>
      </div>

      {/* Right: Register Form */}
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
            <h1 className="text-3xl font-extrabold tracking-tighter mb-3">Create Account</h1>
            <p className="text-on-surface-variant text-sm">
              Join ALGURA to explore exclusive collections and more.
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
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => update('name', e.target.value)}
                required
                placeholder="John Doe"
                className="input-premium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2.5">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => update('email', e.target.value)}
                required
                placeholder="your@email.com"
                className="input-premium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2.5">
                Phone Number <span className="text-on-surface-variant/40">(Optional)</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="+63 917 123 4567"
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
                  value={formData.password}
                  onChange={e => update('password', e.target.value)}
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password_confirmation}
                onChange={e => update('password_confirmation', e.target.value)}
                required
                placeholder="••••••••"
                className="input-premium"
              />
            </div>

            {/* Password strength */}
            {formData.password.length > 0 && (
              <div className="space-y-2 bg-surface-container-low p-4 rounded-xl">
                {passwordChecks.map(check => (
                  <div key={check.label} className="flex items-center gap-2 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                      check.met ? 'bg-green-100' : 'bg-surface-container-high'
                    }`}>
                      <Check
                        size={12}
                        className={check.met ? 'text-green-600' : 'text-outline-variant'}
                      />
                    </div>
                    <span className={`transition-colors duration-300 ${check.met ? 'text-green-600 font-medium' : 'text-on-surface-variant'}`}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-on-surface-variant text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:text-primary-container transition-colors">
                Sign In
              </Link>
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
