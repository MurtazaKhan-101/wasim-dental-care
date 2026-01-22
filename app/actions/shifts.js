
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createShift(formData) {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Ideally check if super_admin in profiles, but RLS will block if not.

    const name = formData.get('name')
    const start_time = formData.get('start_time')
    const end_time = formData.get('end_time')

    if (!name || !start_time || !end_time) {
        return { error: 'All fields are required' }
    }

    const { error } = await supabase
        .from('shifts')
        .insert([{ name, start_time, end_time }])

    if (error) return { error: error.message }

    revalidatePath('/admin/shifts')
    return { success: true }
}

export async function updateShift(id, formData) {
    const supabase = await createClient()

    const name = formData.get('name')
    const start_time = formData.get('start_time')
    const end_time = formData.get('end_time')

    const { error } = await supabase
        .from('shifts')
        .update({ name, start_time, end_time })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/shifts')
    return { success: true }
}

export async function deleteShift(id) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/shifts')
    return { success: true }
}
