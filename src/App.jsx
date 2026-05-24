import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }  from './context/AuthContext'
import ProtectedRoute    from './components/ProtectedRoute'
import Layout            from './components/Layout'
import PlaceholderPage   from './components/PlaceholderPage'

import Login          from './pages/Login'
import ChangePassword from './pages/ChangePassword'
import Dashboard      from './pages/Dashboard'
import Orders         from './pages/Orders'
import PrintWorkflow  from './pages/PrintWorkflow'
import Packaging      from './pages/Packaging'
import Settlements    from './pages/Settlements'
import Issues         from './pages/Issues'
import Performance    from './pages/Performance'
import Notifications  from './pages/Notifications'
import Settings       from './pages/Settings'

/* Placeholder pages (Phase 2) */
const Machines  = () => <PlaceholderPage title="Machine Management"  />
const Materials = () => <PlaceholderPage title="Material Inventory"  />
const Analytics = () => <PlaceholderPage title="Revenue Analytics"   />

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"           element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Protected */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index                  element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"      element={<Dashboard />} />
            <Route path="/orders"         element={<Orders />} />
            <Route path="/print"          element={<PrintWorkflow />} />
            <Route path="/packaging"      element={<Packaging />} />
            <Route path="/machines"       element={<Machines />} />
            <Route path="/materials"      element={<Materials />} />
            <Route path="/analytics"      element={<Analytics />} />
            <Route path="/settlements"    element={<Settlements />} />
            <Route path="/notifications"  element={<Notifications />} />
            <Route path="/performance"    element={<Performance />} />
            <Route path="/issues"         element={<Issues />} />
            <Route path="/settings"       element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
