
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { inviteDoctor, toggleDoctorStatus, deleteDoctor, resendInvite, sendPasswordReset } from '@/app/actions/admin'
import { UserPlus, UserX, UserCheck, Loader2, Mail, Stethoscope, Trash2, RefreshCcw, Key } from 'lucide-react'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import { toast } from 'react-hot-toast'

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)
    const [inviting, setInviting] = useState(false)
    const [actionLoading, setActionLoading] = useState(null)

    // Modal states
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        isDanger: false,
        confirmText: 'Confirm'
    })

    const supabase = createClient()

    useEffect(() => {
        fetchDoctors()
    }, [])

    const fetchDoctors = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setDoctors(data)
        setLoading(false)
    }

    const openConfirmModal = (config) => {
        setConfirmModal({ ...config, isOpen: true })
    }

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
    }

    const handleInvite = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)

        setInviting(true)

        const res = await inviteDoctor(formData)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Invitation sent successfully!')
            e.target.reset()
            fetchDoctors()
        }
        setInviting(false)
    }

    const handleToggleStatus = (id, currentStatus) => {
        openConfirmModal({
            title: `${currentStatus ? 'Deactivate' : 'Activate'} Doctor`,
            message: `Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this doctor?`,
            confirmText: currentStatus ? 'Deactivate' : 'Activate',
            isDanger: currentStatus,
            onConfirm: async () => {
                // Optimistic update
                setDoctors(doctors.map(d => d.id === id ? { ...d, is_active: !currentStatus } : d))
                closeConfirmModal()

                const res = await toggleDoctorStatus(id, currentStatus)
                if (res.error) {
                    toast.error(res.error)
                    fetchDoctors() // Revert
                } else {
                    toast.success(`Doctor ${currentStatus ? 'deactivated' : 'activated'} successfully`)
                }
            }
        })
    }

    const handleDelete = (id) => {
        openConfirmModal({
            title: 'Delete Doctor',
            message: 'Are you sure you want to PERMANENTLY delete this doctor? This will remove their account and all their shift assignments.',
            confirmText: 'Delete Permanently',
            isDanger: true,
            onConfirm: async () => {
                setActionLoading(id)
                // Keep modal open or close? Let's close and show loading via toast or button state
                closeConfirmModal()

                const toastId = toast.loading('Deleting doctor...')
                const res = await deleteDoctor(id)

                if (res.error) {
                    toast.error(res.error, { id: toastId })
                } else {
                    toast.success('Doctor deleted successfully', { id: toastId })
                    fetchDoctors()
                }
                setActionLoading(null)
            }
        })
    }

    const handleResendInvite = async (email, id) => {
        setActionLoading(id)
        const toastId = toast.loading('Resending invitation...')

        const res = await resendInvite(email)
        if (res.error) {
            toast.error(res.error, { id: toastId })
        } else {
            toast.success('Invitation resent successfully!', { id: toastId })
        }
        setActionLoading(null)
    }

    const handleResetPassword = (email, id) => {
        openConfirmModal({
            title: 'Send Password Reset',
            message: `Send password reset email to ${email}?`,
            confirmText: 'Send Email',
            isDanger: false,
            onConfirm: async () => {
                closeConfirmModal()
                setActionLoading(id)
                const toastId = toast.loading('Sending reset email...')

                const res = await sendPasswordReset(email)
                if (res.error) {
                    toast.error(res.error, { id: toastId })
                } else {
                    toast.success('Password reset email sent!', { id: toastId })
                }
                setActionLoading(null)
            }
        })
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
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                isDanger={confirmModal.isDanger}
            />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Doctor Management</h1>
                <p className="mt-2 text-gray-600">Invite and manage clinic doctors</p>
            </div>

            {/* Invite Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Invite New Doctor</h2>
                </div>

                <form onSubmit={handleInvite} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                name="full_name"
                                type="text"
                                required
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="Dr. John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="doctor@clinic.com"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={inviting}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {inviting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Sending Invitation...
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-4 w-4" />
                                Send Invitation
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Doctors List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">All Doctors</h2>
                </div>

                {doctors.length === 0 ? (
                    <div className="text-center py-12">
                        <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No doctors yet</p>
                        <p className="text-sm text-gray-400 mt-1">Invite your first doctor to get started</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {doctors.map((doc) => (
                            <div key={doc.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Stethoscope className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {doc.full_name || 'No Name'}
                                            </p>
                                            <p className="text-sm text-gray-500">{doc.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {doc.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                                <span className="text-xs text-gray-500 capitalize">
                                                    {doc.role.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {doc.role !== 'super_admin' && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <button
                                                onClick={() => handleToggleStatus(doc.id, doc.is_active)}
                                                className={`p-2 rounded-lg transition-all ${doc.is_active
                                                    ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                                    }`}
                                                title={doc.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                {doc.is_active ? (
                                                    <UserX className="w-5 h-5" />
                                                ) : (
                                                    <UserCheck className="w-5 h-5" />
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleResendInvite(doc.email, doc.id)}
                                                disabled={actionLoading === doc.id}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Resend Invite"
                                            >
                                                <RefreshCcw className="w-5 h-5" />
                                            </button>

                                            <button
                                                onClick={() => handleResetPassword(doc.email, doc.id)}
                                                disabled={actionLoading === doc.id}
                                                className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                title="Send Password Reset"
                                            >
                                                <Key className="w-5 h-5" />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                disabled={actionLoading === doc.id}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete Doctor"
                                            >
                                                {actionLoading === doc.id ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
