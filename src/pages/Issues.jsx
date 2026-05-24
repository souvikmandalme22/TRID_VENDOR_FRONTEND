import { useState, useEffect, useRef } from 'react'
import {
  AlertTriangle, Upload, X, CheckCircle2, Clock,
  MessageSquare, Loader2, Plus, FileImage, Film,
  ChevronDown, ChevronUp, ShieldAlert, RefreshCw
} from 'lucide-react'
import { getIssues, reportIssue } from '../services/issuesApi'

/* ── Fallback issues ── */
const FALLBACK_ISSUES = [
  { id: 1, order_id: 'ORD-1022', type: 'print_failure', title: 'Layer delamination mid-print', description: 'Print failed at 60% due to layer delamination. Material was PLA, room temp was fine.', status: 'resolved', created_at: new Date(Date.now() - 7*86400000).toISOString(), resolved_at: new Date(Date.now() - 5*86400000).toISOString(), trid_response: 'Acknowledged. Order reassigned. No penalty applied.', attachments: 1 },
  { id: 2, order_id: 'ORD-1030', type: 'material_issue', title: 'ABS material out of stock', description: 'Could not fulfill order as ABS filament ran out. Need to update inventory settings.', status: 'under_review', created_at: new Date(Date.now() - 2*86400000).toISOString(), resolved_at: null, trid_response: 'Under review by operations team.', attachments: 0 },
  { id: 3, order_id: 'ORD-1035', type: 'machine_fault', title: 'Extruder clog during print', description: 'Extruder jammed at 30% completion. Cleaned and restarted but need more time.', status: 'open', created_at: new Date(Date.now() - 86400000).toISOString(), resolved_at: null, trid_response: null, attachments: 2 },
]

const ISSUE_TYPES = [
  { value: 'print_failure',  label: '🖨️ Print Failure'     },
  { value: 'material_issue', label: '🧱 Material Issue'     },
  { value: 'machine_fault',  label: '⚙️ Machine Fault'      },
  { value: 'file_problem',   label: '📄 File Problem'       },
  { value: 'quality_concern',label: '🔍 Quality Concern'    },
  { value: 'other',          label: '📝 Other'              },
]

const STATUS_MAP = {
  open:         { label: 'Open',         cls: 'badge-danger',  icon: AlertTriangle },
  under_review: { label: 'Under Review', cls: 'badge-warning', icon: Clock         },
  resolved:     { label: 'Resolved',     cls: 'badge-success', icon: CheckCircle2  },
}

const timeAgo = (iso) => {
  const d = Math.floor((Date.now() - new Date(iso)) / 86400000)
  if (d < 1) return 'Today'
  if (d === 1) return 'Yesterday'
  return `${d} days ago`
}

/* ── Issue history card ── */
function IssueCard({ issue }) {
  const [expanded, setExpanded] = useState(false)
  const { label, cls, icon: Icon } = STATUS_MAP[issue.status] || STATUS_MAP['open']

  return (
    <div className={`border rounded-xl overflow-hidden transition-all
      ${issue.status === 'open' ? 'border-danger/30 bg-danger/3' : 'border-gray-border bg-white'}`}>
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-light/50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
          ${issue.status === 'resolved' ? 'bg-success/10' : issue.status === 'under_review' ? 'bg-warning/10' : 'bg-danger/10'}`}>
          <Icon size={16} className={issue.status === 'resolved' ? 'text-success' : issue.status === 'under_review' ? 'text-warning' : 'text-danger'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-gray-dark text-sm leading-tight">{issue.title}</p>
            <span className={`badge ${cls} shrink-0`}><Icon size={10} /> {label}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-mid">
            <span className="font-mono font-semibold text-info">{issue.order_id}</span>
            <span>·</span>
            <span>{timeAgo(issue.created_at)}</span>
            {issue.attachments > 0 && <><span>·</span><span>📎 {issue.attachments} file{issue.attachments > 1 ? 's' : ''}</span></>}
          </div>
        </div>
        {expanded ? <ChevronUp size={15} className="text-gray-mid shrink-0 mt-1" />
                  : <ChevronDown size={15} className="text-gray-mid shrink-0 mt-1" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-border/50">
          <p className="text-sm text-gray-dark pt-3 leading-relaxed">{issue.description}</p>
          {issue.trid_response && (
            <div className="bg-info/8 border border-info/20 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold text-info uppercase tracking-wider mb-1">
                TRID Response
              </p>
              <p className="text-sm text-gray-dark">{issue.trid_response}</p>
            </div>
          )}
          {issue.resolved_at && (
            <p className="text-xs text-success font-medium">
              ✓ Resolved on {new Date(issue.resolved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Report Form ── */
function ReportForm({ onSubmitted }) {
  const [orderId,   setOrderId]   = useState('')
  const [issueType, setIssueType] = useState('')
  const [title,     setTitle]     = useState('')
  const [desc,      setDesc]      = useState('')
  const [files,     setFiles]     = useState([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const fileRef = useRef(null)

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).filter(f =>
      f.type.startsWith('image/') || f.type.startsWith('video/')
    )
    setFiles(prev => [...prev, ...selected].slice(0, 5))
  }

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!orderId || !issueType || !title || !desc) { setError('Please fill all required fields.'); return }
    setLoading(true); setError('')
    try {
      const fd = new FormData()
      fd.append('order_id',   orderId)
      fd.append('issue_type', issueType)
      fd.append('title',      title)
      fd.append('description',desc)
      files.forEach(f => fd.append('attachments', f))
      await reportIssue(fd)
      onSubmitted?.()
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center">
          <AlertTriangle size={18} className="text-danger" />
        </div>
        <div>
          <h2 className="font-bold text-gray-dark">Report an Issue</h2>
          <p className="text-xs text-gray-mid">TRID dispute team will respond within 24 hours</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Order ID <span className="text-danger">*</span></label>
          <input value={orderId} onChange={e => setOrderId(e.target.value)}
            placeholder="e.g. ORD-1041" className="input font-mono" required />
        </div>
        <div>
          <label className="label">Issue Type <span className="text-danger">*</span></label>
          <select value={issueType} onChange={e => setIssueType(e.target.value)} className="input" required>
            <option value="">Select type…</option>
            {ISSUE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Issue Title <span className="text-danger">*</span></label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Short description of the problem" className="input" required />
      </div>

      <div>
        <label className="label">Detailed Explanation <span className="text-danger">*</span></label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
          placeholder="Describe what happened, when it occurred, and any steps you've already taken…"
          className="input resize-none" required />
        <p className="text-xs text-gray-mid mt-1">{desc.length}/500</p>
      </div>

      {/* File upload */}
      <div>
        <label className="label">Attach Photos / Videos (optional)</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-border rounded-xl p-5 text-center
                     cursor-pointer hover:border-primary/40 hover:bg-primary-light/30 transition-all"
        >
          <Upload size={22} className="mx-auto mb-2 text-gray-mid" />
          <p className="text-sm text-gray-mid font-medium">Click to upload or drag & drop</p>
          <p className="text-xs text-gray-mid mt-1">Images & videos · Max 5 files</p>
          <input ref={fileRef} type="file" multiple accept="image/*,video/*"
            onChange={handleFiles} className="hidden" />
        </div>

        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-light rounded-lg px-3 py-1.5 text-xs">
                {f.type.startsWith('image/') ? <FileImage size={12} className="text-info" /> : <Film size={12} className="text-primary" />}
                <span className="max-w-[120px] truncate text-gray-dark">{f.name}</span>
                <button type="button" onClick={() => removeFile(i)} className="text-gray-mid hover:text-danger">
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-danger text-sm bg-danger/8
                        border border-danger/20 rounded-[10px] px-3 py-2.5">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn btn-danger btn-full">
        {loading
          ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
          : <><ShieldAlert size={16} /> Submit Issue Report</>}
      </button>
    </form>
  )
}

/* ── Main Page ── */
export default function Issues() {
  const [issues,  setIssues]  = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm,setShowForm]= useState(false)

  const fetchIssues = async () => {
    setLoading(true)
    try {
      const res  = await getIssues()
      const data = Array.isArray(res.data) ? res.data : res.data?.results
      setIssues(data?.length ? data : FALLBACK_ISSUES)
    } catch { setIssues(FALLBACK_ISSUES) }
    finally  { setLoading(false) }
  }

  useEffect(() => { fetchIssues() }, [])

  const open = issues.filter(i => i.status === 'open').length

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-dark tracking-tight">Issue Reporting</h1>
          <p className="text-sm text-gray-mid mt-0.5">{open} open · TRID dispute resolution support</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchIssues} className="btn btn-outline btn-sm"><RefreshCw size={14} /></button>
          <button onClick={() => setShowForm(v => !v)} className="btn btn-danger btn-sm">
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Cancel' : 'Report Issue'}
          </button>
        </div>
      </div>

      {open > 0 && (
        <div className="flex items-center gap-3 bg-danger/8 border border-danger/20 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-danger shrink-0" />
          <p className="text-sm font-semibold text-gray-dark">
            {open} open issue{open > 1 ? 's' : ''} — TRID team is reviewing
          </p>
        </div>
      )}

      {showForm && <ReportForm onSubmitted={() => { setShowForm(false); fetchIssues() }} />}

      <div className="space-y-3">
        <h2 className="font-semibold text-gray-dark text-sm">Issue History</h2>
        {loading
          ? [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-border rounded-xl animate-pulse" />)
          : issues.length === 0
            ? <div className="card text-center py-12 text-gray-mid">
                <CheckCircle2 size={36} className="mx-auto mb-3 text-success opacity-50" />
                <p className="font-semibold">No issues reported</p>
              </div>
            : issues.map(issue => <IssueCard key={issue.id} issue={issue} />)
        }
      </div>
    </div>
  )
}
