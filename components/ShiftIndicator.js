
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, User } from 'lucide-react'

export default function ShiftIndicator() {
    const [inCharge, setInCharge] = useState(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        checkInCharge()
        const interval = setInterval(checkInCharge, 60000) // Check every minute
        return () => clearInterval(interval)
    }, [])

    const checkInCharge = async () => {
        const now = new Date()
        const currentTime = now.toLocaleTimeString('en-GB', { hour12: false })
        const currentDate = now.toISOString().split('T')[0]

        const { data: assignments } = await supabase
            .from('shift_assignments')
            .select(`
        *,
        doctor:profiles(full_name),
        shift:shifts(name, start_time, end_time)
      `)
            .eq('assignment_date', currentDate)

        if (assignments) {
            const active = assignments.find(a => {
                const { start_time, end_time } = a.shift
                if (start_time <= end_time) {
                    return currentTime >= start_time && currentTime <= end_time
                } else {
                    // Shift crosses midnight (e.g., 21:00 to 06:00)
                    return currentTime >= start_time || currentTime <= end_time
                }
            })
            setInCharge(active ? { name: active.doctor.full_name, shift: active.shift.name } : null)
        } else {
            setInCharge(null)
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="rounded-lg bg-slate-800/50 p-3 border border-slate-700/50">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 animate-pulse" />
                    <p className="text-xs text-slate-400">Checking shift...</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`rounded-lg p-3 border ${inCharge
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-slate-800/50 border-slate-700/50'
            }`}>
            <div className="flex items-center gap-2 mb-1">
                <Clock className={`w-4 h-4 ${inCharge ? 'text-green-400' : 'text-slate-400'}`} />
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                    Current In-Charge
                </p>
            </div>
            {inCharge ? (
                <div className="flex items-center gap-2 mt-2">
                    <User className="w-4 h-4 text-green-400" />
                    <div>
                        <p className="text-sm font-semibold text-green-400">
                            {inCharge.name}
                        </p>
                        <p className="text-xs text-slate-400">{inCharge.shift}</p>
                    </div>
                </div>
            ) : (
                <p className="text-sm font-medium text-slate-400 mt-1">
                    No Doctor Assigned
                </p>
            )}
        </div>
    )
}
