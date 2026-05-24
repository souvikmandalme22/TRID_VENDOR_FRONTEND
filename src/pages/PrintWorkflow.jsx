import { useState, useEffect } from 'react'
import {
  Printer, Download, CheckCircle2, Clock, Package,
  ChevronRight, RefreshCw, AlertCircle, Layers
} from 'lucide-react'
import FileDownloadCard from '../components/FileDownloadCard'
import PrintStartAlert  from '../components/PrintStartAlert'
import LivePrintTimer   from '../components/LivePrintTimer'
import OrderStatusBadge from '../components/OrderStatusBadge'
import { getActivePrintJobs } from '../services/printApi'

/* ── Fallback data ── */
const FALLBACK_JOBS = [
  {
    id: 1, order_id: 'ORD-1025', status: 'accepted',
    material: 'PLA', file_format: 'STL', build_volume: '110×90×70 mm',
    delivery_deadline: '26 May 2026', vendor_payout: 1650,
    accept_deadline: new Date(Date.now() + 8*60000).toISOString(),
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2, order_id: 'ORD-1038', status: 'printing',
    material: 'ABS', file_format: 'STEP', build_volume: '95×70×45 mm',
    delivery_deadline: '27 May 2026', vendor_payout: 2400,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    print_started_at: new Date(Date.now() - 5400000).toISOString(),
    est_print_minutes: 150,
  },
]

/* ── Workflow step config ── */
const STEPS = [
  { key: 'download',   icon: Download,      label: 'Download File'   },
  { key: 'printstart', icon: Printer,       label: 'Start Printing'  },
  { key: 'printing',   icon: Clock,         label: 'Live Timer'      },
  { key: 'done',       icon: CheckCircle2,  label: 'Print Complete'  },
]

/* ── Derive step from order status ── */
const getStep = (order) => {
  if (['completed','packaging','shipped'].includes(order.status)) return 'done'
  if (order.status === 'printing')   return 'printing'
  if (order.status === 'accepted')   return 'download'
  return 'download'
}

/* ── Step indicator ── */
function StepIndicator({ currentStep }) {
  const stepKeys = STEPS.map(s => s.key)
  const current  = stepKeys.indexOf(currentStep)

  return (
    <div className="flex items-center justify-between mb-6">
      {STEPS.map(({ key, icon: Icon, label }, i) => {
        const done   = i < current
        const active = i === current
        return (
          <div key={key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
                ${done   ? 'bg-success text-white'           : ''}
                ${active ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
                ${!done && !active ? 'bg-gray-light text-gray-mid' : ''}`}>
                {done ? <CheckCircle2 size={17} /> : <Icon size={17} />}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap
                ${active ? 'text-primary' : done ? 'text-success' : 'text-gray-mid'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full
                ${i < current ? 'bg-success' : 'bg-gray-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Single job card ── */
function PrintJobCard({ job, onUpdate }) {
  const [step, setStep]       = useState(getStep(job))
  const [localJob, setJob]    = useState(job)
  const [estMins, setEstMins] = useState(job.est_print_minutes || 90)
  const [printStart, setPrintStart] = useState(job.print_started_at || null)

  const handleDownloaded = () => setStep('printstart')

  const handlePrintStarted = (mins) => {
    setEstMins(mins)
    setPrintStart(new Date().toISOString())
    setJob(prev => ({ ...prev, status: 'printing' }))
    setStep('printing')
    onUpdate?.()
  }

  const handleComplete = () => {
    setStep('done')
    onUpdate?.()
  }

  return (
    <div className="card space-y-5">
      {/* Job header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center">
            <Printer size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-gray-dark font-mono">{localJob.order_id}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-mid">{localJob.material}</span>
              <span className="text-gray-border">·</span>
              <span className="badge badge-gray uppercase text-[10px] font-mono">{localJob.file_format}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <OrderStatusBadge status={localJob.status} />
          <p className="text-xs text-gray-mid mt-1.5">Payout: <strong className="text-success">₹{localJob.vendor_payout?.toLocaleString()}</strong></p>
        </div>
      </div>

      {/* Order info strip */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-mid bg-gray-light rounded-xl px-4 py-3">
        <span>📦 Volume: <strong className="text-gray-dark font-mono">{localJob.build_volume}</strong></span>
        <span className="text-gray-border">|</span>
        <span>📅 Deliver by: <strong className="text-gray-dark">{localJob.delivery_deadline}</strong></span>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} />

      {/* Step content */}
      {step === 'download' && (
        <FileDownloadCard order={localJob} onDownloaded={handleDownloaded} />
      )}
      {step === 'printstart' && (
        <PrintStartAlert order={localJob} onStarted={handlePrintStarted} />
      )}
      {step === 'printing' && printStart && (
        <LivePrintTimer
          order={localJob}
          estMinutes={estMins}
          printStartedAt={printStart}
          onComplete={handleComplete}
        />
      )}
      {step === 'done' && (
        <div className="card bg-success/8 border-success/20 text-center py-6">
          <CheckCircle2 size={36} className="text-success mx-auto mb-2" />
          <p className="font-bold text-gray-dark">Print Completed!</p>
          <p className="text-sm text-gray-mid mt-1">
            Proceed to <strong>Packaging & Courier</strong> — go to the Orders page.
          </p>
        </div>
      )}
    </div>
  )
}

/* ── Main Page ── */
export default function PrintWorkflow() {
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await getActivePrintJobs()
      const data = Array.isArray(res.data) ? res.data : res.data?.results
      setJobs(data?.length ? data : FALLBACK_JOBS)
    } catch {
      setJobs(FALLBACK_JOBS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [])

  const printingNow = jobs.filter(j => j.status === 'printing').length
  const accepted    = jobs.filter(j => j.status === 'accepted').length

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-dark tracking-tight">Print Workflow</h1>
          <p className="text-sm text-gray-mid mt-0.5">
            {printingNow} printing · {accepted} ready to start
          </p>
        </div>
        <button onClick={fetchJobs} className="btn btn-outline">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Active prints summary */}
      {printingNow > 0 && (
        <div className="flex items-center gap-3 bg-primary-light border border-primary/20 rounded-xl px-4 py-3">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <p className="text-sm font-semibold text-gray-dark">
            {printingNow} job{printingNow > 1 ? 's' : ''} currently printing — TRID is monitoring live
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="card animate-pulse space-y-4">
              <div className="h-12 bg-gray-light rounded-xl" />
              <div className="h-6 bg-gray-light rounded-xl" />
              <div className="h-32 bg-gray-light rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* No jobs */}
      {!loading && jobs.length === 0 && (
        <div className="card text-center py-16">
          <Printer size={40} className="mx-auto mb-3 text-gray-border" />
          <p className="font-semibold text-gray-dark">No active print jobs</p>
          <p className="text-sm text-gray-mid mt-1">
            Accept an order from the Orders page to begin.
          </p>
        </div>
      )}

      {/* Job cards */}
      {!loading && jobs.map(job => (
        <PrintJobCard key={job.id} job={job} onUpdate={fetchJobs} />
      ))}

      {/* How it works */}
      {!loading && jobs.length > 0 && (
        <div className="card bg-gray-light border-0">
          <p className="text-xs font-bold text-gray-mid uppercase tracking-wider mb-3">How Print Workflow Works</p>
          <div className="space-y-2">
            {[
              { step: '1', text: 'Download the print file using the secure signed link — only you can access it.' },
              { step: '2', text: 'A 5-minute window starts after download. Confirm printing has started.' },
              { step: '3', text: 'Enter your slicer\'s estimated time. A live countdown starts for TRID monitoring.' },
              { step: '4', text: 'When done, mark complete or report a delay with reason and extra time needed.' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold
                                flex items-center justify-center shrink-0 mt-0.5">
                  {step}
                </div>
                <p className="text-xs text-gray-mid leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
