
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Printer, ArrowLeft } from 'lucide-react'

export default function PrintPrescriptionPage() {
    const { id } = useParams()
    const router = useRouter()
    const [patient, setPatient] = useState(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchPatient()
    }, [])

    const fetchPatient = async () => {
        // Fetch patient + doctor info
        const { data, error } = await supabase
            .from('patients')
            .select(`
                *,
                doctor:profiles(full_name)
            `)
            .eq('id', id)
            .single()

        if (data) setPatient(data)
        setLoading(false)
    }

    const handlePrint = () => {
        window.print()
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    )

    if (!patient) return <div>Patient not found</div>

    // Assuming the template matches the preview:
    // Patient Name at top left
    // Date/Time at top right
    // Age/Gender below name
    // Diagnosis below that

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:bg-white print:p-0">
            {/* Controls - Hidden on print */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-all"
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Prescription
                </button>
            </div>

            {/* A4 Container */}
            <div
                id="print-area"
                className="mx-auto bg-white shadow-xl print:shadow-none print:w-[210mm] print:h-[297mm] relative overflow-hidden"
                style={{
                    width: '210mm',
                    height: '297mm',
                    backgroundImage: 'url(/prescription-template.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* 
                   Coordinates based on visual estimation of A4 ratio.
                   Adjust top/left % or px to fit the template lines. 
                */}

                {/* Patient Name - Top Left Area */}
                <div className="absolute top-[16.5%] left-[16%] w-[40%] text-sm font-medium text-slate-800 font-sans">
                    {patient.full_name}
                </div>

                {/* Date - Top Right Area */}
                <div className="absolute top-[16.5%] left-[61%] w-[20%] text-sm font-medium text-slate-800 font-sans">
                    {new Date().toLocaleDateString('en-GB')}
                </div>

                {/* Time - Top Right Area (after Date) */}
                <div className="absolute top-[16.5%] left-[84%] w-[15%] text-sm font-medium text-slate-800 font-sans">
                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>

                {/* Age - 2nd Line Left */}
                <div className="absolute top-[19.75%] left-[6%] w-[15%] text-sm font-medium text-slate-800 font-sans text-center">
                    {patient.age} Y
                </div>

                {/* Gender - 2nd Line Left (estimated position) */}
                <div className="absolute top-[19.75%] left-[36%] w-[20%] text-sm font-medium text-slate-800 font-sans pl-2">
                    {patient.gender || '-'}
                </div>

                {/* Diagnosis - 2nd Line Right */}
                <div className="absolute top-[19.75%] left-[62%] w-[35%] text-sm font-medium text-slate-800 font-sans">
                    {patient.diagnosis || '-'}
                </div>

                {/* Reference No - Top Right Corner Header */}
                <div className="absolute top-[1.2%] left-[84.5%] w-[14.5%] text-center text-xs font-bold text-slate-800 font-sans bg-white">
                    {/* Ref No derived from ID or blank */}
                    {patient.id.slice(0, 6).toUpperCase()}
                </div>

                {/* Doctor Name / Signature - Bottom Right */}
                {/* The template has footer pre-printed names, but we might want to stamp the current doctor */}
                {/* Footer Doctor Name Overlay */}
                {/* 
                    Overlay a white box over the pre-printed names in the blue footer bar area.
                    Based on the snapshot, the blue bar is at the very bottom before the address footer.
                    Coordinates estimated: Bottom ~10%, height ~5%, width 100%.
                */}
                <div className="absolute bottom-[8.5%] left-0 w-full bg-[#1e5aa8] h-[35px] flex items-center justify-center">
                    <span
                        className="text-white font-bold text-lg font-sans"
                        style={{ width: '100%', textAlign: 'center', display: 'block' }}
                    >
                        Dr. {patient.doctor?.full_name || 'Wasim Dental Care'}
                    </span>
                </div>


                {/* Content Area - for user to type or write manually? 
                    The request is just to "fill in patient and shift doctor info".
                    We have done that in the fields above.
                */}
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    html, body {
                        height: 297mm !important;
                        overflow: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #print-area, #print-area * {
                        visibility: visible;
                    }
                    #print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 210mm;
                        height: 297mm;
                        margin: 0;
                        padding: 0;
                        background: white;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    )
}
