
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Bell, Search } from 'lucide-react'

export default function TopBar({ userProfile }) {
    const [profile, setProfile] = useState(userProfile)
    const supabase = createClient()

    useEffect(() => {
        if (userProfile) return

        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setProfile(data)
            }
        }
        getProfile()
    }, [userProfile])

    return (
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
            {/* Left side: Search or Title */}
            <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-md w-full hidden md:block">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </span>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                        placeholder="Search patients, records..."
                    />
                </div>
            </div>

            {/* Right side: User Info */}
            <div className="flex items-center gap-6">
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <Bell className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-sm font-semibold text-gray-900 leading-none">
                            {profile?.full_name || 'Loading...'}
                        </span>
                        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mt-1">
                            {profile?.role?.replace('_', ' ') || 'User'}
                        </span>
                    </div>

                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md border-2 border-white">
                        {profile?.full_name ? (
                            <span className="font-bold text-sm">
                                {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                        ) : (
                            <User className="h-5 w-5" />
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
