import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SalaryProvider } from './context/SalaryContext';
import { LeaveProvider } from './context/LeaveContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import Inbox from './pages/Inbox';
import Salary from './pages/Salary';
import Performance from './pages/Performance';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import ResetPassword from './pages/ResetPassword';

const App = () => {
  return (
    <AuthProvider>
      <SalaryProvider>
        <LeaveProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/leave" element={<Leave />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/salary" element={<Salary />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </LeaveProvider>
      </SalaryProvider>
    </AuthProvider>
  );
};

export default App;
