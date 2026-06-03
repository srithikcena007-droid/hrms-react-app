import React, { createContext, useState } from 'react';

export const SalaryContext = createContext();

// Extended salary config matching Payslip Template fields
export const SALARY_CONFIG = {
  1: { // superadmin — Sarah Admin EMP001
    empCode: 'EMP001',
    name: 'Sarah Admin',
    designation: 'Super Administrator',
    dateOfJoining: '01/04/2022',
    ctc: 1620000,
    basic: 60000,
    hra: 30000,
    cca: 5000,
    conveyance: 4000,
    specialAllowance: 21000,
    pf: 7200,
    esic: 0,
    tds: 5000,
    professionalTax: 200,
    loanRepayment: 0,
    totalEarnings: 120000,
    totalDeductions: 12400,
    net: 107600,
  },
  2: { // admin — John Manager EMP002
    empCode: 'EMP002',
    name: 'John Manager',
    designation: 'HR Manager',
    dateOfJoining: '15/06/2021',
    ctc: 1980000,
    basic: 75000,
    hra: 37500,
    cca: 5000,
    conveyance: 4500,
    specialAllowance: 28000,
    pf: 9000,
    esic: 0,
    tds: 8000,
    professionalTax: 200,
    loanRepayment: 0,
    totalEarnings: 150000,
    totalDeductions: 17200,
    net: 132800,
  },
  3: { // employee — Alice Johnson EMP003
    empCode: 'EMP003',
    name: 'Alice Johnson',
    designation: 'Software Engineer',
    dateOfJoining: '01/09/2024',
    ctc: 1260000,
    basic: 50000,
    hra: 25000,
    cca: 3000,
    conveyance: 3000,
    specialAllowance: 19000,
    pf: 6000,
    esic: 750,
    tds: 2000,
    professionalTax: 200,
    loanRepayment: 0,
    totalEarnings: 100000,
    totalDeductions: 8950,
    net: 91050,
  },
};

// All users list for superadmin dropdown
export const ALL_USERS = [
  { id: 1, name: 'Sarah Admin',   empCode: 'EMP001', role: 'superadmin' },
  { id: 2, name: 'John Manager',  empCode: 'EMP002', role: 'admin' },
  { id: 3, name: 'Alice Johnson', empCode: 'EMP003', role: 'employee' },
];

// Initial payment records
const INITIAL_PAYMENTS = [
  { id: 1, userId: 1, empCode: 'EMP001', userName: 'Sarah Admin',   month: 'March',     year: '2026', amountPaid: 107600, paymentDate: '31/03/2026', monthDays: 31, paidDays: 31, lopDays: 0, lopAmount: 0 },
  { id: 2, userId: 3, empCode: 'EMP003', userName: 'Alice Johnson', month: 'September', year: '2025', amountPaid: 91050,  paymentDate: '30/09/2025', monthDays: 30, paidDays: 30, lopDays: 0, lopAmount: 0 },
  { id: 3, userId: 3, empCode: 'EMP003', userName: 'Alice Johnson', month: 'August',    year: '2025', amountPaid: 91050,  paymentDate: '31/08/2025', monthDays: 31, paidDays: 31, lopDays: 0, lopAmount: 0 },
];

export const SalaryProvider = ({ children }) => {
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);

  const addPayment = (data) => {
    const newPayment = {
      id: Date.now(),
      ...data,
      amountPaid: Number(data.amountPaid),
      lopAmount: Number(data.lopAmount || 0),
    };
    setPayments(prev => [newPayment, ...prev]);
    return newPayment;
  };

  const getUserPayments = (userId) => payments.filter(p => p.userId === userId);
  const getAllPayments = () => payments;

  return (
    <SalaryContext.Provider value={{ payments, addPayment, getUserPayments, getAllPayments, SALARY_CONFIG, ALL_USERS }}>
      {children}
    </SalaryContext.Provider>
  );
};
