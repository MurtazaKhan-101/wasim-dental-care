
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createPatient } from '@/app/actions/patients'
import { UserPlus, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function NewPatientPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [currentShift, setCurrentShift] = useState(null)
    const [canAdd, setCanAdd] = useState(false)
    const [checking, setChecking] = useState(true)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        checkPermission()
    }, [])

    const checkPermission = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setChecking(false)
            return
        }

        const now = new Date()
        const currentTime = now.toLocaleTimeString('en-GB', { hour12: false })
        const currentDate = now.toISOString().split('T')[0]

        const { data: assignments } = await supabase
            .from('shift_assignments')
            .select(`
                *,
                shift:shifts(*)
            `)
            .eq('assignment_date', currentDate)
            .eq('doctor_id', user.id)

        const active = assignments?.find(a => {
            const { start_time, end_time } = a.shift
            if (start_time <= end_time) {
                return currentTime >= start_time && currentTime <= end_time
            } else {
                return currentTime >= start_time || currentTime <= end_time
            }
        })

        if (active) {
            setCurrentShift(active.shift)
            setCanAdd(true)
        } else {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
            if (profile?.role === 'super_admin') {
                setCanAdd(true)
            } else {
                setError("You are not currently assigned to an active shift. Only the in-charge doctor can add patients.")
            }
        }
        setChecking(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Form Data
        const formData = new FormData(e.target)
        // Add current shift
        if (currentShift) {
            formData.append('shift_id', currentShift.id)
        }

        const result = await createPatient(formData)

        if (result.error) {
            toast.error(result.error)
            setLoading(false)
        } else {
            toast.success('Patient registered successfully')
            router.push('/patients')
        }
    }

    if (checking) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-sm text-gray-600">Checking permissions...</p>
                </div>
            </div>
        )
    }

    if (!canAdd) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-semibold text-yellow-900">Restricted Access</h3>
                            <p className="mt-2 text-sm text-yellow-800">
                                {error || "You are not scheduled for the current shift."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Register New Patient</h1>
                {/* <p className="mt-2 text-gray-600">
                    Current Shift: <span className="font-semibold text-indigo-600">{currentShift?.name || 'Admin Override'}</span>
                </p> */}
            </div>

            {/* Form Card */}
            <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                name="full_name"
                                type="text"
                                required
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="Patient's full name"
                            />
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Age
                            </label>
                            <input
                                name="age"
                                type="number"
                                required
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="Age"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gender
                            </label>
                            <select
                                name="gender"
                                required
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Number
                            </label>
                            <input
                                name="contact_number"
                                type="text"
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="Contact number"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Diagnosis
                        </label>
                        <textarea
                            name="diagnosis"
                            rows={4}
                            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            placeholder="Enter detailed diagnosis (max 2000 chars)..."
                        />
                        <p className="mt-1 text-xs text-gray-500 text-right">Max 2000 characters</p>
                    </div>



                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Registering...
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-5 w-5" />
                                Register Patient
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
