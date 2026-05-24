const STATUS_MAP = {
  pending_acceptance: { label: 'Pending Acceptance', cls: 'badge-warning' },
  accepted:           { label: 'Accepted',           cls: 'badge-info'    },
  downloading:        { label: 'Downloading',        cls: 'badge-info'    },
  printing:           { label: 'Printing',           cls: 'badge-primary' },
  completed:          { label: 'Completed',          cls: 'badge-success' },
  packaging:          { label: 'Packaging',          cls: 'badge-primary' },
  shipped:            { label: 'Shipped',            cls: 'badge-success' },
  rejected:           { label: 'Rejected',           cls: 'badge-danger'  },
  reassigned:         { label: 'Reassigned',         cls: 'badge-gray'    },
  cancelled:          { label: 'Cancelled',          cls: 'badge-danger'  },
}

export default function OrderStatusBadge({ status }) {
  const { label, cls } = STATUS_MAP[status] || { label: status, cls: 'badge-gray' }
  return <span className={`badge ${cls}`}>{label}</span>
}
