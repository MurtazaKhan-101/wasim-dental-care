'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Trash2, Edit, Stethoscope, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import ConfirmationModal from '@/components/ui/ConfirmationModal'

export default function ClinicDoctorsPage() {
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null })

    const supabase = createClient()

    useEffect(() => {
        fetchDoctors()
    }, [])

    const fetchDoctors = async () => {
        const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .order('name', { ascending: true })

        if (error) {
            toast.error('Failed to fetch doctors')
        } else {
            setDoctors(data)
        }
        setLoading(false)
    }

    const handleDelete = async () => {
        if (!deleteModal.id) return

        const toastId = toast.loading('Deleting doctor...')
        const { error } = await supabase
            .from('doctors')
            .delete()
            .eq('id', deleteModal.id)

        if (error) {
            toast.error('Failed to delete doctor', { id: toastId })
        } else {
            toast.success('Doctor deleted successfully', { id: toastId })
            setDoctors(doctors.filter(d => d.id !== deleteModal.id))
        }
        setDeleteModal({ isOpen: false, id: null })
    }

    const filteredDoctors = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Delete Doctor"
                message="Are you sure you want to delete this doctor? This action cannot be undone."
                confirmText="Delete"
                isDanger={true}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Clinic Doctors</h1>
                    <p className="text-slate-500 mt-1">Manage doctors list for prescriptions and reports</p>
                </div>
                <Link
                    href="/admin/clinic-doctors/new"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Doctor
                </Link>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search doctors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {filteredDoctors.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <Stethoscope className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No doctors found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredDoctors.map((doctor) => (
                            <div key={doctor.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                                        {doctor.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-800">{doctor.name}</h3>
                                        <p className="text-sm text-slate-500">
                                            {doctor.specialization}
                                            {doctor.qualification && ` • ${doctor.qualification}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link
                                        href={`/admin/clinic-doctors/${doctor.id}/edit`}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: true, id: doctor.id })}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
