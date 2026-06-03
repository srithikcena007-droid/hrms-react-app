import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export const SalaryContext = createContext();

export const SalaryProvider = ({ children }) => {
  const [payments, setPayments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Fetch employees and payments on mount
  useEffect(() => {
    fetchEmployees();
    fetchPayments();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('id, name, emp_code, role, email');
    if (!error && data) {
      // Map emp_code to empCode for compatibility
      const mapped = data.map(u => ({
        ...u,
        empCode: u.emp_code || u.id.slice(0, 8).toUpperCase()
      }));
      setAllUsers(mapped);
    }
  };

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from('salary_payments')
      .select(`
        *,
        employees (name, emp_code)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped = data.map(p => ({
        id: p.id,
        userId: p.employee_id,
        empCode: p.employees?.emp_code || p.employee_id.slice(0,8).toUpperCase(),
        userName: p.employees?.name || 'Unknown',
        month: p.month,
        year: String(p.year),
        amountPaid: p.amount_paid,
        paymentDate: p.payment_date,
        monthDays: p.month_days || 30,
        paidDays: p.paid_days || 30,
        lopDays: p.lop_days || 0,
        lopAmount: p.lop_amount || 0,
        // New fields
        basic: p.basic_amount || 0,
        hra: p.hra_amount || 0,
        conveyance: p.conveyance_amount || 0,
        specialAllowance: p.special_allowance || 0,
        pf: p.pf_amount || 0,
        tds: p.tds_amount || 0,
        professionalTax: p.professional_tax || 0
      }));
      setPayments(mapped);
    }
  };

  const addPayment = async (data) => {
    // Insert into DB
    const insertPayload = {
      employee_id: data.userId,
      month: data.month,
      year: parseInt(data.year),
      amount_paid: Number(data.amountPaid),
      payment_date: data.paymentDate, // Expecting YYYY-MM-DD for DB
      month_days: 30,
      paid_days: 30,
      lop_days: 0,
      lop_amount: Number(data.lopAmount || 0),
      basic_amount: Number(data.basic || 0),
      hra_amount: Number(data.hra || 0),
      conveyance_amount: Number(data.conveyance || 0),
      special_allowance: Number(data.specialAllowance || 0),
      pf_amount: Number(data.pf || 0),
      tds_amount: Number(data.tds || 0),
      professional_tax: Number(data.professionalTax || 0)
    };

    const { data: result, error } = await supabase
      .from('salary_payments')
      .insert([insertPayload])
      .select()
      .single();

    if (!error) {
      // Re-fetch to get joined employee data
      fetchPayments();
      return { success: true };
    } else {
      console.error('Error adding payment:', error);
      return { success: false, message: error.message };
    }
  };

  const getUserPayments = (userId) => payments.filter(p => p.userId === userId);
  const getAllPayments = () => payments;

  return (
    <SalaryContext.Provider value={{ payments, addPayment, getUserPayments, getAllPayments, ALL_USERS: allUsers }}>
      {children}
    </SalaryContext.Provider>
  );
};
