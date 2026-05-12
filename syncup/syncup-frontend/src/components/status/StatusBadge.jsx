const CONFIG = {
  IN_OFFICE: { label: 'In Office', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  REMOTE:    { label: 'Remote',    dot: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50'    },
  ON_LEAVE:  { label: 'On Leave',  dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50'   },
  UNDECIDED: { label: 'Undecided', dot: 'bg-gray-400',    text: 'text-gray-600',    bg: 'bg-gray-100'   },
}

export default function StatusBadge({ status, size = 'sm' }) {
  if (!status) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 text-${size}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
        Not set
      </span>
    )
  }

  const c = CONFIG[status] || CONFIG.UNDECIDED
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${c.bg} ${c.text} text-${size} font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} inline-block`} />
      {c.label}
    </span>
  )
}
