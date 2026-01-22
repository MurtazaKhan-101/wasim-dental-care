
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { redirect } from 'next/navigation'

export default async function MainLayout({ children }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar userRole={profile?.role} />
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar userProfile={profile} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    )
}
