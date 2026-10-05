import { Loader2 } from 'lucide-react'

export default function Loader({ fullScreen = false }) {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'h-screen' : 'py-16'}`}>
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
    </div>
  )
}