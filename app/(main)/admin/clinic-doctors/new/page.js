'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function NewDoctorPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.target)
        const doctorData = {
            name: formData.get('name'),
            specialization: formData.get('specialization'),
            qualification: formData.get('qualification'),
            contact_number: formData.get('contact_number'),
        }

        const { error } = await supabase
            .from('doctors')
            .insert([doctorData])

        if (error) {
            toast.error(error.message)
            setLoading(false)
        } else {
            toast.success('Doctor added successfully')
            router.push('/admin/clinic-doctors')
            router.refresh()
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/clinic-doctors"
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Add New Doctor</h1>
                    <p className="text-slate-500 mt-1">Add a doctor to the clinic registry</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Doctor Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            name="name"
                            type="text"
                            placeholder="Dr. John Doe"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Specialization
                        </label>
                        <input
                            name="specialization"
                            type="text"
                            placeholder="e.g. Orthodontist"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Qualification
                        </label>
                        <input
                            name="qualification"
                            type="text"
                            placeholder="e.g. BDS, MDS"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Contact Number
                        </label>
                        <input
                            name="contact_number"
                            type="tel"
                            placeholder="+1 234..."
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Check className="w-5 h-5" />
                        )}
                        {loading ? 'Adding...' : 'Add Doctor'}
                    </button>
                </div>
            </form>
        </div>
    )
}
