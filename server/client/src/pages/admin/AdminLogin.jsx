import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import Icon from '../../components/common/Icon.jsx';
import * as api from '../../services/api.js';

export default function AdminLogin() {
  const { login, notify, nav } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.loginAdmin({
        username: username.trim(),
        password
      });

      if (response?.token && response?.user) {
        login(response.user, response.token);
        notify(`Welcome back, ${response.user.name || 'Administrator'}!`);
      } else {
        setError('Unexpected authentication response from server.');
      }
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setUsername('admin');
    setPassword('ThirumalaAdmin@2026');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[var(--teal)]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[var(--coral)]/15 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Hospital Brand Card */}
        <div className="card p-6 sm:p-9 bg-[var(--surface)] shadow-soft border border-ui rounded-3xl">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0f5d5e] to-[#1d7373] text-white mx-auto flex items-center justify-center shadow-md mb-4">
              <span className="font-display font-black text-2xl tracking-tighter">ST</span>
            </div>

            <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--teal)] uppercase">
              Argon2id Secured Session
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-main mt-1">
              Admin Portal
            </h1>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              Sri Thirumala Rehabilitation Centre & Nursing Home Clinical Management
            </p>
          </div>

          {error && (
            <div className="mt-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
              <Icon name="alert-circle" size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="block text-xs font-bold text-main mb-1.5">Admin Username</span>
              <div className="relative">
                <Icon name="user" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  required
                  type="text"
                  autoComplete="username"
                  className="input pl-10 text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                />
              </div>
            </label>

            <label className="block">
              <span className="block text-xs font-bold text-main mb-1.5">Password</span>
              <div className="relative">
                <Icon name="lock" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="input pl-10 pr-10 text-sm font-mono"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main cursor-pointer p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} size={15} />
                </button>
              </div>
            </label>

            <button
              disabled={loading}
              type="submit"
              className="btn-primary w-full justify-center !py-3 text-sm font-bold shadow-md cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Icon name="loader-2" size={16} className="animate-spin" />
                  <span>Verifying Argon2id Hash…</span>
                </>
              ) : (
                <>
                  <Icon name="log-in" size={16} />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Demo Helper */}
          <div className="mt-6 pt-5 border-t border-ui flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={fillDemo}
              className="text-[11px] text-[var(--teal)] hover:underline font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <Icon name="key" size={12} />
              <span>Fill Default Credentials (admin / ThirumalaAdmin@2026)</span>
            </button>

            <button
              type="button"
              onClick={() => nav('/')}
              className="text-xs text-muted hover:text-main transition cursor-pointer flex items-center gap-1 mt-1"
            >
              <Icon name="arrow-left" size={13} />
              <span>Return to Public Website</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
