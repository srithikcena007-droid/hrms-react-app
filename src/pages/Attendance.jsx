import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data: attData } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', user.id)
      .order('date', { ascending: false });
      
    const { data: reportData } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('employee_id', user.id);
      
    const merged = (attData || []).map(att => {
      const rep = (reportData || []).find(r => r.date === att.date);
      return {
        ...att,
        bos_report: rep?.bos_report || '-',
        eod_report: rep?.eod_report || '-'
      };
    });
    
    setRecords(merged);
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
  }, [user]);

  // Check-In and Check-Out actions have been moved to the Dashboard
  // to properly handle the BOS and EOD modal workflows.

  return (
    <Layout title="Attendance">
      <div className="card mb-6 flex justify-between items-center">
        <div>
          <h3 className="font-bold" style={{ fontSize: '1.25rem' }}>Today's Status</h3>
          <p className="text-muted mt-1">{new Date().toDateString()}</p>
        </div>
        <div className="flex gap-4">
          <button className="btn-outline-blue" onClick={() => navigate('/')}>
            Go to Dashboard to Check In/Out
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold mb-4">Attendance Log</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>BOS Report</th>
              <th>EOD Report</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>No records found.</td></tr>
            ) : records.map((row) => (
              <tr key={row.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{row.date}</td>
                <td>{row.check_in || '-'}</td>
                <td>{row.check_out || '-'}</td>
                <td style={{ maxWidth: '200px', whiteSpace: 'normal', fontSize: '0.875rem' }}>{row.bos_report}</td>
                <td style={{ maxWidth: '200px', whiteSpace: 'normal', fontSize: '0.875rem' }}>{row.eod_report}</td>
                <td>
                  <span className={`badge ${row.status === 'Present' ? 'success' : row.status === 'Absent' ? 'danger' : 'warning'}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Attendance;
