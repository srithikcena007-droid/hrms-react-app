import React, { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

const EmployeeModal = ({ onClose, onSave, initialData, user }) => {
  const isEditing = !!initialData?.id;
  const [empCode, setEmpCode] = useState(initialData?.emp_code || '');
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [department, setDepartment] = useState(initialData?.department || '');
  const [designation, setDesignation] = useState(initialData?.designation || '');
  const [dateOfJoining, setDateOfJoining] = useState(initialData?.date_of_joining || '');
  const [role, setRole] = useState(initialData?.role || 'employee');
  const [status, setStatus] = useState(initialData?.status || 'Active');
  const [managedDepartment, setManagedDepartment] = useState(initialData?.managed_department || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!empCode || !name || !email || !department || !role || !designation || !dateOfJoining) return;
    setIsSubmitting(true);
    await onSave({
      id: initialData?.id,
      emp_code: empCode,
      name,
      email,
      department,
      designation,
      date_of_joining: dateOfJoining,
      role,
      status,
      managed_department: role === 'admin' ? managedDepartment : null
    });
    setIsSubmitting(false);
  };

  return (
    <div className="salary-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="salary-modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="salary-modal-header">
          <div>
            <h3 className="salary-modal-title">{isEditing ? 'Edit Employee' : 'Add New Employee'}</h3>
            <p className="salary-modal-sub">Enter employee details below</p>
          </div>
          <button className="salary-modal-close" onClick={onClose}><i className="ri-close-line" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="salary-field">
            <label className="salary-field-label">EMP Code (e.g. STS001) <span className="salary-required">*</span></label>
            <input className="salary-input" value={empCode} onChange={e => setEmpCode(e.target.value)} required disabled={isEditing} />
          </div>
          <div className="salary-field">
            <label className="salary-field-label">Name <span className="salary-required">*</span></label>
            <input className="salary-input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="salary-field">
            <label className="salary-field-label">Email <span className="salary-required">*</span></label>
            <input className="salary-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="salary-field">
            <label className="salary-field-label">Department <span className="salary-required">*</span></label>
            <select className="salary-input" value={department} onChange={e => setDepartment(e.target.value)} required disabled={isEditing && user?.role === 'admin'}>
              <option value="">-- Select Department --</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Operations">Operations</option>
              <option value="Sales">Sales</option>
            </select>
          </div>
          <div className="salary-field">
            <label className="salary-field-label">Designation <span className="salary-required">*</span></label>
            <input className="salary-input" value={designation} onChange={e => setDesignation(e.target.value)} required />
          </div>
          <div className="salary-field">
            <label className="salary-field-label">Date of Joining <span className="salary-required">*</span></label>
            <input className="salary-input" type="date" value={dateOfJoining} onChange={e => setDateOfJoining(e.target.value)} required />
          </div>
          <div className="salary-field">
            <label className="salary-field-label">Role <span className="salary-required">*</span></label>
            <select className="salary-input" value={role} onChange={e => setRole(e.target.value)} required>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>

          {role === 'admin' && (
            <div className="salary-field">
              <label className="salary-field-label">Managed Department (For Admin) <span className="salary-required">*</span></label>
              <select className="salary-input" value={managedDepartment} onChange={e => setManagedDepartment(e.target.value)} required>
                <option value="">-- Select Department --</option>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
          )}

          <div className="salary-field">
            <label className="salary-field-label">Status <span className="salary-required">*</span></label>
            <select className="salary-input" value={status} onChange={e => setStatus(e.target.value)} required>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
          <div className="salary-modal-actions">
            <button type="button" className="salary-cancel-btn" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="salary-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Employee')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Employees = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'employee') return <Navigate to="/" replace />;

  const fetchEmployees = async () => {
    setLoading(true);
    let query = supabase.from('employees').select('*').order('created_at', { ascending: false });
    
    // RBAC: Admins can only view employees in their managed department
    if (user.role === 'admin') {
      if (user.managed_department) {
        query = query.eq('department', user.managed_department);
      } else {
        // If an admin has no managed_department assigned, they see no one
        query = query.eq('id', '00000000-0000-0000-0000-000000000000'); 
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching employees:', error);
    } else {
      setEmployees(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, [user]);

  const handleSaveEmployee = async (employeeData) => {
    const { id, ...dataToSave } = employeeData;
    
    if (id) {
      // Edit mode
      const { error } = await supabase.from('employees').update(dataToSave).eq('id', id);
      if (error) {
        alert('Error updating employee: ' + error.message);
      } else {
        fetchEmployees();
        setShowModal(false);
        setEditingEmployee(null);
      }
    } else {
      // Add mode
      // Default password to '123' for test accounts or handle properly later
      const insertData = { ...dataToSave, password: '123' }; 
      const { data: newEmployee, error } = await supabase.from('employees').insert([insertData]).select();
      if (error) {
        alert('Error adding employee: ' + error.message);
      } else {
        if (newEmployee && newEmployee.length > 0) {
          const empId = newEmployee[0].id;
          await supabase.from('leave_balances').insert([{
            employee_id: empId,
            sick_leave: 12,
            casual_leave: 12,
            comp_off: 0
          }]);
        }
        fetchEmployees();
        setShowModal(false);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) {
        alert("Error deleting employee: " + error.message);
      } else {
        fetchEmployees();
      }
    }
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setShowModal(true);
  };

  const generateNextEmpCode = () => {
    if (!employees || employees.length === 0) return 'STS001';
    const codes = employees
      .map(emp => emp.emp_code)
      .filter(code => code && typeof code === 'string')
      .map(code => {
        const match = code.match(/[a-zA-Z]+(\d+)/);
        return match ? parseInt(match[1], 10) : NaN;
      })
      .filter(num => !isNaN(num));
    
    if (codes.length === 0) return 'STS001';
    const maxCode = Math.max(...codes);
    return `STS${String(maxCode + 1).padStart(3, '0')}`;
  };

  const openAddModal = () => {
    setEditingEmployee({ emp_code: generateNextEmpCode() });
    setShowModal(true);
  };

  return (
    <Layout title="Employees">
      <div className="card mb-6">
        <div className="flex justify-between items-center">
          <div className="input-group" style={{ margin: 0, flexDirection: 'row', alignItems: 'center', width: '300px' }}>
            <i className="ri-search-line text-muted absolute ml-3"></i>
            <input type="text" placeholder="Search employees..." style={{ paddingLeft: '2.5rem', width: '100%' }} />
          </div>
          {user.role === 'superadmin' && (
            <button className="btn" onClick={openAddModal}><i className="ri-user-add-line"></i> Add Employee</button>
          )}
        </div>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
              {user.role === 'superadmin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading employees...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>No employees found.</td></tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.emp_code}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.875rem' }}>{emp.name.charAt(0)}</div>
                    <span className="font-bold">{emp.name}</span>
                  </div>
                </td>
                <td>{emp.department}</td>
                <td>{emp.role} {emp.role === 'admin' && emp.managed_department ? `(${emp.managed_department})` : ''}</td>
                <td>
                  <span className={`badge ${emp.status === 'Active' ? 'success' : 'warning'}`}>{emp.status}</span>
                </td>
                {user.role === 'superadmin' && (
                  <td>
                    <div className="flex gap-2">
                      <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => openEditModal(emp)}><i className="ri-pencil-line"></i></button>
                      <button className="icon-btn" style={{ width: 32, height: 32, color: 'var(--danger)' }} onClick={() => handleDelete(emp.id)}><i className="ri-delete-bin-line"></i></button>
                    </div>
                  </td>
                )}
              </tr>
            )))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <EmployeeModal
          initialData={editingEmployee}
          user={user}
          onClose={() => {
            setShowModal(false);
            setEditingEmployee(null);
          }}
          onSave={handleSaveEmployee}
        />
      )}
    </Layout>
  );
};

export default Employees;
