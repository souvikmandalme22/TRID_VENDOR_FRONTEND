import { useState, useEffect, useCallback } from 'react'
import { Timer, CheckCircle2, XCircle, Loader2, AlertTriangle, X } from 'lucide-react'

const REJECT_REASONS = [
  'Machine not available',
  'Material not in stock',
  'Build volume exceeds capacity',
  'Overloaded with current orders',
  'File format not supported',
  'Other',
]

/**
 * Modal shown when a pending_acceptance order is opened.
 * deadline: ISO string – the 15-min window closes at this time.
 */
export default function AcceptRejectModal({ order, deadline, onAccept, onReject, onClose }) {
  const [secondsLeft,   setSecondsLeft]   = useState(0)
  const [phase,         setPhase]         = useState('decide')  // decide | rejecting | loading | done
  const [rejectReason,  setRejectReason]  = useState('')
  const [customReason,  setCustomReason]  = useState('')
  const [error,         setError]         = useState('')

  /* ── Countdown ── */
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, Math.floor((new Date(deadline) - Date.now()) / 1000))
      setSecondsLeft(diff)
      if (diff === 0) setPhase('expired')
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [deadline])

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const pct = deadline
    ? Math.min(100, (secondsLeft / (15 * 60)) * 100)
    : 100

  /* ── Urgency colour ── */
  const timerColor = secondsLeft > 300 ? 'text-success' : secondsLeft > 120 ? 'text-warning' : 'text-danger'
  const barColor   = secondsLeft > 300 ? 'bg-success'   : secondsLeft > 120 ? 'bg-warning'   : 'bg-danger'

  /* ── Handlers ── */
  const handleAccept = useCallback(async () => {
    setPhase('loading')
    setError('')
    try {
      await onAccept(order.id)
      setPhase('done')
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to accept. Please try again.')
      setPhase('decide')
    }
  }, [order.id, onAccept])

  const handleReject = useCallback(async () => {
    const reason = rejectReason === 'Other' ? customReason : rejectReason
    if (!reason.trim()) { setError('Please select a reason.'); return }
    setPhase('loading')
    setError('')
    try {
      await onReject(order.id, reason)
      setPhase('done')
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to reject. Please try again.')
      setPhase('rejecting')
    }
  }, [order.id, onReject, rejectReason, customReason])

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card-hover overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-border">
          <div className="flex items-center gap-2">
            <Timer size={18} className="text-primary" />
            <h3 className="font-bold text-gray-dark">New Order Assignment</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-light rounded-lg transition-colors">
            <X size={16} className="text-gray-mid" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Countdown */}
          {phase !== 'done' && phase !== 'expired' && (
            <div className="text-center">
              <p className="text-xs text-gray-mid mb-2 font-medium">Response required within</p>
              <p className={`text-4xl font-black tracking-tight ${timerColor}`}>
                {mm}:{ss}
              </p>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-gray-light rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-mid mt-1.5">
                No response = auto-reassignment
              </p>
            </div>
          )}

          {/* Order summary */}
          <div className="bg-gray-light rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-mid">Order ID</span>
              <span className="font-semibold text-gray-dark font-mono">{order.order_id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-mid">File Format</span>
              <span className="font-semibold text-gray-dark uppercase">{order.file_format || 'STL'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-mid">Material</span>
              <span className="font-semibold text-gray-dark">{order.material || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-mid">Build Volume</span>
              <span className="font-semibold text-gray-dark">{order.build_volume || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-mid">Deadline</span>
              <span className="font-semibold text-gray-dark">{order.delivery_deadline || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-mid">Payout</span>
              <span className="font-bold text-success">₹{order.vendor_payout || '—'}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-danger text-sm bg-danger/8
                            border border-danger/20 rounded-[10px] px-3 py-2">
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          {/* ── DECIDE phase ── */}
          {phase === 'decide' && (
            <div className="flex gap-3">
              <button
                onClick={() => setPhase('rejecting')}
                className="btn btn-outline flex-1 justify-center"
              >
                <XCircle size={16} /> Reject
              </button>
              <button
                onClick={handleAccept}
                className="btn btn-primary flex-1 justify-center"
              >
                <CheckCircle2 size={16} /> Accept Order
              </button>
            </div>
          )}

          {/* ── REJECTING phase ── */}
          {phase === 'rejecting' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-dark">Reason for rejection</p>
              <div className="space-y-2">
                {REJECT_REASONS.map(r => (
                  <label key={r} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="reject-reason"
                      value={r}
                      checked={rejectReason === r}
                      onChange={() => setRejectReason(r)}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm text-gray-dark group-hover:text-gray-dark">{r}</span>
                  </label>
                ))}
              </div>
              {rejectReason === 'Other' && (
                <textarea
                  rows={2}
                  placeholder="Please describe the reason…"
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  className="input resize-none"
                />
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setPhase('decide')} className="btn btn-secondary flex-1 justify-center">
                  Back
                </button>
                <button onClick={handleReject} className="btn btn-danger flex-1 justify-center">
                  Confirm Reject
                </button>
              </div>
            </div>
          )}

          {/* ── LOADING ── */}
          {phase === 'loading' && (
            <div className="flex justify-center py-4">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          )}

          {/* ── EXPIRED ── */}
          {phase === 'expired' && (
            <div className="text-center py-4">
              <p className="text-danger font-semibold mb-1">Time expired</p>
              <p className="text-sm text-gray-mid">This order has been auto-reassigned.</p>
              <button onClick={onClose} className="btn btn-secondary mt-4 mx-auto">Close</button>
            </div>
          )}

          {/* ── DONE ── */}
          {phase === 'done' && (
            <div className="text-center py-4">
              <CheckCircle2 size={40} className="text-success mx-auto mb-2" />
              <p className="font-semibold text-gray-dark mb-1">Response submitted!</p>
              <p className="text-sm text-gray-mid">Order status has been updated.</p>
              <button onClick={onClose} className="btn btn-primary mt-4 mx-auto">Done</button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
