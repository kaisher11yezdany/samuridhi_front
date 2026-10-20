import axios from 'axios';

const BASE = '/api';
const token = () => localStorage.getItem('token');
const h = () => ({ Authorization: `Bearer ${token()}` });

// Auth
export const login = (username, password) => axios.post(`${BASE}/auth/login`, { username, password });
export const getMe = () => axios.get(`${BASE}/auth/me`, { headers: h() });

// Dashboard
export const getDashboard = () => axios.get(`${BASE}/dashboard`, { headers: h() });

// Customers
export const getCustomers    = ()       => axios.get(`${BASE}/customers`,    { headers: h() });
export const getCustomerStats= ()       => axios.get(`${BASE}/customers/stats`, { headers: h() });
export const createCustomer  = (data)   => axios.post(`${BASE}/customers`,   data, { headers: h() });
export const updateCustomer  = (id, d)  => axios.put(`${BASE}/customers/${id}`, d, { headers: h() });
export const deleteCustomer  = (id)     => axios.delete(`${BASE}/customers/${id}`, { headers: h() });
export const createCustomerAppLogin = (data) => axios.post(`${BASE}/customer-auth/register`, data, { headers: h() });

// Projects
export const getProjects     = ()       => axios.get(`${BASE}/projects`,     { headers: h() });
export const createProject   = (data)   => axios.post(`${BASE}/projects`,    data, { headers: h() });
export const updateProject   = (id, d)  => axios.put(`${BASE}/projects/${id}`, d, { headers: h() });
export const deleteProject   = (id)     => axios.delete(`${BASE}/projects/${id}`, { headers: h() });

// Sites
export const getSites        = ()       => axios.get(`${BASE}/sites`,        { headers: h() });
export const createSite      = (data)   => axios.post(`${BASE}/sites`,       data, { headers: h() });
export const updateSite      = (id, d)  => axios.put(`${BASE}/sites/${id}`,  d, { headers: h() });
export const deleteSite      = (id)     => axios.delete(`${BASE}/sites/${id}`, { headers: h() });

// Elevators
export const getElevators    = ()       => axios.get(`${BASE}/elevators`,    { headers: h() });
export const getElevatorStats= ()       => axios.get(`${BASE}/elevators/stats`, { headers: h() });
export const createElevator  = (data)   => axios.post(`${BASE}/elevators`,   data, { headers: h() });
export const updateElevator  = (id, d)  => axios.put(`${BASE}/elevators/${id}`, d, { headers: h() });

// Technicians
export const getTechnicians  = ()       => axios.get(`${BASE}/technicians`,  { headers: h() });
export const createTechnician= (data)   => axios.post(`${BASE}/technicians`, data, { headers: h() });
export const updateTechnician= (id, d)  => axios.put(`${BASE}/technicians/${id}`, d, { headers: h() });
export const deleteTechnician= (id)     => axios.delete(`${BASE}/technicians/${id}`, { headers: h() });

// Breakdown
export const getBreakdowns   = ()       => axios.get(`${BASE}/breakdowns`,   { headers: h() });
export const createBreakdown = (data)   => axios.post(`${BASE}/breakdowns`,  data, { headers: h() });
export const updateBreakdown = (id, d)  => axios.put(`${BASE}/breakdowns/${id}`, d, { headers: h() });

// Maintenance
export const getMaintenance  = ()       => axios.get(`${BASE}/maintenance`,  { headers: h() });
export const createMaintenance=(data)   => axios.post(`${BASE}/maintenance`, data, { headers: h() });
export const updateMaintenance=(id, d)  => axios.put(`${BASE}/maintenance/${id}`, d, { headers: h() });

// Installation
export const getInstallations= ()       => axios.get(`${BASE}/installations`,{ headers: h() });
export const createInstallation=(data)  => axios.post(`${BASE}/installations`,data, { headers: h() });
export const updateInstallation=(id, d) => axios.put(`${BASE}/installations/${id}`, d, { headers: h() });

// Survey
export const getSurveys      = ()       => axios.get(`${BASE}/survey`,       { headers: h() });
export const createSurvey    = (data)   => axios.post(`${BASE}/survey`,      data, { headers: h() });
export const updateSurvey    = (id, d)  => axios.put(`${BASE}/survey/${id}`, d, { headers: h() });

// Procurement
export const getProcurement  = ()       => axios.get(`${BASE}/procurement`,  { headers: h() });
export const createPO        = (data)   => axios.post(`${BASE}/procurement`, data, { headers: h() });
export const updatePO        = (id, d)  => axios.put(`${BASE}/procurement/${id}`, d, { headers: h() });

// QA
export const getQARecords    = ()       => axios.get(`${BASE}/qa`,           { headers: h() });
export const createQARecord  = (data)   => axios.post(`${BASE}/qa`,         data, { headers: h() });
export const updateQARecord  = (id, d)  => axios.put(`${BASE}/qa/${id}`,    d, { headers: h() });

// Handover
export const getHandovers    = ()       => axios.get(`${BASE}/handover`,     { headers: h() });
export const createHandover  = (data)   => axios.post(`${BASE}/handover`,   data, { headers: h() });
export const updateHandover  = (id, d)  => axios.put(`${BASE}/handover/${id}`, d, { headers: h() });

// Documents
export const getDocuments    = (params) => axios.get(`${BASE}/documents`,    { headers: h(), params });
export const createDocument  = (data)   => axios.post(`${BASE}/documents`,  data, { headers: { ...h(), 'Content-Type': 'multipart/form-data' } });
export const updateDocument  = (id, d)  => axios.put(`${BASE}/documents/${id}`, d, { headers: h() });
export const deleteDocument  = (id)     => axios.delete(`${BASE}/documents/${id}`, { headers: h() });

// Approvals
export const getApprovals    = (params) => axios.get(`${BASE}/approvals`,    { headers: h(), params });
export const updateApproval  = (id, d)  => axios.put(`${BASE}/approvals/${id}`, d, { headers: h() });

// Audit Logs
export const getAuditLogs    = (params) => axios.get(`${BASE}/auditlogs`,    { headers: h(), params });

// Notifications
export const getNotifications     = ()   => axios.get(`${BASE}/notifications`,    { headers: h() });
export const getUnreadCount       = ()   => axios.get(`${BASE}/notifications/unread-count`, { headers: h() });
export const markNotificationRead = (id) => axios.put(`${BASE}/notifications/${id}/read`, {}, { headers: h() });
export const markAllRead          = ()   => axios.put(`${BASE}/notifications/mark-all-read`, {}, { headers: h() });

// Spare Parts
export const getSpareParts   = ()       => axios.get(`${BASE}/spareparts`,   { headers: h() });
export const createSparePart = (data)   => axios.post(`${BASE}/spareparts`,  data, { headers: h() });
export const updateSparePart = (id, d)  => axios.put(`${BASE}/spareparts/${id}`, d, { headers: h() });

// Warranty
export const getWarranty     = ()       => axios.get(`${BASE}/warranty`,     { headers: h() });
export const createWarranty  = (data)   => axios.post(`${BASE}/warranty`,    data, { headers: h() });
export const updateWarranty  = (id, d)  => axios.put(`${BASE}/warranty/${id}`, d, { headers: h() });

// Testing
export const getTesting        = ()     => axios.get(`${BASE}/testing`,      { headers: h() });
export const getTestingRecords = getTesting;
export const createTestingRecord=(data) => axios.post(`${BASE}/testing`,     data, { headers: h() });
export const updateTestingRecord=(id,d) => axios.put(`${BASE}/testing/${id}`, d, { headers: h() });

// Reports
export const getReportsSummary = ()     => axios.get(`${BASE}/reports/summary`, { headers: h() });

// Users
export const getUsers        = ()       => axios.get(`${BASE}/users`,        { headers: h() });
export const createUser      = (data)   => axios.post(`${BASE}/users`,       data, { headers: h() });
export const updateUser      = (id, d)  => axios.put(`${BASE}/users/${id}`,  d, { headers: h() });
export const deleteUser      = (id)     => axios.delete(`${BASE}/users/${id}`, { headers: h() });

// Settings
export const getSettings     = ()       => axios.get(`${BASE}/settings`,     { headers: h() });
export const updateSettings  = (data)   => axios.put(`${BASE}/settings`,     data, { headers: h() });

// Roles
export const getRoles        = ()       => axios.get(`${BASE}/roles`,        { headers: h() });
export const createRole      = (data)   => axios.post(`${BASE}/roles`,       data, { headers: h() });
export const updateRole      = (id, d)  => axios.put(`${BASE}/roles/${id}`,  d, { headers: h() });
export const deleteRole      = (id)     => axios.delete(`${BASE}/roles/${id}`, { headers: h() });
export const assignRoleToUser= (userId, roleId) => axios.post(`${BASE}/roles/assign-user`, { userId, roleId }, { headers: h() });

// Assign users to a record
export const assignUsers = (module, id, userIds) =>
  axios.post(`${BASE}/${module}/${id}/assign`, { userIds }, { headers: h() });
