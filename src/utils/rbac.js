// src/utils/rbac.js

/**
 * Returns an array of departments the user is allowed to manage.
 * Useful for Supabase .in('department', getManagedDepartments(user)) queries.
 */
export const getManagedDepartments = (user) => {
  if (!user || !user.managed_department) return [];
  
  if (user.role === 'admin') {
    if (user.managed_department === 'Operations') {
      return ['Operations', 'Design', 'Development'];
    }
    return [user.managed_department];
  }
  
  if (user.role === 'manager') {
    return user.managed_department.split(',').map(d => d.trim()).filter(Boolean);
  }
  
  return [];
};

/**
 * Checks if a specific department is managed by the user.
 * Useful for Array.prototype.filter logic.
 */
export const isDepartmentManagedBy = (empDept, user) => {
  if (!user) return false;
  if (user.role === 'superadmin' || user.role === 'head') return true;
  if (user.role === 'admin' || user.role === 'manager') {
    const allowed = getManagedDepartments(user);
    return allowed.includes(empDept);
  }
  return false;
};
/**
 * Checks if an employee is managed by the user.
 * It checks both department matching and the explicit reports_to field.
 */
export const isEmployeeManagedBy = (emp, user) => {
  if (!user || !emp) return false;
  if (user.role === 'superadmin' || user.role === 'head') return true;
  if (user.role === 'admin' || user.role === 'manager') {
    // If the employee explicitly reports to this user
    if (emp.reports_to === user.id) return true;
    
    // Otherwise, check if they are in a managed department
    const allowed = getManagedDepartments(user);
    return allowed.includes(emp.department);
  }
  return false;
};
