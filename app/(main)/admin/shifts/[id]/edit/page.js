
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateShift } from '@/app/actions/shifts'
import { Save, Loader2, ArrowLeft, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function EditShiftPage({ params }) {
    const { id } = use(params);
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState(null)
    const [defaultValues, setDefaultValues] = useState(null)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchShift = async () => {
            const { data, error } = await supabase
                .from('shifts')
                .select('*')
                .eq('id', id)
                .single()

            if (data) {
                setDefaultValues(data)
            } else {
                setError('Shift not found')
            }
            setFetching(false)
        }
        fetchShift()
    }, [id])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.target)
        const result = await updateShift(id, formData)

        if (result.error) {
            toast.error(result.error)
            setLoading(false)
        } else {
            toast.success('Shift updated successfully')
            router.push('/admin/shifts')
            router.refresh()
        }
    }

    if (fetching) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    if (!defaultValues) {
        return <div>Shift not found</div>
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Shift</h1>
                    <p className="mt-2 text-gray-600">Update shift details</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Shift Configuration</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Shift Name
                        </label>
                        <input
                            name="name"
                            type="text"
                            required
                            defaultValue={defaultValues.name}
                            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            placeholder="e.g., Morning, Evening"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Time
                            </label>
                            <input
                                name="start_time"
                                type="time"
                                required
                                defaultValue={defaultValues.start_time}
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Time
                            </label>
                            <input
                                name="end_time"
                                type="time"
                                required
                                defaultValue={defaultValues.end_time}
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>
                    </div>



                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
