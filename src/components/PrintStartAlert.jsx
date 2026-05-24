import { useState } from 'react'
import { Printer, Clock, CheckCircle2, Loader2, AlertTriangle, Info } from 'lucide-react'
import { confirmPrintStarted } from '../services/printApi'

const PRESET_TIMES = [30, 60, 90, 120, 180, 240, 300, 360, 480]

/**
 * @param order         - order object
 * @param onStarted     - callback(estimatedMinutes) when print started confirmed
 */
export default function PrintStartAlert({ order, onStarted }) {
  const [estHours,  setEstHours]  = useState('')
  const [estMins,   setEstMins]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const totalMinutes = (parseInt(estHours || 0) * 60) + parseInt(estMins || 0)

  const handleConfirm = async () => {
    if (totalMinutes < 1) { setError('Please enter the estimated print time.'); return }
    if (totalMinutes > 1440) { setError('Maximum estimate is 24 hours (1440 minutes).'); return }
    setLoading(true)
    setError('')
    try {
      await confirmPrintStarted(order.id, totalMinutes)
      onStarted?.(totalMinutes)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to confirm. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const setPreset = (minutes) => {
    setEstHours(String(Math.floor(minutes / 60)))
    setEstMins(String(minutes % 60))
    setError('')
  }

  return (
    <div className="space-y-5">

      {/* Alert banner */}
      <div className="flex items-start gap-3 bg-primary-light border border-primary/20 rounded-xl px-4 py-4">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Printer size={20} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-dark">Has printing started?</p>
          <p className="text-sm text-gray-mid mt-0.5">
            File downloaded. Please confirm that you've started printing
            and enter your slicer's estimated completion time.
          </p>
        </div>
      </div>

      {/* Slicer time input */}
      <div>
        <label className="label">Slicer Estimated Print Time</label>

        {/* Preset quick-select */}
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESET_TIMES.map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setPreset(m)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all border
                ${totalMinutes === m
                  ? 'bg-primary text-white border-primary'
                  : 'bg-gray-light text-gray-mid border-gray-border hover:border-primary/40 hover:text-gray-dark'}`}
            >
              {m < 60 ? `${m}m` : `${Math.floor(m/60)}h${m%60 ? ` ${m%60}m` : ''}`}
            </button>
          ))}
        </div>

        {/* Manual input */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="relative">
              <input
                type="number"
                min="0"
                max="23"
                placeholder="0"
                value={estHours}
                onChange={e => { setEstHours(e.target.value); setError('') }}
                className="input text-center text-xl font-bold pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-mid font-medium">
                hrs
              </span>
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-mid pb-0.5">:</span>
          <div className="flex-1">
            <div className="relative">
              <input
                type="number"
                min="0"
                max="59"
                placeholder="0"
                value={estMins}
                onChange={e => { setEstMins(e.target.value); setError('') }}
                className="input text-center text-xl font-bold pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-mid font-medium">
                min
              </span>
            </div>
          </div>
        </div>

        {/* Total display */}
        {totalMinutes > 0 && (
          <div className="flex items-center gap-2 mt-2.5 text-sm text-gray-mid">
            <Info size={13} />
            <span>
              Estimated completion:{' '}
              <strong className="text-gray-dark">
                {new Date(Date.now() + totalMinutes * 60000)
                  .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </strong>
              {' '}({totalMinutes >= 60
                ? `${Math.floor(totalMinutes/60)}h ${totalMinutes%60 ? `${totalMinutes%60}m` : ''}`
                : `${totalMinutes}m`} from now)
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-danger text-sm bg-danger/8
                        border border-danger/20 rounded-[10px] px-3 py-2.5">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={loading || totalMinutes < 1}
        className="btn btn-primary btn-full btn-lg"
      >
        {loading
          ? <><Loader2 size={17} className="animate-spin" /> Confirming…</>
          : <><CheckCircle2 size={17} /> Yes, Printing Started</>}
      </button>

      <p className="text-xs text-gray-mid text-center">
        TRID operations team will monitor your live print progress.
      </p>
    </div>
  )
}
