
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Printer, Loader2, Users, User, Phone, Calendar, Pencil, Trash2, HeartPulse } from 'lucide-react'
import { deletePatient } from '@/app/actions/patients'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import { toast } from 'react-hot-toast'

export default function PatientsPage() {
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(null)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedPatientId, setSelectedPatientId] = useState(null)
    const supabase = createClient()

    useEffect(() => {
        fetchPatients()
    }, [])

    const fetchPatients = async () => {
        const { data, error } = await supabase
            .from('patients')
            .select('*, doctor:profiles(full_name), shift:shifts(name)')
            .order('created_at', { ascending: false })

        if (data) setPatients(data)
        setLoading(false)
    }

    const confirmDelete = (id) => {
        setSelectedPatientId(id)
        setDeleteModalOpen(true)
    }

    const handleDelete = async () => {
        if (!selectedPatientId) return

        setDeleting(selectedPatientId)
        const result = await deletePatient(selectedPatientId)

        if (result.success) {
            setPatients(patients.filter(p => p.id !== selectedPatientId))
            toast.success('Patient record deleted successfully')
        } else {
            toast.error('Failed to delete: ' + result.error)
        }
        setDeleting(null)
        setDeleteModalOpen(false)
        setSelectedPatientId(null)
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
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Patient Record"
                message="Are you sure you want to delete this patient record? This action cannot be undone."
                confirmText="Delete"
                isDanger={true}
                loading={deleting === selectedPatientId}
            />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
                <p className="mt-2 text-gray-600">View and manage patient records</p>
            </div>

            {/* Patients List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {patients.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No patients found</p>
                        <p className="text-sm text-gray-400 mt-1">Register your first patient to get started</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {patients.map((patient) => (
                            <div key={patient.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {patient.full_name}
                                                </h3>
                                                {patient.gender && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                        {patient.gender}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span>Age: {patient.age || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span>{patient.contact_number || 'No contact'}</span>
                                                </div>
                                                {patient.diagnosis && (
                                                    <div className="flex items-start gap-2 col-span-1 sm:col-span-2 mt-1">
                                                        <HeartPulse className="w-4 h-4 text-gray-400 mt-0.5" />
                                                        <span className="truncate max-w-md" title={patient.diagnosis}>
                                                            {patient.diagnosis}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* <div className="mt-2 text-xs text-gray-500">
                                                Treated by: <span className="font-medium text-gray-700">{patient.doctor?.full_name || 'Unknown'}</span>
                                                {patient.shift?.name && (
                                                    <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                                                        {patient.shift.name}
                                                    </span>
                                                )}
                                            </div> */}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0 self-start md:self-center">
                                        <Link
                                            href={`/patients/${patient.id}/edit`}
                                            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </Link>
                                        <Link
                                            href={`/patients/${patient.id}/print`}
                                            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                            title="Print"
                                        >
                                            <Printer className="h-5 w-5" />
                                        </Link>
                                        <button
                                            onClick={() => confirmDelete(patient.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-5 w-5" />
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
