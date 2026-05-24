import { useState, useEffect, useCallback } from 'react'
import {
  Download, FileType, Shield, CheckCircle2, Loader2,
  Clock, AlertTriangle, ExternalLink
} from 'lucide-react'
import { getFileDownloadUrl, confirmDownload } from '../services/printApi'

const FORMAT_COLORS = {
  STL:  { bg: 'bg-info/10',    text: 'text-info',    icon: '🔷' },
  STEP: { bg: 'bg-success/10', text: 'text-success',  icon: '🟢' },
  OBJ:  { bg: 'bg-warning/10', text: 'text-warning',  icon: '🟡' },
  '3MF':{ bg: 'bg-primary-light', text: 'text-primary', icon: '🟠' },
}

/**
 * @param order        - order object (must be status: 'accepted')
 * @param onDownloaded - callback when download confirmed
 */
export default function FileDownloadCard({ order, onDownloaded }) {
  const [phase,       setPhase]       = useState('idle')   // idle | fetching | ready | downloading | done | error
  const [signedUrl,   setSignedUrl]   = useState('')
  const [errorMsg,    setErrorMsg]    = useState('')
  const [countdown,   setCountdown]   = useState(null)     // seconds after download — 5-10 min alert
  const [alertFired,  setAlertFired]  = useState(false)

  const fmt     = (order.file_format || 'STL').toUpperCase()
  const fmtMeta = FORMAT_COLORS[fmt] || FORMAT_COLORS['STL']

  /* ── Get signed URL ── */
  const handleGetUrl = async () => {
    setPhase('fetching')
    setErrorMsg('')
    try {
      const res = await getFileDownloadUrl(order.id)
      setSignedUrl(res.data.url || res.data.signed_url)
      setPhase('ready')
    } catch (e) {
      setErrorMsg(e?.response?.data?.detail || 'Could not fetch download link.')
      setPhase('error')
    }
  }

  /* ── Confirm download + start 5-min alert countdown ── */
  const handleDownload = useCallback(async () => {
    setPhase('downloading')
    try {
      /* Open signed URL */
      window.open(signedUrl, '_blank', 'noopener')
      await confirmDownload(order.id)
      setPhase('done')
      /* Start 5-min (300s) countdown to "Has printing started?" alert */
      setCountdown(300)
    } catch (e) {
      setErrorMsg(e?.response?.data?.detail || 'Download confirmation failed.')
      setPhase('error')
    }
  }, [signedUrl, order.id])

  /* ── Countdown ticker ── */
  useEffect(() => {
    if (countdown === null) return
    if (countdown <= 0) { setAlertFired(true); return }
    const id = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [countdown])

  /* ── When alert fires, notify parent to move to print-start phase ── */
  useEffect(() => {
    if (alertFired) onDownloaded?.()
  }, [alertFired])

  const mm = countdown !== null ? String(Math.floor(countdown / 60)).padStart(2,'0') : '05'
  const ss = countdown !== null ? String(countdown % 60).padStart(2,'0')             : '00'

  return (
    <div className="space-y-4">

      {/* File info card */}
      <div className={`flex items-center gap-4 ${fmtMeta.bg} rounded-xl p-4 border border-gray-border/40`}>
        <div className="text-3xl">{fmtMeta.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-mid font-medium mb-0.5">Print File</p>
          <p className={`text-lg font-black ${fmtMeta.text}`}>.{fmt}</p>
          <p className="text-xs text-gray-mid mt-0.5">
            {order.order_id} · {order.build_volume || 'Volume N/A'}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-gray-mid mb-1">Secured by</p>
          <div className="flex items-center gap-1 text-success text-xs font-semibold">
            <Shield size={12} /> Signed URL
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-2.5 text-xs text-gray-mid bg-gray-light rounded-xl px-4 py-3">
        <Shield size={13} className="mt-0.5 text-info shrink-0" />
        <p>
          This file is <strong className="text-gray-dark">exclusively accessible</strong> to you.
          Download is tracked internally. Supported: STL, STEP, OBJ, 3MF.
        </p>
      </div>

      {/* Error */}
      {phase === 'error' && (
        <div className="flex items-center gap-2 text-danger text-sm bg-danger/8
                        border border-danger/20 rounded-[10px] px-3 py-2.5">
          <AlertTriangle size={15} /> {errorMsg}
        </div>
      )}

      {/* ── CTA buttons by phase ── */}
      {phase === 'idle' && (
        <button onClick={handleGetUrl} className="btn btn-primary btn-full">
          <Download size={16} /> Get Secure Download Link
        </button>
      )}

      {phase === 'fetching' && (
        <button disabled className="btn btn-primary btn-full opacity-70">
          <Loader2 size={16} className="animate-spin" /> Generating secure link…
        </button>
      )}

      {phase === 'ready' && (
        <div className="space-y-2">
          {/* Truncated URL preview */}
          <div className="flex items-center gap-2 bg-gray-light rounded-[10px] px-3 py-2 text-xs text-gray-mid font-mono overflow-hidden">
            <ExternalLink size={11} className="shrink-0" />
            <span className="truncate">{signedUrl.slice(0, 60)}…</span>
          </div>
          <button onClick={handleDownload} className="btn btn-primary btn-full">
            <Download size={16} /> Download File Now
          </button>
        </div>
      )}

      {phase === 'downloading' && (
        <button disabled className="btn btn-primary btn-full opacity-70">
          <Loader2 size={16} className="animate-spin" /> Confirming download…
        </button>
      )}

      {phase === 'done' && !alertFired && (
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 text-success bg-success/8
                          border border-success/20 rounded-[10px] px-4 py-2.5">
            <CheckCircle2 size={16} /> <span className="text-sm font-semibold">File downloaded successfully!</span>
          </div>

          {/* Countdown to "printing started?" alert */}
          <div className="card bg-warning/5 border-warning/20 text-center py-4">
            <Clock size={24} className="text-warning mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-dark mb-1">
              Start printing within
            </p>
            <p className="text-3xl font-black text-warning tabular-nums">
              {mm}:{ss}
            </p>
            <p className="text-xs text-gray-mid mt-2">
              You'll be prompted to confirm print start
            </p>
          </div>
        </div>
      )}

    </div>
  )
}
