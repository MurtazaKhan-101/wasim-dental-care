
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Users, Calendar, LogOut, UserPlus, LayoutDashboard, Stethoscope } from 'lucide-react'
import ShiftIndicator from './ShiftIndicator'
import ConfirmationModal from './ui/ConfirmationModal'
import { toast } from 'react-hot-toast'

export default function Sidebar({ userRole }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [role, setRole] = useState(userRole)
    const [logoutModalOpen, setLogoutModalOpen] = useState(false)

    useEffect(() => {
        if (userRole) return

        const fetchRole = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                if (data) setRole(data.role)
            }
        }
        fetchRole()
    }, [supabase, userRole])

    const handleLogout = async () => {
        const toastId = toast.loading('Logging out...')
        await supabase.auth.signOut()
        toast.success('Logged out successfully', { id: toastId })
        router.push('/login')
        router.refresh()
    }

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Add Patient', href: '/patients/new', icon: UserPlus },
        { name: 'Patients List', href: '/patients', icon: Users },
        // { name: 'Doctors', href: '/admin/doctors', icon: Stethoscope, adminOnly: true },
        { name: 'Clinic Doctors', href: '/admin/clinic-doctors', icon: UserPlus, adminOnly: true },
        // { name: 'Shifts', href: '/admin/shifts', icon: Calendar, adminOnly: true },
        // { name: 'Assignments', href: '/admin/assignments', icon: Calendar, adminOnly: true },
    ]

    const filteredNavigation = navigation.filter(item => {
        if (!item.adminOnly) return true
        return role === 'super_admin' // Only super_admin sees adminOnly items
    })

    return (
        <div className="flex h-full w-64 flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl">
            <ConfirmationModal
                isOpen={logoutModalOpen}
                onClose={() => setLogoutModalOpen(false)}
                onConfirm={handleLogout}
                title="Sign Out"
                message="Are you sure you want to log out of your account?"
                confirmText="Sign Out"
                isDanger={true}
            />

            {/* Logo */}
            <div className="flex h-16 items-center justify-center border-b border-slate-700/50 bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                        Wasim Dental Care
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {filteredNavigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-all ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                                        }`}
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-slate-700/50 p-4 space-y-3">
                {/* <ShiftIndicator /> */}
                <button
                    onClick={() => setLogoutModalOpen(true)}
                    className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                    <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-400 transition-all" />
                    Sign out
                </button>
            </div>
        </div>
    )
}
