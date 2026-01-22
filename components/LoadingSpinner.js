
import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ text = 'Loading...' }) {
    return (
        <div className="flex items-center justify-center gap-3 p-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="text-sm text-gray-600">{text}</span>
        </div>
    )
}

export function PageLoader({ text = 'Loading...' }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="text-sm text-gray-600">{text}</p>
            </div>
        </div>
    )
}
