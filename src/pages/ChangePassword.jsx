import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const rules = [
  { test: (p) => p.length >= 8,               label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p),             label: 'One uppercase letter' },
  { test: (p) => /[0-9]/.test(p),             label: 'One number' },
  { test: (p) => /[^a-zA-Z0-9]/.test(p),      label: 'One special character' },
]

export default function ChangePassword() {
  const navigate          = useNavigate()
  const { changePassword } = useAuth()

  const [current,  setCurrent]  = useState('')
  const [newPw,    setNewPw]    = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showCurr, setShowCurr] = useState(false)
  const [showNew,  setShowNew]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const allRulesPassed = rules.every(r => r.test(newPw))
  const passwordsMatch = newPw && confirm && newPw === confirm

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!allRulesPassed) { setError('Password does not meet requirements.'); return }
    if (!passwordsMatch)  { setError('Passwords do not match.'); return }
    setLoading(true)
    setError('')
    try {
      await changePassword(current, newPw)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg mb-4">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-dark">Set New Password</h1>
          <p className="text-sm text-gray-mid mt-1">Required on first login for security</p>
        </div>

        <div className="card shadow-card-hover">

          {error && (
            <div className="flex items-start gap-2.5 bg-danger/8 border border-danger/20 text-danger
                            rounded-[10px] px-4 py-3 mb-5 text-sm animate-fade-in">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Current (temp) password */}
            <div>
              <label className="label">Temporary Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-mid" />
                <input
                  type={showCurr ? 'text' : 'password'}
                  placeholder="Your temporary password"
                  value={current}
                  onChange={e => setCurrent(e.target.value)}
                  className="input pl-9 pr-11"
                  disabled={loading}
                  required
                />
                <button type="button" onClick={() => setShowCurr(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-mid hover:text-gray-dark transition-colors">
                  {showCurr ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-mid" />
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  className="input pl-9 pr-11"
                  disabled={loading}
                  required
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-mid hover:text-gray-dark transition-colors">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength rules */}
              {newPw && (
                <div className="mt-3 space-y-1.5">
                  {rules.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 size={13}
                        className={r.test(newPw) ? 'text-success' : 'text-gray-border'} />
                      <span className={`text-xs ${r.test(newPw) ? 'text-success' : 'text-gray-mid'}`}>
                        {r.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className={`input ${confirm && !passwordsMatch ? 'input-error' : ''}`}
                disabled={loading}
                required
              />
              {confirm && !passwordsMatch && (
                <p className="text-xs text-danger mt-1.5">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !allRulesPassed || !passwordsMatch}
              className="btn btn-primary btn-full btn-lg mt-2"
            >
              {loading
                ? <><Loader2 size={17} className="animate-spin" /> Updating…</>
                : 'Set New Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
