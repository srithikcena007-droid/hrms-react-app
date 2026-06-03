import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logoWithText from '../assets/logo-with-text.png';

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
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '1rem 0' }}>
        <img src={logoWithText} alt="Spatio Logo" style={{ height: '42px', objectFit: 'contain' }} />
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
