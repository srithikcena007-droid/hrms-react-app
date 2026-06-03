import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

const Inbox = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
      setLoading(true);
      const { data } = await supabase
        .from('inbox')
        .select('*, sender:sender_id(name)')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });
      setMessages(data || []);
      setLoading(false);
    };
    fetchMessages();
  }, [user]);

  const markRead = async (id) => {
    await supabase.from('inbox').update({ is_read: true }).eq('id', id);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now - d;
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH} hour${diffH > 1 ? 's' : ''} ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return 'Yesterday';
    return d.toLocaleDateString();
  };

  return (
    <Layout title="Inbox">
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Recent Messages</h3>
          <button className="btn btn-outline"><i className="ri-pencil-line"></i> Compose</button>
        </div>
        <div className="flex-col">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No messages found.</p>
          ) : messages.map((msg) => (
            <div
              key={msg.id}
              className="flex items-center justify-between p-4"
              style={{
                borderBottom: '1px solid var(--border)',
                background: !msg.is_read ? 'rgba(67, 24, 255, 0.03)' : 'transparent',
                cursor: 'pointer'
              }}
              onClick={() => markRead(msg.id)}
            >
              <div className="flex items-center gap-4">
                <div className="avatar" style={{
                  width: 48, height: 48,
                  background: !msg.is_read ? 'var(--primary)' : 'var(--secondary)',
                  color: !msg.is_read ? 'white' : 'var(--text-main)'
                }}>
                  <i className="ri-mail-line"></i>
                </div>
                <div>
                  <h4 className="font-bold" style={{ color: !msg.is_read ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {msg.sender?.name || 'System'}
                  </h4>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-main)', fontWeight: !msg.is_read ? 600 : 400 }}>
                    {msg.subject}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!msg.is_read && (
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--primary)', display: 'inline-block'
                  }} />
                )}
                <span className="text-xs text-muted">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Inbox;
