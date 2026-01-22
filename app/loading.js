
import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full opacity-20 animate-pulse"></div>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">Loading...</p>
                    <p className="text-sm text-gray-500 mt-1">Please wait</p>
                </div>
            </div>
        </div>
    )
}
