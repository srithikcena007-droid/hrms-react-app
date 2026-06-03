import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(user?.id || '');
  
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [leaveRecords, setLeaveRecords] = useState({});
  
  const [loading, setLoading] = useState(false);
  const [selectedDateDetails, setSelectedDateDetails] = useState(null); // for modal

  // Month Navigation
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Fetch employees for Admin / Superadmin
  useEffect(() => {
    if (!user) return;
    const fetchEmployees = async () => {
      let query = supabase.from('employees').select('id, name');
      if (user.role === 'admin') {
        query = query.eq('department', user.managed_department || '');
      } else if (user.role === 'employee') {
        // Employees don't need the list
        return;
      }
      const { data } = await query;
      if (data) setEmployees(data);
    };
    if (user.role !== 'employee') fetchEmployees();
  }, [user]);

  // Ensure default selected employee is set when list loads
  useEffect(() => {
    if (user?.role !== 'employee' && employees.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(user.id);
    } else if (user?.role === 'employee' && user?.id) {
      setSelectedEmployeeId(user.id);
    }
  }, [employees, user]);

  // Fetch Data for the month
  useEffect(() => {
    if (!selectedEmployeeId) return;
    
    const fetchData = async () => {
      setLoading(true);
      
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth(); // 0-indexed
      
      // Get first and last day of month strings for filtering
      const firstDayDate = new Date(year, month, 1);
      const lastDayDate = new Date(year, month + 1, 0);
      
      // Convert to local YYYY-MM-DD
      const offset1 = firstDayDate.getTimezoneOffset() * 60000;
      const firstDay = new Date(firstDayDate.getTime() - offset1).toISOString().split('T')[0];
      
      const offset2 = lastDayDate.getTimezoneOffset() * 60000;
      const lastDay = new Date(lastDayDate.getTime() - offset2).toISOString().split('T')[0];
      
      // Fetch attendance & daily reports
      const { data: attData } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', selectedEmployeeId)
        .gte('date', firstDay)
        .lte('date', lastDay);
        
      const { data: repData } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('employee_id', selectedEmployeeId)
        .gte('date', firstDay)
        .lte('date', lastDay);
        
      // Fetch approved leaves
      const { data: leavesData } = await supabase
        .from('leaves')
        .select('*')
        .eq('employee_id', selectedEmployeeId)
        .eq('status', 'Approved'); 
        
      // Process Attendance
      const attMap = {};
      (attData || []).forEach(att => {
        const rep = (repData || []).find(r => r.date === att.date);
        
        // Late logic: Check-in after 10:00 AM
        let isLate = false;
        if (att.check_in) {
          const timeMatch = att.check_in.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (timeMatch) {
            let h = parseInt(timeMatch[1]);
            let m = parseInt(timeMatch[2]);
            let ampm = timeMatch[3].toUpperCase();
            if (ampm === 'PM' && h !== 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            
            if (h > 10 || (h === 10 && m > 0)) {
              isLate = true;
            }
          }
        }
        
        attMap[att.date] = {
          ...att,
          bos_report: rep?.bos_report || '-',
          eod_report: rep?.eod_report || '-',
          isLate
        };
      });
      
      // Process Leaves
      const leaveMap = {};
      (leavesData || []).forEach(lv => {
        const d1 = new Date(lv.from_date);
        const d2 = new Date(lv.to_date);
        for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
          const iso = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          leaveMap[iso] = lv;
        }
      });
      
      setAttendanceRecords(attMap);
      setLeaveRecords(leaveMap);
      setLoading(false);
    };
    
    fetchData();
  }, [selectedEmployeeId, currentMonth]);

  // Calendar rendering logic
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handleDayClick = (dateStr) => {
    const att = attendanceRecords[dateStr];
    const lv = leaveRecords[dateStr];
    
    if (att || lv) {
      setSelectedDateDetails({ date: dateStr, att, lv });
    }
  };

  return (
    <Layout title="Live Attendance List">
      <div className="card mb-6 flex flex-col gap-4">
        {/* Header Controls */}
        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div className="flex items-center gap-4">
            <button onClick={handlePrevMonth} style={{ padding: '0.5rem', background: '#F1F5F9', borderRadius: 8, color: '#64748B' }}>
              <i className="ri-arrow-left-s-line text-xl" />
            </button>
            <h3 className="font-bold text-lg min-w-[150px] text-center" style={{ color: 'var(--text-main)' }}>
              {monthNames[month]} {year}
            </h3>
            <button onClick={handleNextMonth} style={{ padding: '0.5rem', background: '#F1F5F9', borderRadius: 8, color: '#64748B' }}>
              <i className="ri-arrow-right-s-line text-xl" />
            </button>
          </div>

          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-muted">Filter Employee:</span>
              <select 
                className="salary-input m-0" 
                style={{ minWidth: 200 }} 
                value={selectedEmployeeId} 
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
              >
                <option value={user.id}>Me ({user.name})</option>
                {employees.filter(e => e.id !== user.id).map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Calendar Grid */}
        <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#64748B', borderRight: i < 6 ? '1px solid #E2E8F0' : 'none' }}>
                {d}
              </div>
            ))}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {blanksArray.map(b => (
              <div key={`blank-${b}`} style={{ padding: '2rem', borderRight: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}></div>
            ))}
            
            {daysArray.map(d => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const att = attendanceRecords[dateStr];
              const lv = leaveRecords[dateStr];
              
              // Get today in YYYY-MM-DD local
              const todayDate = new Date();
              const todayOffset = todayDate.getTimezoneOffset() * 60000;
              const todayStr = new Date(todayDate.getTime() - todayOffset).toISOString().split('T')[0];
              
              const isToday = todayStr === dateStr;
              const isClickable = !!att || !!lv;
              
              let indicator = null;
              if (lv) {
                indicator = (
                  <div style={{ width: 28, height: 28, background: '#FEE2E2', color: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 2px 5px rgba(239,68,68,0.2)' }}>
                    L
                  </div>
                );
              } else if (att) {
                if (att.isLate) {
                  indicator = (
                    <div style={{ width: 28, height: 28, background: '#FEF08A', color: '#CA8A04', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 2px 5px rgba(202,138,4,0.2)' }}>
                      !
                    </div>
                  );
                } else {
                  indicator = (
                    <div style={{ width: 28, height: 28, background: '#D1FAE5', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 2px 5px rgba(16,185,129,0.2)' }}>
                      <i className="ri-check-line"></i>
                    </div>
                  );
                }
              }

              // Hide bottom border on last row optionally, but let's just keep it simple
              return (
                <div 
                  key={d} 
                  onClick={() => handleDayClick(dateStr)}
                  style={{ 
                    padding: '1rem', 
                    height: 100, 
                    borderRight: '1px solid #E2E8F0', 
                    borderBottom: '1px solid #E2E8F0', 
                    background: isToday ? '#EFF6FF' : 'white',
                    cursor: isClickable ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={(e) => {
                    if (isClickable && !isToday) e.currentTarget.style.background = '#F8FAFC';
                  }}
                  onMouseOut={(e) => {
                    if (isClickable && !isToday) e.currentTarget.style.background = 'white';
                  }}
                >
                  <span style={{ fontSize: '1.1rem', color: isToday ? '#3B82F6' : (new Date(year, month, d).getDay() === 0 ? '#EF4444' : '#1E293B'), fontWeight: isToday ? 'bold' : 'normal' }}>
                    {d}
                  </span>
                  {indicator}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Date Detail Modal */}
      {selectedDateDetails && (
        <div className="salary-modal-overlay" onClick={() => setSelectedDateDetails(null)}>
          <div className="salary-modal" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
            <div className="salary-modal-header">
              <div>
                <h3 className="salary-modal-title">Details for {new Date(selectedDateDetails.date).toDateString()}</h3>
              </div>
              <button className="salary-modal-close" onClick={() => setSelectedDateDetails(null)}><i className="ri-close-line" /></button>
            </div>
            <div style={{ padding: '0 0 1rem' }}>
              {selectedDateDetails.lv ? (
                <div style={{ background: '#FFF2F2', padding: '1rem', borderRadius: 8, borderLeft: '4px solid #EE5D50', marginBottom: '1rem' }}>
                  <h4 style={{ color: '#EE5D50', fontWeight: 'bold', marginBottom: '0.5rem' }}><i className="ri-calendar-event-line"></i> On Leave</h4>
                  <p style={{ fontSize: '0.9rem', color: '#1E293B', marginBottom: '0.25rem' }}><strong>Type:</strong> {selectedDateDetails.lv.type}</p>
                  <p style={{ fontSize: '0.9rem', color: '#1E293B' }}><strong>Reason:</strong> {selectedDateDetails.lv.reason || 'N/A'}</p>
                </div>
              ) : null}
              
              {selectedDateDetails.att ? (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 8 }}>
                      <p style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Check In</p>
                      <p style={{ fontSize: '1.1rem', color: '#1E293B', fontWeight: 'bold' }}>{selectedDateDetails.att.check_in || '-'}</p>
                      {selectedDateDetails.att.isLate && (
                        <span style={{ fontSize: '0.75rem', color: '#D97706', background: '#FEF3C7', padding: '2px 6px', borderRadius: 4, fontWeight: 'bold' }}>LATE</span>
                      )}
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 8 }}>
                      <p style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Check Out</p>
                      <p style={{ fontSize: '1.1rem', color: '#1E293B', fontWeight: 'bold' }}>{selectedDateDetails.att.check_out || '-'}</p>
                    </div>
                  </div>
                  
                  <div style={{ background: '#F0F9FF', padding: '1rem', borderRadius: 8, marginBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#0369A1', fontWeight: 600, marginBottom: '0.25rem' }}>BOS Report</p>
                    <p style={{ fontSize: '0.9rem', color: '#1E293B' }}>{selectedDateDetails.att.bos_report || 'Not submitted'}</p>
                  </div>
                  
                  <div style={{ background: '#F0FDF4', padding: '1rem', borderRadius: 8 }}>
                    <p style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600, marginBottom: '0.25rem' }}>EOD Report</p>
                    <p style={{ fontSize: '0.9rem', color: '#1E293B' }}>{selectedDateDetails.att.eod_report || 'Not submitted'}</p>
                  </div>
                </div>
              ) : !selectedDateDetails.lv ? (
                <p style={{ color: '#64748B' }}>No attendance record found for this day.</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Attendance;
