
import { createClient } from '@/lib/supabase/server'

export async function getCurrentInCharge() {
    const supabase = await createClient()

    // Get current time/date
    const now = new Date()
    const currentTime = now.toLocaleTimeString('en-GB', { hour12: false }) // HH:MM:SS
    const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD

    // Query assignments for today
    const { data: assignments, error } = await supabase
        .from('shift_assignments')
        .select(`
      *,
      doctor:profiles(full_name, id),
      shift:shifts(name, start_time, end_time)
    `)
        .eq('assignment_date', currentDate)

    if (error || !assignments) return null

    // Filter in memory for time range (Supabase/Postgres time range can be tricky with simple queries)
    const activeAssignment = assignments.find((a) => {
        return currentTime >= a.shift.start_time && currentTime <= a.shift.end_time
    })

    return activeAssignment ? activeAssignment.doctor : null
}
