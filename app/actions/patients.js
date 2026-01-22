
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPatient(formData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const full_name = formData.get('full_name')
    const contact_number = formData.get('contact_number')
    const age = formData.get('age')
    const gender = formData.get('gender')
    const diagnosis = formData.get('diagnosis')
    const shift_id = formData.get('shift_id')

    if (!full_name || !age) {
        return { error: 'Name and Age are required' }
    }

    // Insert patient
    const { error } = await supabase
        .from('patients')
        .insert([{
            full_name,
            contact_number,
            age: parseInt(age),
            gender,
            diagnosis,
            doctor_id: user.id,
            shift_id: shift_id || null
        }])

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/patients')
    return { success: true }
}

export async function updatePatient(id, formData) {
    const supabase = await createClient()

    const full_name = formData.get('full_name')
    const contact_number = formData.get('contact_number')
    const age = formData.get('age')
    const gender = formData.get('gender')
    const diagnosis = formData.get('diagnosis')

    const { error } = await supabase
        .from('patients')
        .update({
            full_name,
            contact_number,
            age: parseInt(age),
            gender,
            diagnosis
        })
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/patients')
    revalidatePath(`/patients/${id}`)
    return { success: true }
}

export async function deletePatient(id) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user is super_admin or the creator (optional strict check)
    // For now, RLS handles most, but we can double check role

    const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/patients')
    return { success: true }
}
