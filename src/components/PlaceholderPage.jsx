import { Construction } from 'lucide-react'

export default function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center">
        <Construction size={28} className="text-primary" />
      </div>
      <h2 className="text-xl font-bold text-gray-dark">{title}</h2>
      <p className="text-sm text-gray-mid">This section is coming in the next step.</p>
    </div>
  )
}
