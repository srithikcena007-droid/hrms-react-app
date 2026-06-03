import React, { useState, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';

const ResetPassword = () => {
  const { user, updatePassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  if (!user) return <Navigate to="/login" replace />;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentPassword !== user.password) {
      showToast('Current password is incorrect.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    const result = await updatePassword(newPassword);
    setLoading(false);

    if (result.success) {
      showToast('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/'), 1500);
    } else {
      showToast('Error: ' + result.message, 'error');
    }
  };

  return (
    <Layout title="Reset Password">
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="card">
          {/* Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'linear-gradient(135deg, #4318FF22, #4318FF11)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <i className="ri-lock-password-line" style={{ fontSize: '1.5rem', color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Change Password
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Updating password for <strong>{user.email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Current Password */}
            <div className="salary-field">
              <label className="salary-field-label">
                Current Password <span className="salary-required">*</span>
              </label>
              <input
                className="salary-input"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            {/* New Password */}
            <div className="salary-field">
              <label className="salary-field-label">
                New Password <span className="salary-required">*</span>
              </label>
              <input
                className="salary-input"
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm New Password */}
            <div className="salary-field">
              <label className="salary-field-label">
                Confirm New Password <span className="salary-required">*</span>
              </label>
              <input
                className="salary-input"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Strength hint */}
            {newPassword && (
              <div style={{
                padding: '0.6rem 0.9rem',
                borderRadius: 10,
                background: newPassword.length >= 8 ? '#F0FFF8' : '#FFF8F0',
                border: `1px solid ${newPassword.length >= 8 ? '#00A88433' : '#FFCE2033'}`,
                fontSize: '0.8rem',
                color: newPassword.length >= 8 ? '#00A884' : '#E57D3E',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <i className={newPassword.length >= 8 ? 'ri-shield-check-line' : 'ri-shield-line'} />
                {newPassword.length >= 8 ? 'Strong password' : 'Use 8+ characters for a stronger password'}
              </div>
            )}

            <div className="salary-modal-actions" style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                className="salary-cancel-btn"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="salary-submit-btn" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast.message && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          background: toast.type === 'error' ? '#FFF0F0' : '#F0FFF8',
          border: `1px solid ${toast.type === 'error' ? '#FFCDD2' : '#00A88433'}`,
          color: toast.type === 'error' ? '#C62828' : '#00A884',
          padding: '0.85rem 1.25rem', borderRadius: 14,
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontWeight: 600, fontSize: '0.9rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)', zIndex: 9999,
          animation: 'slideUp 0.3s ease'
        }}>
          <i className={toast.type === 'error' ? 'ri-error-warning-fill' : 'ri-checkbox-circle-fill'} />
          {toast.message}
        </div>
      )}
    </Layout>
  );
};

export default ResetPassword;
