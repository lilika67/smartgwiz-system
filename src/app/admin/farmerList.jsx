"use client"

import { useState, useEffect } from 'react'

const FarmersList = () => {
    const [farmers, setFarmers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })

    // Safe localStorage utility
    const getToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('authToken') || localStorage.getItem('token')
        }
        return null
    }

    const fetchFarmers = async (page = 1, limit = 10) => {
        setLoading(true)
        setError('')

        try {
            const token = getToken()
            if (!token) {
                setError('No authentication token found')
                setLoading(false)
                return
            }

            const response = await fetch(
                `https://smartgwiza-be-1.onrender.com/api/admin/farmers?page=${page}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (!response.ok) {
                if (response.status === 401) {
                    setError('Unauthorized - Please login again')
                    // Redirect to login or handle token refresh
                    return
                }
                if (response.status === 403) {
                    setError('Access denied - Admin privileges required')
                    return
                }
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            setFarmers(data.farmers || [])
            setPagination({
                page: data.page || 1,
                limit: data.limit || 10,
                total: data.total || 0,
                totalPages: data.total_pages || 0
            })
        } catch (err) {
            console.error('Error fetching farmers:', err)
            setError(err.message || 'Failed to fetch farmers data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFarmers(1, 10)
    }, [])

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchFarmers(newPage, pagination.limit)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Never'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatPhone = (phone) => {
        if (!phone) return ''
        // Format: +250 78 123 4567
        return phone.replace(/(\+250)(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4')
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700">{error}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Farmers Management</h2>
                    <div className="text-sm text-gray-500">
                        Total: {pagination.total} farmers
                    </div>
                </div>
            </div>

            {/* Farmers Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Farmer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                District
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Activity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Login
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {farmers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No farmers found
                                </td>
                            </tr>
                        ) : (
                            farmers.map((farmer, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {farmer.fullname}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {farmer.points} points
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {formatPhone(farmer.phone_number)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {farmer.district || 'Not specified'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            <div>Predictions: {farmer.prediction_count || 0}</div>
                                            <div>Submissions: {farmer.submission_count || 0}</div>
                                            {farmer.latest_yield && (
                                                <div className="text-green-600">
                                                    Latest Yield: {farmer.latest_yield} tons/ha
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${farmer.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {farmer.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(farmer.last_login)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing page {pagination.page} of {pagination.totalPages}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FarmersList