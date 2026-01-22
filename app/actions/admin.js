
'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Note: We use a separate client with SERVICE_ROLE key for admin actions
// that regular RLS/Auth policies might restrict (like creating users without public signup).
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function inviteDoctor(formData) {
    const email = formData.get('email')
    const fullName = formData.get('full_name')

    if (!email) return { error: 'Email is required' }

    // 1. Create Auth User (Invite)
    const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`

    const { data: { user }, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName },
        redirectTo,
    })

    if (inviteError) {
        return { error: inviteError.message }
    }

    // 2. Manual Profile Creation (Safe Fallback)
    if (user) {
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: user.id,
                email: email,
                full_name: fullName,
                role: 'sub_doctor', // Default role
                is_active: true
            }, { onConflict: 'id' })

        if (profileError) {
            console.error("Profile creation failed:", profileError)
        }
    }

    revalidatePath('/admin/doctors')
    return { success: true }
}

export async function toggleDoctorStatus(id, currentStatus) {
    const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/doctors')
    return { success: true }
}

export async function deleteDoctor(id) {
    // Delete from auth.users, cascade will handle profiles and assignments
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (error) return { error: error.message }

    revalidatePath('/admin/doctors')
    return { success: true }
}

export async function resendInvite(email) {
    // Resend invite logic is basically inviting again
    const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`

    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo
    })

    if (error) return { error: error.message }

    return { success: true }
}

export async function sendPasswordReset(email) {
    const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`

    // Supabase generateLink type 'magiclink' or 'recovery'
    // 'generateLink' returns the link, doesn't send email. 
    // 'resetPasswordForEmail' sends the email.

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo
    })

    if (error) return { error: error.message }

    return { success: true }
}
