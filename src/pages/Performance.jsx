import React from 'react';
import Layout from '../components/Layout';

const Performance = () => {
  return (
    <Layout title="Performance">
      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold mb-4">Overall Rating</h3>
          <div className="flex items-center gap-6">
            <div style={{ width: 120, height: 120, borderRadius: '50%', border: '8px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>4.8</h2>
            </div>
            <div>
              <h4 className="font-bold text-lg">Excellent Performance!</h4>
              <p className="text-muted mt-2">You are in the top 10% of employees this quarter.</p>
            </div>
          </div>
        </div>
        <div className="card">
          <h3 className="font-bold mb-4">Recent Reviews</h3>
          <div className="flex-col gap-4">
            <div className="p-4" style={{ background: 'var(--secondary)', borderRadius: '10px' }}>
              <div className="flex justify-between">
                <span className="font-bold">Q3 Review</span>
                <span className="text-primary font-bold">5/5</span>
              </div>
              <p className="text-sm mt-2 text-muted">Great leadership skills shown in the recent project delivery.</p>
            </div>
            <div className="p-4" style={{ background: 'var(--secondary)', borderRadius: '10px' }}>
              <div className="flex justify-between">
                <span className="font-bold">Q2 Review</span>
                <span className="text-primary font-bold">4.5/5</span>
              </div>
              <p className="text-sm mt-2 text-muted">Solid performance, met all KPIs successfully.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Performance;
