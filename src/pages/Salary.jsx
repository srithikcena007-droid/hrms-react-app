import React, { useState, useContext, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { SalaryContext } from '../context/SalaryContext';
import { generatePayslip } from '../utils/generatePayslip';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const fmt = (n) => `₹ ${Number(n).toLocaleString('en-IN')}`;

/* ── Salary breakdown cards (4 coloured boxes) ── */
const SalaryBreakdown = ({ config }) => (
  <div className="salary-breakdown-grid">
    <div className="salary-breakdown-card blue">
      <p className="sbc-label">Base Salary</p>
      <p className="sbc-value blue">{fmt(config.base)}</p>
    </div>
    <div className="salary-breakdown-card green">
      <p className="sbc-label">Allowances</p>
      <p className="sbc-value green">{fmt(config.allowances)}</p>
    </div>
    <div className="salary-breakdown-card red">
      <p className="sbc-label">Deductions</p>
      <p className="sbc-value red">{fmt(config.deductions)}</p>
    </div>
    <div className="salary-breakdown-card purple">
      <p className="sbc-label">Net Salary</p>
      <p className="sbc-value purple">{fmt(config.net)}</p>
    </div>
  </div>
);

/* ── Payment history table (employee/admin/superadmin own view) ── */
const PaymentHistoryTable = ({ payments, onDownload }) => (
  payments.length === 0 ? (
    <div className="salary-empty-state">
      <i className="ri-money-dollar-circle-line" />
      <p>No payment records found</p>
    </div>
  ) : (
    <div className="salary-table-wrap">
      <table className="salary-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Year</th>
            <th>Amount Paid</th>
            <th>Payment Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(row => (
            <tr key={row.id}>
              <td>{row.month}</td>
              <td>{row.year}</td>
              <td>{fmt(row.amountPaid)}</td>
              <td>{row.paymentDate}</td>
              <td>
                <button
                  className="salary-payslip-btn"
                  onClick={() => onDownload(row)}
                >
                  <i className="ri-download-2-line" /> Payslip
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
);

/* ── All payments table (superadmin view) ── */
const AllPaymentsTable = ({ payments, onDownload }) => (
  payments.length === 0 ? (
    <div className="salary-empty-state">
      <i className="ri-money-dollar-circle-line" />
      <p>No payment records found</p>
    </div>
  ) : (
    <div className="salary-table-wrap">
      <table className="salary-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Month</th>
            <th>Year</th>
            <th>Amount Paid</th>
            <th>Payment Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(row => (
            <tr key={row.id}>
              <td>
                <div className="salary-emp-cell">
                  <span className="salary-emp-name">{row.userName}</span>
                  <span className="salary-emp-code">{row.empCode}</span>
                </div>
              </td>
              <td>{row.month}</td>
              <td>{row.year}</td>
              <td>{fmt(row.amountPaid)}</td>
              <td>{row.paymentDate}</td>
              <td>
                <button className="salary-payslip-btn" onClick={() => onDownload(row)}>
                  <i className="ri-download-2-line" /> Payslip
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
);

/* ── Add Payment Modal ── */
const AddPaymentModal = ({ onClose, onAdd }) => {
  const { ALL_USERS } = useContext(SalaryContext);
  
  const [selectedUserId, setSelectedUserId] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [paymentDate, setPaymentDate] = useState('');
  
  // Salary Components
  const [basic, setBasic] = useState('0');
  const [hra, setHra] = useState('0');
  const [conveyance, setConveyance] = useState('0');
  const [specialAllowance, setSpecialAllowance] = useState('0');
  const [pf, setPf] = useState('0');
  const [tds, setTds] = useState('0');
  const [professionalTax, setProfessionalTax] = useState('0');
  const [lopAmount, setLopAmount] = useState('0');

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  // Dynamic user from ALL_USERS (fetched from DB)
  const selectedUser = ALL_USERS.find(u => u.id === selectedUserId);

  // Calculate totals
  const totalEarnings = Number(basic) + Number(hra) + Number(conveyance) + Number(specialAllowance);
  const totalDeductions = Number(pf) + Number(tds) + Number(professionalTax) + Number(lopAmount);
  const netSalary = totalEarnings - totalDeductions;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser || !month || !paymentDate) return;
    
    onAdd({
      userId: selectedUser.id,
      month,
      year,
      paymentDate,
      amountPaid: netSalary,
      basic,
      hra,
      conveyance,
      specialAllowance,
      pf,
      tds,
      professionalTax,
      lopAmount
    });
  };

  return (
    <div className="salary-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="salary-modal" style={{ maxWidth: '600px' }}>
        <div className="salary-modal-header">
          <div>
            <h3 className="salary-modal-title">Add Salary Payment</h3>
            <p className="salary-modal-sub">Record a salary payment and generate payslip</p>
          </div>
          <button className="salary-modal-close" onClick={onClose}><i className="ri-close-line" /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
          {/* Employee Dropdown */}
          <div className="salary-field">
            <label className="salary-field-label">Employee <span className="salary-required">*</span></label>
            <div className="salary-custom-select" ref={dropRef}>
              <button
                type="button"
                className="salary-select-trigger"
                onClick={() => setDropdownOpen(o => !o)}
              >
                <span style={{ color: selectedUser ? '#2B3674' : '#A3AED0' }}>
                  {selectedUser ? `${selectedUser.name} (${selectedUser.empCode})` : 'Select employee'}
                </span>
                <i className={`ri-arrow-${dropdownOpen ? 'up' : 'down'}-s-line`} />
              </button>
              {dropdownOpen && (
                <div className="salary-dropdown-list">
                  {ALL_USERS.map(u => (
                    <div
                      key={u.id}
                      className={`salary-dropdown-item${selectedUserId === u.id ? ' selected' : ''}`}
                      onClick={() => { setSelectedUserId(u.id); setDropdownOpen(false); }}
                    >
                      {u.name} ({u.empCode})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="salary-field-row">
            <div className="salary-field">
              <label className="salary-field-label">Month <span className="salary-required">*</span></label>
              <select className="salary-input" value={month} onChange={e => setMonth(e.target.value)} required>
                <option value="">Select month</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="salary-field">
              <label className="salary-field-label">Year <span className="salary-required">*</span></label>
              <input className="salary-input" type="number" value={year} onChange={e => setYear(e.target.value)} min="2000" required />
            </div>
          </div>

          <div className="salary-field">
            <label className="salary-field-label">Payment Date <span className="salary-required">*</span></label>
            <input className="salary-input" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} required />
          </div>

          <h4 style={{ margin: '1.5rem 0 1rem', color: 'var(--primary)' }}>Earnings</h4>
          <div className="salary-field-row">
            <div className="salary-field">
              <label className="salary-field-label">Basic</label>
              <input className="salary-input" type="number" value={basic} onChange={e => setBasic(e.target.value)} min="0" />
            </div>
            <div className="salary-field">
              <label className="salary-field-label">HRA</label>
              <input className="salary-input" type="number" value={hra} onChange={e => setHra(e.target.value)} min="0" />
            </div>
          </div>
          <div className="salary-field-row">
            <div className="salary-field">
              <label className="salary-field-label">Conveyance</label>
              <input className="salary-input" type="number" value={conveyance} onChange={e => setConveyance(e.target.value)} min="0" />
            </div>
            <div className="salary-field">
              <label className="salary-field-label">Special Allowance</label>
              <input className="salary-input" type="number" value={specialAllowance} onChange={e => setSpecialAllowance(e.target.value)} min="0" />
            </div>
          </div>

          <h4 style={{ margin: '1.5rem 0 1rem', color: '#EE5D50' }}>Deductions</h4>
          <div className="salary-field-row">
            <div className="salary-field">
              <label className="salary-field-label">PF Amount</label>
              <input className="salary-input" type="number" value={pf} onChange={e => setPf(e.target.value)} min="0" />
            </div>
            <div className="salary-field">
              <label className="salary-field-label">TDS</label>
              <input className="salary-input" type="number" value={tds} onChange={e => setTds(e.target.value)} min="0" />
            </div>
          </div>
          <div className="salary-field-row">
            <div className="salary-field">
              <label className="salary-field-label">Professional Tax</label>
              <input className="salary-input" type="number" value={professionalTax} onChange={e => setProfessionalTax(e.target.value)} min="0" />
            </div>
            <div className="salary-field">
              <label className="salary-field-label">LOP Amount</label>
              <input className="salary-input" type="number" value={lopAmount} onChange={e => setLopAmount(e.target.value)} min="0" />
            </div>
          </div>

          <div style={{ background: '#F8F9FC', padding: '1.25rem', borderRadius: '12px', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>Net Salary</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{fmt(netSalary)}</span>
          </div>

          <div className="salary-modal-actions" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="salary-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="salary-submit-btn">
              Add Payment &amp; Generate Payslip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Toast notification ── */
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="salary-toast">
      <i className="ri-checkbox-circle-fill" />
      <span>{message}</span>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   Main Salary Page
══════════════════════════════════════════════════════ */
const Salary = () => {
  const { user } = useContext(AuthContext);
  const { getUserPayments, getAllPayments, addPayment } = useContext(SalaryContext);

  const isSuperAdmin = user?.role === 'superadmin';
  // superadmin gets two tabs; others only see own payslips
  const [activeTab, setActiveTab] = useState('myPayslips');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const myPayments = user ? getUserPayments(user.id) : [];
  const allPayments = getAllPayments();
  const myConfig = user && myPayments.length > 0 ? myPayments[0] : null;

  const handleDownload = (row) => {
    generatePayslip(row);
    setToast(`Generating payslip for ${row.userName} – ${row.month} ${row.year}`);
  };

  const handleAddPayment = async (data) => {
    const res = await addPayment(data);
    if (res.success) {
      setShowModal(false);
      setToast(`Salary payment added!`);
    } else {
      setToast(`Error: ${res.message}`);
    }
  };

  return (
    <Layout title="Salary & Payroll">
      {/* ── Page header row ── */}
      <div className="salary-page-header">
        <div>
          <h2 className="salary-page-title">Salary &amp; Payroll</h2>
          <p className="salary-page-sub">
            {isSuperAdmin
              ? 'Manage salary payments and generate payslips'
              : 'View your salary information and download payslips'}
          </p>
        </div>
        {isSuperAdmin && (
          <button className="salary-add-btn" onClick={() => setShowModal(true)}>
            <i className="ri-add-line" /> Add Payment
          </button>
        )}
      </div>

      {/* ── Superadmin tab bar ── */}
      {isSuperAdmin && (
        <div className="salary-tabs">
          <button
            className={`salary-tab-btn${activeTab === 'myPayslips' ? ' active' : ''}`}
            onClick={() => setActiveTab('myPayslips')}
          >
            <i className="ri-user-line" /> My Payslips
          </button>
          <button
            className={`salary-tab-btn${activeTab === 'allPayments' ? ' active' : ''}`}
            onClick={() => setActiveTab('allPayments')}
          >
            <i className="ri-group-line" /> All Payments
          </button>
        </div>
      )}

      {/* ── My Payslips view (all roles) ── */}
      {activeTab === 'myPayslips' && (
        <>
          {myConfig && (
            <div className="salary-section-card">
              <div className="salary-section-header">
                <div>
                  <h3 className="salary-section-title">Latest Salary Details</h3>
                  <p className="salary-section-sub">Your latest salary breakdown</p>
                </div>
              </div>
              <SalaryBreakdown config={{
                base: myConfig.basic || 0,
                allowances: Number(myConfig.hra || 0) + Number(myConfig.conveyance || 0) + Number(myConfig.specialAllowance || 0),
                deductions: Number(myConfig.pf || 0) + Number(myConfig.tds || 0) + Number(myConfig.professionalTax || 0) + Number(myConfig.lopAmount || 0),
                net: myConfig.amountPaid || 0
              }} />
            </div>
          )}

          <div className="salary-section-card" style={{ marginTop: '1.5rem' }}>
            <div className="salary-section-header">
              <div>
                <h3 className="salary-section-title">Payment History</h3>
                <p className="salary-section-sub">Your salary payment records and payslips</p>
              </div>
            </div>
            <PaymentHistoryTable payments={myPayments} onDownload={handleDownload} />
          </div>
        </>
      )}

      {/* ── All Payments view (superadmin only) ── */}
      {activeTab === 'allPayments' && isSuperAdmin && (
        <div className="salary-section-card">
          <div className="salary-section-header">
            <div>
              <h3 className="salary-section-title">All Salary Payments</h3>
              <p className="salary-section-sub">View all salary payments made to employees</p>
            </div>
          </div>
          <AllPaymentsTable payments={allPayments} onDownload={handleDownload} />
        </div>
      )}

      {/* ── Add Payment Modal ── */}
      {showModal && (
        <AddPaymentModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddPayment}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </Layout>
  );
};

export default Salary;
