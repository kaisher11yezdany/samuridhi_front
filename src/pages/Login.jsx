import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'white',
      overflow: 'hidden',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>

      {/* ── Left: orange blob ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Gradient blob circle */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '-10%',
          transform: 'translateY(-50%)',
          width: '90vmin',
          height: '90vmin',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f5a623 0%, #FF6B35 60%, #e8452c 100%)',
          boxShadow: '0 20px 60px rgba(255,107,53,0.35)',
        }} />

        {/* Brand text over blob */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '6%',
          transform: 'translateY(-50%)',
          color: 'white',
          zIndex: 1,
          maxWidth: '55%',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <img
              src="/samrudhya_elevator_logo.png"
              alt=""
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', background: 'rgba(255,255,255,0.3)', padding: 4 }}
              onError={e => {
                e.target.style.display = 'none';
              }}
            />
            <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.3px' }}>
              Samrudhya Elevators
            </span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            fontWeight: 700,
            lineHeight: 1.25,
            margin: 0,
            textShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            Welcome to the<br />Elevator Management<br />Platform!
          </h2>
        </div>
      </div>

      {/* ── Right: form ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 3rem',
        background: 'white',
      }}>
        {/* Avatar */}
        <div style={{
          width: 80, height: 80,
          borderRadius: '50%',
          background: '#e8eaf0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" fill="#b0b8cc" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#b0b8cc" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.75rem', fontWeight: 500 }}>
          Login below to get started.
        </p>

        {error && (
          <div style={{
            width: '100%', maxWidth: 340,
            background: '#fff0f0', color: '#dc2626',
            padding: '0.65rem 1rem', borderRadius: 12,
            fontSize: '0.82rem', marginBottom: '1rem', textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 340 }}>

          {/* Username field */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            background: '#f3f4f8',
            borderRadius: 50,
            padding: '0.7rem 1.2rem',
            marginBottom: '0.9rem',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <rect x="2" y="4" width="20" height="16" rx="3" stroke="#b0b8cc" strokeWidth="1.8" fill="none" />
              <path d="M2 8l10 7 10-7" stroke="#b0b8cc" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </svg>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              style={{
                border: 'none', background: 'none', outline: 'none',
                fontSize: '0.9rem', color: '#333', width: '100%',
              }}
            />
          </div>

          {/* Password field */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            background: '#f3f4f8',
            borderRadius: 50,
            padding: '0.7rem 1.2rem',
            marginBottom: '0.75rem',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="#b0b8cc" strokeWidth="1.8" fill="none" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#b0b8cc" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </svg>
            <input
              type="password"
              placeholder="Your Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                border: 'none', background: 'none', outline: 'none',
                fontSize: '0.9rem', color: '#333', width: '100%',
              }}
            />
          </div>

          {/* Remember me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingLeft: '0.25rem' }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              style={{ width: 14, height: 14, accentColor: '#FF6B35', cursor: 'pointer' }}
            />
            <label htmlFor="rememberMe" style={{ fontSize: '0.84rem', color: '#9ca3af', cursor: 'pointer' }}>
              Keep me logged in
            </label>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: loading ? '#ffb89a' : 'linear-gradient(135deg, #f5a623 0%, #FF6B35 50%, #e8452c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 50,
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.3px',
              boxShadow: '0 6px 20px rgba(255,107,53,0.35)',
              transition: 'opacity 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          >
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

      </div>
    </div>
  );
}
