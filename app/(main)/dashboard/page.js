
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Calendar, Activity, Loader2 } from 'lucide-react'

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayVisits: 0,
        activeShifts: 0
    })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            // Total Patients
            const { count: totalPatients } = await supabase
                .from('patients')
                .select('*', { count: 'exact', head: true })

            // Today's Visits
            const today = new Date().toISOString().split('T')[0]
            const { count: todayVisits } = await supabase
                .from('patients')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', `${today}T00:00:00`)
                .lt('created_at', `${today}T23:59:59`)

            // Active Shifts
            const { count: activeShifts } = await supabase
                .from('shifts')
                .select('*', { count: 'exact', head: true })

            setStats({
                totalPatients: totalPatients || 0,
                todayVisits: todayVisits || 0,
                activeShifts: activeShifts || 0
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">Welcome to the Wasim Dental Care</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                                <dd className="text-2xl font-bold text-gray-900">
                                    {loading ? (
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                    ) : (
                                        stats.totalPatients
                                    )}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Activity className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Today's Visits</dt>
                                <dd className="text-2xl font-bold text-gray-900">
                                    {loading ? (
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                    ) : (
                                        stats.todayVisits
                                    )}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Active Shifts</dt>
                                <dd className="text-2xl font-bold text-gray-900">
                                    {loading ? (
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                    ) : (
                                        stats.activeShifts
                                    )}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <a
                        href="/patients/new"
                        className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                    >
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                            <svg className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Add Patient</p>
                            <p className="text-sm text-gray-500">Register new patient</p>
                        </div>
                    </a>

                    <a
                        href="/patients"
                        className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                    >
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                            <svg className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">View Patients</p>
                            <p className="text-sm text-gray-500">Browse patient records</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    )
}
