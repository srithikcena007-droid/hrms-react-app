import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';

const Reports = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'employee') return <Navigate to="/" replace />;

  return (
    <Layout title="Reports">
      <div className="grid grid-cols-3 gap-6">
        {[
          { title: 'Monthly Attendance', desc: 'Detailed view of employee attendance for this month.', icon: 'ri-calendar-line', color: 'primary' },
          { title: 'Payroll Summary', desc: 'Financial breakdown of salary processing.', icon: 'ri-wallet-3-line', color: 'success' },
          { title: 'Leave Analysis', desc: 'Patterns of employee leaves and balances.', icon: 'ri-flight-takeoff-line', color: 'warning' },
          { title: 'Performance Metrics', desc: 'Department-wise performance aggregation.', icon: 'ri-line-chart-line', color: 'danger' }
        ].map((report, i) => (
          <div key={i} className="card flex-col items-center text-center">
            <div className={`stat-icon ${report.color}`} style={{ width: 64, height: 64, fontSize: '2rem', marginBottom: '1rem' }}>
              <i className={report.icon}></i>
            </div>
            <h3 className="font-bold mb-2">{report.title}</h3>
            <p className="text-sm text-muted mb-4">{report.desc}</p>
            <button className="btn btn-outline w-full mt-auto">Generate Report</button>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Reports;
