import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logoWithText from '../assets/logo-with-text.png';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  const handleFillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="login-container">
      {/* Left side: branding/photo pane */}
      <div className="login-left">
        <div className="login-left-content">
          <h1>Welcome to Spatio</h1>
          <p>Your comprehensive employee portal for attendance, leave management, and more</p>
        </div>
      </div>

      {/* Right side: Login pane */}
      <div className="login-right">
        <div className="login-form-container">
          {/* Logo */}
          <div className="login-logo-container" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src={logoWithText} alt="Spatio Logo" style={{ height: '48px', objectFit: 'contain' }} />
          </div>

          {/* Heading */}
          <div className="login-header">
            <h2>Hi, there!</h2>
            <p>Welcome to Spatio Portal</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 12,
              padding: '0.75rem 1rem', color: '#C62828', fontSize: '0.875rem',
              marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <i className="ri-error-warning-line" /> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className="login-input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="mail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="........"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Actions */}
            <div className="login-actions">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="/reset-password" className="login-forgot">
                Forgot Password?
              </a>
            </div>

            {/* Sign in button */}
            <button type="submit" className="btn-signin" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="demo-credentials-card">
            <div className="demo-title">Demo Credentials:</div>
            <div
              className="demo-item"
              onClick={() => handleFillCredentials('admin@spatio.com', 'admin123')}
              title="Click to auto-fill"
            >
              <div>
                <strong>Super Admin:</strong> admin@spatio.com / admin123
              </div>
              <span className="demo-click-badge">Click to fill</span>
            </div>
            <div
              className="demo-item"
              onClick={() => handleFillCredentials('manager@spatio.com', 'manager123')}
              title="Click to auto-fill"
            >
              <div>
                <strong>Manager:</strong> manager@spatio.com / manager123
              </div>
              <span className="demo-click-badge">Click to fill</span>
            </div>
            <div
              className="demo-item"
              onClick={() => handleFillCredentials('employee@spatio.com', 'employee123')}
              title="Click to auto-fill"
            >
              <div>
                <strong>Employee:</strong> employee@spatio.com / employee123
              </div>
              <span className="demo-click-badge">Click to fill</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
