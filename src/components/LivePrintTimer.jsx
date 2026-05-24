import { useState, useEffect, useCallback } from 'react'
import {
  Timer, CheckCircle2, AlertTriangle, Loader2,
  Clock, Zap, RefreshCw, ChevronDown
} from 'lucide-react'
import { markPrintComplete, reportDelay } from '../services/printApi'

const DELAY_REASONS = [
  'Material issue during print',
  'Print failure — restarting',
  'Machine calibration needed',
  'Overheating / cooling issue',
  'Power interruption',
  'Higher layer complexity than estimated',
  'Other',
]

/**
 * @param order           - order object with status: 'printing'
 * @param estMinutes      - original slicer estimate in minutes
 * @param printStartedAt  - ISO string when printing started
 * @param onComplete      - callback when print marked complete
 */
export default function LivePrintTimer({ order, estMinutes, printStartedAt, onComplete }) {
  /* ── Derive deadline from start + estimate ── */
  const deadlineMs = new Date(printStartedAt).getTime() + estMinutes * 60000

  const [secondsLeft,  setSecondsLeft]  = useState(0)
  const [elapsed,      setElapsed]      = useState(0)
  const [phase,        setPhase]        = useState('running')  // running | alert | delay | done | loading
  const [delayReason,  setDelayReason]  = useState('')
  const [customReason, setCustomReason] = useState('')
  const [extraMins,    setExtraMins]    = useState(30)
  const [error,        setError]        = useState('')

  /* ── Tick ── */
  useEffect(() => {
    const tick = () => {
      const now       = Date.now()
      const remaining = Math.max(0, Math.floor((deadlineMs - now) / 1000))
      const elapsedS  = Math.floor((now - new Date(printStartedAt).getTime()) / 1000)
      setSecondsLeft(remaining)
      setElapsed(elapsedS)
      if (remaining === 0 && phase === 'running') setPhase('alert')
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [deadlineMs, printStartedAt, phase])

  const totalSecs    = estMinutes * 60
  const progressPct  = Math.min(100, ((totalSecs - secondsLeft) / totalSecs) * 100)

  const fmtTime = (secs) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }

  /* ── Colours based on remaining time ── */
  const urgency =
    phase === 'alert'   ? 'danger'  :
    secondsLeft < 600   ? 'warning' : 'success'

  const urgencyStyles = {
    success: { ring: 'ring-success/30', bar: 'bg-success', text: 'text-success', glow: 'shadow-[0_0_20px_rgba(52,199,89,0.25)]' },
    warning: { ring: 'ring-warning/30', bar: 'bg-warning', text: 'text-warning', glow: 'shadow-[0_0_20px_rgba(255,159,10,0.25)]' },
    danger:  { ring: 'ring-danger/30',  bar: 'bg-danger',  text: 'text-danger',  glow: 'shadow-[0_0_20px_rgba(255,59,48,0.25)]' },
  }[urgency]

  /* ── Mark complete ── */
  const handleComplete = useCallback(async () => {
    setPhase('loading')
    setError('')
    try {
      await markPrintComplete(order.id)
      setPhase('done')
      onComplete?.()
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to mark complete.')
      setPhase('alert')
    }
  }, [order.id, onComplete])

  /* ── Report delay ── */
  const handleDelay = useCallback(async () => {
    const reason = delayReason === 'Other' ? customReason : delayReason
    if (!reason.trim()) { setError('Please select a reason.'); return }
    if (extraMins < 1)  { setError('Please enter extra minutes needed.'); return }
    setPhase('loading')
    setError('')
    try {
      await reportDelay(order.id, extraMins, reason)
      /* Extend deadline locally */
      setPhase('running')
      setDelayReason('')
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to report delay.')
      setPhase('delay')
    }
  }, [order.id, extraMins, delayReason, customReason])

  return (
    <div className="space-y-5">

      {/* ── LIVE TIMER ── */}
      <div className={`card text-center py-6 ring-2 ${urgencyStyles.ring} ${urgencyStyles.glow}`}>
        {/* Status pulse dot */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className={`w-2.5 h-2.5 rounded-full ${urgencyStyles.bar} animate-pulse`} />
          <span className="text-sm font-semibold text-gray-mid">
            {phase === 'alert' ? 'Timer Ended — Action Required' : 'Live Print Timer'}
          </span>
        </div>

        {/* Big countdown */}
        <div className={`text-6xl font-black tracking-tight tabular-nums ${urgencyStyles.text} mb-2`}>
          {phase === 'alert' ? '00:00' : fmtTime(secondsLeft)}
        </div>
        <p className="text-sm text-gray-mid">
          {phase === 'alert' ? 'Timer has ended' : 'remaining'}
        </p>

        {/* Radial-like progress bar */}
        <div className="mt-5 mx-4">
          <div className="h-2 bg-gray-light rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${urgencyStyles.bar}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[11px] text-gray-mid">
            <span>Started</span>
            <span>{Math.round(progressPct)}% complete</span>
            <span>Est. end</span>
          </div>
        </div>

        {/* Elapsed */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-mid">
          <Clock size={11} /> Elapsed: <strong>{fmtTime(elapsed)}</strong>
          &nbsp;/&nbsp; Est: <strong>{Math.floor(estMinutes/60)}h {estMinutes%60}m</strong>
        </div>
      </div>

      {/* ── Order ID chip ── */}
      <div className="flex items-center gap-2 text-xs text-gray-mid bg-gray-light rounded-xl px-4 py-2.5">
        <Zap size={12} className="text-primary" />
        Order <strong className="text-gray-dark font-mono">{order.order_id}</strong>
        &nbsp;·&nbsp; Material: <strong className="text-gray-dark">{order.material}</strong>
        &nbsp;·&nbsp; TRID is monitoring this print session
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 text-danger text-sm bg-danger/8
                        border border-danger/20 rounded-[10px] px-3 py-2.5">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* ── RUNNING: action buttons ── */}
      {phase === 'running' && (
        <div className="flex gap-3">
          <button
            onClick={() => setPhase('delay')}
            className="btn btn-outline flex-1 justify-center"
          >
            <RefreshCw size={15} /> Report Delay
          </button>
          <button
            onClick={handleComplete}
            className="btn btn-primary flex-1 justify-center"
          >
            <CheckCircle2 size={15} /> Mark Complete
          </button>
        </div>
      )}

      {/* ── ALERT (timer ended): complete or still printing ── */}
      {phase === 'alert' && (
        <div className="space-y-3">
          <div className="bg-danger/8 border border-danger/20 rounded-xl px-4 py-3 text-sm text-danger font-semibold text-center">
            ⏰ Print timer has ended — please update status
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPhase('delay')}
              className="btn btn-outline flex-1 justify-center"
            >
              Still Printing
            </button>
            <button
              onClick={handleComplete}
              className="btn btn-primary flex-1 justify-center"
            >
              <CheckCircle2 size={15} /> Print Completed ✓
            </button>
          </div>
        </div>
      )}

      {/* ── DELAY: reason + extra time ── */}
      {phase === 'delay' && (
        <div className="space-y-4 border border-warning/30 bg-warning/5 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning" />
            <p className="font-semibold text-gray-dark text-sm">Report Print Delay</p>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            {DELAY_REASONS.map(r => (
              <label key={r} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="delay-reason"
                  value={r}
                  checked={delayReason === r}
                  onChange={() => setDelayReason(r)}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm text-gray-dark">{r}</span>
              </label>
            ))}
          </div>

          {delayReason === 'Other' && (
            <textarea
              rows={2}
              placeholder="Describe the issue…"
              value={customReason}
              onChange={e => setCustomReason(e.target.value)}
              className="input resize-none"
            />
          )}

          {/* Extra time needed */}
          <div>
            <label className="label">Additional Time Needed (minutes)</label>
            <div className="flex gap-2">
              {[15, 30, 45, 60, 90, 120].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setExtraMins(m)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all flex-1
                    ${extraMins === m
                      ? 'bg-warning text-white border-warning'
                      : 'bg-white text-gray-mid border-gray-border hover:text-gray-dark'}`}
                >
                  +{m}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setPhase(secondsLeft > 0 ? 'running' : 'alert')} className="btn btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button onClick={handleDelay} className="btn btn-primary flex-1 justify-center">
              Submit Delay Report
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

      {/* ── DONE ── */}
      {phase === 'done' && (
        <div className="card bg-success/8 border-success/20 text-center py-6">
          <CheckCircle2 size={40} className="text-success mx-auto mb-2" />
          <p className="font-bold text-gray-dark text-lg">Print Completed! 🎉</p>
          <p className="text-sm text-gray-mid mt-1">
            Proceed to packaging & courier section.
          </p>
        </div>
      )}
    </div>
  )
}
