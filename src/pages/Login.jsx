import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, Loader2, Lock, Hash } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate   = useNavigate()
  const { login }  = useAuth()

  const [vendorId,  setVendorId]  = useState('')
  const [password,  setPassword]  = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!vendorId.trim() || !password.trim()) {
      setError('Please enter your Vendor ID and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(vendorId.trim(), password)
      navigate('/dashboard')
    } catch (err) {
      const msg = err?.response?.data?.detail
        || err?.response?.data?.message
        || 'Invalid credentials. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center p-4">

      {/* Background subtle grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #1D1D1F 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg mb-4">
            <span className="text-white font-black text-3xl tracking-tight">T</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-dark tracking-tight">TRID</h1>
          <p className="text-sm text-gray-mid mt-1">Vendor Management Platform</p>
        </div>

        {/* Card */}
        <div className="card shadow-card-hover">
          <h2 className="text-xl font-bold text-gray-dark mb-1">Welcome back</h2>
          <p className="text-sm text-gray-mid mb-6">Sign in to your vendor account</p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-danger/8 border border-danger/20 text-danger
                            rounded-[10px] px-4 py-3 mb-5 text-sm animate-fade-in">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Vendor ID */}
            <div>
              <label className="label" htmlFor="vendorId">Vendor ID</label>
              <div className="relative">
                <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-mid" />
                <input
                  id="vendorId"
                  type="text"
                  placeholder="e.g. TRID-1024"
                  value={vendorId}
                  onChange={e => { setVendorId(e.target.value); setError('') }}
                  className="input pl-9 font-mono tracking-wide"
                  autoComplete="username"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-mid" />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  className="input pl-9 pr-11"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-mid
                             hover:text-gray-dark transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <button type="button" className="text-xs text-primary hover:underline">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full btn-lg mt-2"
            >
              {loading
                ? <><Loader2 size={17} className="animate-spin" /> Signing in…</>
                : 'Sign In'}
            </button>
          </form>
        </div>

        {/* First login notice */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-mid">
            First time? You'll be prompted to change your temporary password.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-mid mt-8">
          © {new Date().getFullYear()} TRID Technologies · All rights reserved
        </p>
      </div>
    </div>
  )
}
