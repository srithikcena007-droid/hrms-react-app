import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '../utils/supabaseClient';
import { isEmployeeManagedBy } from '../utils/rbac';

export const LeaveContext = createContext();

function calcDays(from, to) {
  const d1 = new Date(from);
  const d2 = new Date(to);
  const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 1;
}

export const LeaveProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchLeaveData = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch leaves with employee details
    const { data: leavesData, error: leavesError } = await supabase
      .from('leaves')
      .select(`
        *,
        employees (
          name,
          role,
          department
        )
      `)
      .order('created_at', { ascending: false });

    if (!leavesError && leavesData) {
      setRequests(leavesData);
    }

    // Fetch balances (only for current user normally, but admins/superadmins might need others)
    // For simplicity, we fetch all balances if admin/superadmin, or just own if employee.
    let balanceQuery = supabase.from('leave_balances').select('*');
    if (user.role === 'employee') {
      balanceQuery = balanceQuery.eq('employee_id', user.id);
    }
    
    const { data: balanceData, error: balanceError } = await balanceQuery;
    
    if (!balanceError && balanceData) {
      const balMap = {};
      balanceData.forEach(b => {
        balMap[b.employee_id] = {
          'Sick Leave': b.sick_leave,
          'Casual Leave': b.casual_leave,
          'Comp Off': b.comp_off
        };
      });
      setBalances(balMap);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchLeaveData();
  }, [user]);

  // Apply for leave
  const applyLeave = async ({ type, from, to, reason, days }) => {
    if (!user) return;
    const isAutoApproved = user.role === 'superadmin';
    const status = isAutoApproved ? 'Approved' : 'Pending';

    const { error } = await supabase.from('leaves').insert([{
      employee_id: user.id,
      type,
      from_date: from,
      to_date: to,
      days,
      reason,
      status
    }]);

    if (!error) {
      if (isAutoApproved) {
        await deductBalance(user.id, type, days);
      } else {
        await fetchLeaveData();
      }
    } else {
      console.error('Error applying leave:', error);
    }
  };

  // Update a pending leave request
  const updateLeave = async ({ id, type, from, to, reason, days }) => {
    if (!user) return;
    const { error } = await supabase.from('leaves').update({
      type,
      from_date: from,
      to_date: to,
      days,
      reason
    }).eq('id', id).eq('employee_id', user.id);

    if (!error) {
      await fetchLeaveData();
    } else {
      console.error('Error updating leave:', error);
    }
  };

  // Approve a leave request (only superadmin)
  const approveLeave = async (requestId, employeeId, type, days) => {
    if (user?.role !== 'superadmin') return; // only superadmin can approve

    const { error } = await supabase.from('leaves')
      .update({ status: 'Approved' })
      .eq('id', requestId);

    if (!error) {
      await deductBalance(employeeId, type, days);
    }
  };

  // Reject a leave request (only superadmin)
  const rejectLeave = async (requestId, comment = '') => {
    if (user?.role !== 'superadmin') return;

    const { error } = await supabase.from('leaves')
      .update({ status: 'Rejected', rejection_comment: comment })
      .eq('id', requestId);

    if (!error) {
      await fetchLeaveData();
    }
  };

  // Grant Comp Off (Superadmin only)
  const grantCompOff = async (employeeId, daysToAdd) => {
    if (user?.role !== 'superadmin') return;

    const currentBal = balances[employeeId]?.['Comp Off'] || 0;
    const { error } = await supabase.from('leave_balances')
      .update({ comp_off: currentBal + daysToAdd })
      .eq('employee_id', employeeId);
      
    if (!error) {
      await fetchLeaveData();
    }
  };

  // Deduct days from balance directly in DB
  const deductBalance = async (employeeId, type, days) => {
    const dbColumnMap = {
      'Sick Leave': 'sick_leave',
      'Casual Leave': 'casual_leave',
      'Comp Off': 'comp_off'
    };
    const colName = dbColumnMap[type];
    if (!colName) {
      await fetchLeaveData();
      return;
    }

    const currentBal = balances[employeeId]?.[type] || 0;
    const { error } = await supabase.from('leave_balances')
      .update({ [colName]: Math.max(0, currentBal - days) })
      .eq('employee_id', employeeId);

    await fetchLeaveData();
  };

  // Get balance for a given user
  const getUserBalance = (userId) => {
    const bal = balances[userId] || { 'Sick Leave': 0, 'Comp Off': 0, 'Casual Leave': 0 };
    // Assuming 'bal' represents remaining days now because deductBalance decreases it in DB
    return {
      'Sick Leave': { remaining: bal['Sick Leave'] },
      'Comp Off': { remaining: bal['Comp Off'] },
      'Casual Leave': { remaining: bal['Casual Leave'] }
    };
  };

  // Get requests visible to current user
  const getMyRequests = () => {
    if (!user) return [];
    return requests.filter(r => r.employee_id === user.id);
  };

  // Pending requests that current user can view/approve
  const getPendingForApproval = () => {
    if (!user) return [];
    if (user.role === 'superadmin') {
      // Super admin sees all pending requests
      return requests.filter(r => r.status === 'Pending' && r.employee_id !== user.id);
    }
    if (user.role === 'admin' || user.role === 'manager') {
      return requests.filter(r => {
        if (r.employee_id === user.id) return false;
        return isEmployeeManagedBy(r.employees, user);
      });
    }
    return [];
  };

  // Get all leave history for admins/superadmins
  const getLeaveHistory = () => {
    if (!user) return [];
    if (user.role === 'superadmin' || user.role === 'head') {
      return requests;
    }
    if (user.role === 'admin' || user.role === 'manager') {
      return requests.filter(r => isEmployeeManagedBy(r.employees, user));
    }
    return [];
  };

  return (
    <LeaveContext.Provider value={{
      requests,
      applyLeave,
      updateLeave,
      approveLeave,
      rejectLeave,
      grantCompOff,
      getUserBalance,
      getMyRequests,
      getPendingForApproval,
      getLeaveHistory,
      loading
    }}>
      {children}
    </LeaveContext.Provider>
  );
};
