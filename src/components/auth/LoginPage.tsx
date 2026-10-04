import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { 
  GraduationCap, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError('Please provide both your assigned username and password.');
      return;
    }

    setLoading(true);
    const result = login(username.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Authentication failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-indigo-50/40 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800">
      {/* Brand & Emblem */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-sm ring-4 ring-indigo-100 mb-2">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Prime <span className="text-indigo-600">LMS</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Unified Academic &amp; Learning Management System
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-100/60 p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Portal Login</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in with the credentials assigned by your institution administrator.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your assigned username"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Quick Test Credentials
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setUsername('superadmin');
                setPassword('SuperAdmin@Omni2026!');
              }}
              className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-colors"
            >
              <div className="flex items-center gap-1 font-bold text-amber-900">
                <span>👑 Super Hidden Admin</span>
              </div>
              <p className="text-[10px] text-amber-700 font-mono mt-0.5">superadmin / SuperAdmin@Omni2026!</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('Admin@Prime2026!');
              }}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
            >
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <span>Regular Admin</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">admin / Admin@Prime2026!</p>
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed text-center pt-1">
            Need an account or password reset? <br />
            <span className="text-slate-600 font-medium">Please contact your Super Administrator.</span>
          </p>
        </div>
      </div>

      {/* Institutional Security Notice */}
      <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Role-Based Access Control • Grade &amp; Section Isolated</span>
      </div>
    </div>
  );
};
