import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  UserCheck,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  CheckCheck,
} from 'lucide-react'
import api from '../services/axios'
import { formatCurrency } from '../utils/formatCurrency'

export function FinanceTeam() {
  const navigate = useNavigate()
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await api.get('/manager/team')
        if (res.data && res.data.data && Array.isArray(res.data.data)) {
          setTeam(res.data.data)
        } else {
          setTeam([])
        }
      } catch (err) {
        console.error('Failed to fetch finance team:', err)
        setError(err.response?.data?.message || 'Failed to load finance team list.')
        setTeam([])
      } finally {
        setLoading(false)
      }
    }
    fetchTeam()
  }, [])

  // Filtered by Search Query (Name or Email)
  const filteredTeam = useMemo(() => {
    if (!searchQuery.trim()) return team
    const query = searchQuery.toLowerCase().trim()
    return team.filter((member) => {
      const name = (member.user?.name || '').toLowerCase()
      const email = (member.user?.email || '').toLowerCase()
      return name.includes(query) || email.includes(query)
    })
  }, [team, searchQuery])

  // Pagination Logic
  const totalPages = Math.ceil(filteredTeam.length / itemsPerPage) || 1
  const paginatedTeam = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredTeam.slice(start, start + itemsPerPage)
  }, [filteredTeam, currentPage, itemsPerPage])

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-12"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 bg-white p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Finance Team</h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                View finance executives and their invoice activity.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
            Total Members: <span className="text-blue-600 font-black">{team.length}</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search finance executives..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition"
          />
        </div>

        <div className="text-xs font-bold text-slate-500">
          Showing {paginatedTeam.length} of {filteredTeam.length} Executives
        </div>
      </div>

      {/* Team Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-xs font-bold text-red-600">{error}</div>
        ) : paginatedTeam.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <UserCheck className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No finance executives found</p>
            <p className="text-xs text-slate-400 font-medium">
              {searchQuery ? 'Try matching another name or email.' : 'No members registered under Finance role yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Finance Executive</th>
                  <th className="py-3 px-3 text-center">Total Invoices</th>
                  <th className="py-3 px-3 text-center">Pending</th>
                  <th className="py-3 px-3 text-center">Approved</th>
                  <th className="py-3 px-3 text-center">Rejected</th>
                  <th className="py-3 px-3 text-center">Payment Queue</th>
                  <th className="py-3 px-3 text-center">Paid</th>
                  <th className="py-3 px-4 text-right">Total Value</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedTeam.map((member) => (
                  <tr
                    key={member.user._id}
                    className="hover:bg-slate-50/80 transition duration-150 group"
                  >
                    {/* Executive Details (Avatar, Name, Email) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            member.user.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user.name}`
                          }
                          alt={member.user.name}
                          className="h-8 w-8 rounded-full bg-slate-100 object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                            {member.user.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">{member.user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Statistics */}
                    <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                      {member.totalInvoices || member.invoices || 0}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-amber-600">
                      {member.pending || 0}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-emerald-600">
                      {member.approved || 0}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-red-600">
                      {member.rejected || 0}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-blue-600">
                      {member.paymentQueue || 0}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-emerald-700">
                      {member.paid || 0}
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      {formatCurrency(member.totalValue || 0)}
                    </td>

                    {/* View Details Action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => navigate(`/app/manager/team/${member.user._id}`)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-[11px] font-extrabold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition"
                      >
                        <span>View Details</span>
                        <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-xs font-bold text-slate-600">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default FinanceTeam
