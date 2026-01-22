
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createShift, deleteShift } from '@/app/actions/shifts'
import { Trash2, Plus, Clock, Loader2, Pencil } from 'lucide-react'
import Link from 'next/link'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import { toast } from 'react-hot-toast'

export default function ShiftsPage() {
    const [shifts, setShifts] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [newShift, setNewShift] = useState({ name: '', start_time: '', end_time: '' })

    // Modal state
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null })
    const [deletingId, setDeletingId] = useState(null)

    const supabase = createClient()

    useEffect(() => {
        fetchShifts()
    }, [])

    const fetchShifts = async () => {
        const { data, error } = await supabase
            .from('shifts')
            .select('*')
            .order('start_time')
        if (data) setShifts(data)
        setLoading(false)
    }

    const handleAddShift = async (e) => {
        e.preventDefault()
        if (!newShift.name || !newShift.start_time || !newShift.end_time) return

        setSaving(true)
        const formData = new FormData()
        formData.append('name', newShift.name)
        formData.append('start_time', newShift.start_time)
        formData.append('end_time', newShift.end_time)

        const res = await createShift(formData)

        if (res.error) {
            toast.error(res.error)
        } else {
            setNewShift({ name: '', start_time: '', end_time: '' })
            toast.success('Shift created successfully')
            fetchShifts()
        }
        setSaving(false)
    }

    const confirmDelete = (id) => {
        setDeleteModal({ isOpen: true, id })
    }

    const handleDeleteShift = async () => {
        const id = deleteModal.id
        if (!id) return

        setDeletingId(id)

        const res = await deleteShift(id)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Shift deleted successfully')
            fetchShifts()
        }
        setDeleteModal({ isOpen: false, id: null })
        setDeletingId(null)
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
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDeleteShift}
                title="Delete Shift"
                message="Are you sure you want to delete this shift? This action cannot be undone."
                confirmText="Delete"
                isDanger={true}
                loading={deletingId === deleteModal.id}
            />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Shifts</h1>
                <p className="mt-2 text-gray-600">Define clinic operating shifts and schedules</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Existing Shifts */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Existing Shifts</h2>
                    </div>

                    {shifts.length === 0 ? (
                        <div className="text-center py-8">
                            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No shifts defined yet</p>
                            <p className="text-sm text-gray-400 mt-1">Create your first shift to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {shifts.map((shift) => (
                                <div
                                    key={shift.id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                            <Clock className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{shift.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {shift.start_time} - {shift.end_time}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/admin/shifts/${shift.id}/edit`}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                            title="Edit shift"
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </Link>
                                        <button
                                            onClick={() => confirmDelete(shift.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete shift"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add New Shift */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Plus className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Add New Shift</h2>
                    </div>

                    <form onSubmit={handleAddShift} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Shift Name
                            </label>
                            <input
                                type="text"
                                required
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="e.g., Morning, Evening"
                                value={newShift.name}
                                onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    required
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    value={newShift.start_time}
                                    onChange={(e) => setNewShift({ ...newShift, start_time: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    required
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    value={newShift.end_time}
                                    onChange={(e) => setNewShift({ ...newShift, end_time: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    Add Shift
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
