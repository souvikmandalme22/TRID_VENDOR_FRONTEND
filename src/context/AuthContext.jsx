import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [vendor, setVendor]   = useState(null)
  const [loading, setLoading] = useState(true) // checking stored token on mount

  /* ── On mount: verify stored token ── */
  useEffect(() => {
    const token = localStorage.getItem('trid_token')
    if (!token) { setLoading(false); return }

    api.get('/auth/verify')
      .then(res => setVendor(res.data))
      .catch(() => localStorage.removeItem('trid_token'))
      .finally(() => setLoading(false))
  }, [])

  /* ── Login ── */
  const login = useCallback(async (vendorId, password) => {
    const res = await api.post('/auth/login', { vendor_id: vendorId, password })
    const { token, vendor: vendorData } = res.data
    localStorage.setItem('trid_token', token)
    setVendor(vendorData)
    return vendorData
  }, [])

  /* ── Logout ── */
  const logout = useCallback(() => {
    localStorage.removeItem('trid_token')
    setVendor(null)
  }, [])

  /* ── Change password ── */
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    await api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword })
  }, [])

  return (
    <AuthContext.Provider value={{ vendor, loading, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
