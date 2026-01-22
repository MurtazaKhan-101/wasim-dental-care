
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar as CalendarIcon, Save, Loader2, UserCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AssignmentsPage() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [shifts, setShifts] = useState([])
    const [doctors, setDoctors] = useState([])
    const [assignments, setAssignments] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(null)

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [date])

    const fetchData = async () => {
        setLoading(true)

        const { data: shiftsData } = await supabase
            .from('shifts')
            .select('*')
            .order('start_time')

        const { data: doctorsData } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('role', ['doctor', 'sub_doctor', 'super_admin'])
            .eq('is_active', true)

        const { data: assignmentsData } = await supabase
            .from('shift_assignments')
            .select('shift_id, doctor_id')
            .eq('assignment_date', date)

        const assignmentMap = {}
        if (assignmentsData) {
            assignmentsData.forEach(a => {
                assignmentMap[a.shift_id] = a.doctor_id
            })
        }

        setShifts(shiftsData || [])
        setDoctors(doctorsData || [])
        setAssignments(assignmentMap)
        setLoading(false)
    }

    const handleAssignmentChange = (shiftId, doctorId) => {
        setAssignments(prev => ({
            ...prev,
            [shiftId]: doctorId
        }))
    }

    const handleSave = async (shiftId) => {
        setSaving(shiftId)
        const doctorId = assignments[shiftId]

        if (!doctorId) {
            const { error: deleteError } = await supabase
                .from('shift_assignments')
                .delete()
                .match({ shift_id: shiftId, assignment_date: date })

            if (deleteError) {
                toast.error('Error removing assignment: ' + deleteError.message)
            } else {
                toast.success('Assignment removed')
            }
            setSaving(null)
            return
        }

        const { error } = await supabase
            .from('shift_assignments')
            .upsert({
                shift_id: shiftId,
                assignment_date: date,
                doctor_id: doctorId
            }, { onConflict: 'shift_id, assignment_date' })

        if (error) {
            toast.error('Error saving assignment: ' + error.message)
        } else {
            toast.success('Assignment saved')
        }

        setSaving(null)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Shift Assignments</h1>
                <p className="mt-2 text-gray-600">Assign doctors to shifts for specific dates</p>
            </div>

            {/* Date Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                    <CalendarIcon className="w-5 h-5 text-indigo-600" />
                    <label className="text-sm font-medium text-gray-700">Select Date:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </div>
            </div>

            {/* Assignments List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {shifts.length === 0 ? (
                    <div className="text-center py-12">
                        <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No shifts defined</p>
                        <p className="text-sm text-gray-400 mt-1">Create shifts first to assign doctors</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {shifts.map((shift) => (
                            <div key={shift.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{shift.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {shift.start_time} - {shift.end_time}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <select
                                            className="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all min-w-[200px]"
                                            value={assignments[shift.id] || ''}
                                            onChange={(e) => handleAssignmentChange(shift.id, e.target.value)}
                                        >
                                            <option value="">-- Select Doctor --</option>
                                            {doctors.map(doc => (
                                                <option key={doc.id} value={doc.id}>
                                                    {doc.full_name || doc.email}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={() => handleSave(shift.id)}
                                            disabled={saving === shift.id}
                                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            {saving === shift.id ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    Save
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
