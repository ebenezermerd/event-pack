import Link from "next/link"
import { CalendarClock } from "lucide-react"

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="relative flex items-center">
        <CalendarClock className="h-7 w-7 text-primary-600" />
        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-gradient-to-r from-secondary-400 to-secondary-600" />
      </div>
      <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
        Event
        <span className="bg-gradient-to-r from-secondary-400 to-secondary-600 bg-clip-text text-transparent">Ease</span>
      </span>
    </Link>
  )
}
