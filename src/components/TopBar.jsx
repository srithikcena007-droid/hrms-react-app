import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ title }) => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [localAvatar, setLocalAvatar] = useState(null);
  const [cropModal, setCropModal] = useState(null); // { objectUrl }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.avatar_url) setLocalAvatar(user.avatar_url);
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setCropModal({ objectUrl });
    setDropdownOpen(false);
    // reset input so same file can be selected again
    e.target.value = '';
  };

  const handleCropSave = async (objectUrl) => {
    setSaving(true);
    const img = new Image();
    img.onload = async () => {
      const SIZE = 240;
      const canvas = document.createElement('canvas');
      // Crop to a centered square
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      canvas.width = SIZE;
      canvas.height = SIZE;
      canvas.getContext('2d').drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);
      const base64Str = canvas.toDataURL('image/jpeg', 0.75);
      URL.revokeObjectURL(objectUrl);

      setLocalAvatar(base64Str);
      const { error } = await supabase.from('employees').update({ avatar_url: base64Str }).eq('id', user.id);
      if (!error) {
        updateUser({ avatar_url: base64Str });
      } else {
        console.error('Avatar save failed:', error.message);
        alert('Failed to save profile picture! Error: ' + error.message);
      }
      setCropModal(null);
      setSaving(false);
    };
    img.src = objectUrl;
  };

  return (
    <div className="topbar">
      <h1 className="page-title">{title}</h1>
      <div className="topbar-actions">
        <div className="icon-btn">
          <i className="ri-search-line"></i>
        </div>
        <div className="icon-btn" style={{ position: 'relative' }}>
          <i className="ri-notification-3-line"></i>
          <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%' }}></span>
        </div>

        <div className="user-profile" style={{ position: 'relative', cursor: 'pointer' }} ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="avatar" style={{ overflow: 'hidden' }}>
            {localAvatar ? (
              <img src={localAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.name?.charAt(0)
            )}
          </div>
          <div className="flex-col">
            <span className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>{user?.name}</span>
            <span className="text-xs text-muted" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
          <i className="ri-arrow-down-s-line text-muted ml-2"></i>

          {dropdownOpen && (
            <div style={{
              position: 'absolute', top: '120%', right: 0,
              background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              borderRadius: '10px', width: '190px', zIndex: 100, padding: '0.5rem 0'
            }}>
              <div
                style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
              >
                <i className="ri-image-edit-line"></i> Change Picture
              </div>
              <div
                style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => { setDropdownOpen(false); navigate('/reset-password'); }}
              >
                <i className="ri-lock-password-line"></i> Reset Password
              </div>
              <div style={{ height: 1, background: '#F1F5F9', margin: '0.25rem 0' }} />
              <div
                style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(238,93,80,0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => { setDropdownOpen(false); logout(); navigate('/login'); }}
              >
                <i className="ri-logout-box-r-line"></i> Logout
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Crop Preview Modal */}
      {cropModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
          }}
          onClick={(e) => { if (e.target === e.currentTarget) { URL.revokeObjectURL(cropModal.objectUrl); setCropModal(null); } }}
        >
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', maxWidth: 380, width: '90%', textAlign: 'center' }}>
            <h3 style={{ fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>Preview Profile Picture</h3>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>The image will be cropped to a circle. Looks good?</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <img
                src={cropModal.objectUrl}
                alt="Preview"
                style={{ width: 160, height: 160, borderRadius: '50%', objectFit: 'cover', border: '4px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: '1px solid #CBD5E1', background: 'white', cursor: 'pointer', color: '#64748B', fontWeight: 600 }}
                onClick={() => { URL.revokeObjectURL(cropModal.objectUrl); setCropModal(null); }}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: 'none', background: '#4318FF', cursor: 'pointer', color: 'white', fontWeight: 600 }}
                onClick={() => handleCropSave(cropModal.objectUrl)}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Set as Profile Picture'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;
