import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ title }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fileInputRef = useRef(null);
  
  const [localAvatar, setLocalAvatar] = useState(null);

  const dropdownRef = useRef(null);

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

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Resize image to max 200x200 before saving
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = async () => {
      const MAX = 200;
      const canvas = document.createElement('canvas');
      const scale = Math.min(MAX / img.width, MAX / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      const base64Str = canvas.toDataURL('image/jpeg', 0.7);
      URL.revokeObjectURL(objectUrl);
      setLocalAvatar(base64Str);

      const { error } = await supabase.from('employees').update({ avatar_url: base64Str }).eq('id', user.id);
      if (error) {
        console.error('Failed to update avatar. Make sure avatar_url column exists:', error.message);
      }
    };
    img.src = objectUrl;
    setDropdownOpen(false);
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
              position: 'absolute',
              top: '120%',
              right: 0,
              background: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              width: '180px',
              zIndex: 100,
              padding: '0.5rem 0'
            }}>
              <div 
                style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
              >
                <i className="ri-image-edit-line"></i> Change Picture
              </div>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleAvatarChange} 
              />
              <div 
                style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => { setDropdownOpen(false); navigate('/reset-password'); }}
              >
                <i className="ri-lock-password-line"></i> Reset Password
              </div>
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
    </div>
  );
};

export default TopBar;
