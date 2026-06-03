import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const menuItems = [
    { path: '/', name: 'Dashboard', icon: 'ri-dashboard-line', roles: ['superadmin', 'admin', 'employee'] },
    { path: '/attendance', name: 'Attendance', icon: 'ri-calendar-check-line', roles: ['superadmin', 'admin', 'employee'] },
    { path: '/leave', name: 'Leave', icon: 'ri-flight-takeoff-line', roles: ['superadmin', 'admin', 'employee'] },
    { path: '/inbox', name: 'Inbox', icon: 'ri-mail-line', roles: ['superadmin', 'admin', 'employee'] },
    { path: '/employees', name: 'Employees', icon: 'ri-group-line', roles: ['superadmin', 'admin'] },
    { path: '/salary', name: 'Salary', icon: 'ri-wallet-3-line', roles: ['superadmin', 'admin', 'employee'] },
    { path: '/performance', name: 'Performance', icon: 'ri-line-chart-line', roles: ['superadmin', 'admin', 'employee'] },
    { path: '/reports', name: 'Reports', icon: 'ri-file-chart-line', roles: ['superadmin', 'admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <svg width="30" height="30" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 2.5L29 9.25V22.75L17 29.5L5 22.75V9.25L17 2.5Z" stroke="#2B3674" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M17 2.5V16L29 9.25" stroke="#2B3674" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M5 9.25L17 16V29.5" stroke="#2B3674" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M5 22.75L17 16L29 22.75" stroke="#2B3674" strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="17" cy="16" r="3" fill="#00A884" />
        </svg>
        <span style={{ fontSize: '1.45rem', fontWeight: 700, color: '#2B3674', letterSpacing: '-0.5px', marginLeft: '0.25rem' }}>Spatio</span>
      </div>
      <div className="sidebar-menu">
        {filteredMenu.map(item => (
          <NavLink 
            to={item.path} 
            className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
            key={item.path}
          >
            <i className={item.icon}></i>
            {item.name}
          </NavLink>
        ))}
      </div>

    </div>
  );
};

export default Sidebar;
