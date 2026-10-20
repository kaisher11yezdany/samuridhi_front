import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

import Login           from './pages/Login';
import Dashboard       from './pages/Dashboard';
import Customers       from './pages/Customers';
import Projects        from './pages/Projects';
import Elevators       from './pages/Elevators';
import Installation    from './pages/Installation';
import Maintenance     from './pages/Maintenance';
import Breakdown       from './pages/Breakdown';
import Technicians     from './pages/Technicians';
import Sites           from './pages/Sites';
import Testing         from './pages/Testing';
import Warranty        from './pages/Warranty';
import SpareParts      from './pages/SpareParts';
import Reports         from './pages/Reports';
import Settings        from './pages/Settings';
import Survey          from './pages/Survey';
import Procurement     from './pages/Procurement';
import QACommissioning from './pages/QACommissioning';
import Handover        from './pages/Handover';
import Documents       from './pages/Documents';
import Approvals       from './pages/Approvals';
import AuditLogs       from './pages/AuditLogs';
import Notifications   from './pages/Notifications';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', color:'#1e3a5f' }}>Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"     element={<Dashboard />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="customers"     element={<Customers />} />
        <Route path="projects"      element={<Projects />} />
        <Route path="elevators"     element={<Elevators />} />
        <Route path="sites"         element={<Sites />} />
        <Route path="survey"        element={<Survey />} />
        <Route path="installation"  element={<Installation />} />
        <Route path="procurement"   element={<Procurement />} />
        <Route path="qa"            element={<QACommissioning />} />
        <Route path="handover"      element={<Handover />} />
        <Route path="maintenance"   element={<Maintenance />} />
        <Route path="breakdown"     element={<Breakdown />} />
        <Route path="technicians"   element={<Technicians />} />
        <Route path="testing"       element={<Testing />} />
        <Route path="warranty"      element={<Warranty />} />
        <Route path="spareparts"    element={<SpareParts />} />
        <Route path="documents"     element={<Documents />} />
        <Route path="approvals"     element={<Approvals />} />
        <Route path="reports"       element={<Reports />} />
        <Route path="auditlogs"     element={<AuditLogs />} />
        <Route path="settings"      element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
