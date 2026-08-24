import { useState, useEffect, useCallback } from 'react'
import api from '../services/axios'
import { useAuth } from '../context/AuthContext'
import { FinanceDashboardView } from '../components/dashboard/FinanceDashboardView'
import { ManagerDashboardView } from '../components/dashboard/ManagerDashboardView'
import { toast } from 'react-hot-toast'

export function Dashboard() {
  const { user } = useAuth()

  const userRole = (user?.role || 'finance').toLowerCase()
  const isManager = userRole.includes('manager')

  // Dashboard Data State
  const [stats, setStats] = useState({})
  const [invoices, setInvoices] = useState([])
  const [activityTimeline, setActivityTimeline] = useState([])
  const [teamOverview, setTeamOverview] = useState([])
  const [attentionInvoices, setAttentionInvoices] = useState([])
  const [riskOverview, setRiskOverview] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Fetch stats & invoices (Backend automatically isolates data for Finance vs Manager)
      const [statsRes, invoicesRes, activityRes] = await Promise.all([
        api.get('/dashboard/stats').catch(() => ({ data: { data: {} } })),
        api.get('/invoices').catch(() => ({ data: { data: { invoices: [] } } })),
        api.get('/dashboard/activity').catch(() => ({ data: { data: [] } })),
      ])

      setStats(statsRes.data?.data || {})

      if (invoicesRes.data && invoicesRes.data.data && Array.isArray(invoicesRes.data.data.invoices)) {
        setInvoices(invoicesRes.data.data.invoices)
      } else {
        setInvoices([])
      }

      setActivityTimeline(Array.isArray(activityRes.data?.data) ? activityRes.data.data : [])

      // 2. Fetch manager specific data if logged in as Manager
      if (isManager) {
        const [teamRes, attentionRes, riskRes] = await Promise.all([
          api.get('/dashboard/team').catch(() => ({ data: { data: [] } })),
          api.get('/dashboard/attention').catch(() => ({ data: { data: [] } })),
          api.get('/dashboard/risk-overview').catch(() => ({ data: { data: {} } })),
        ])

        setTeamOverview(Array.isArray(teamRes.data?.data) ? teamRes.data.data : [])
        setAttentionInvoices(Array.isArray(attentionRes.data?.data) ? attentionRes.data.data : [])
        setRiskOverview(riskRes.data?.data || {})
      }
    } catch (err) {
      console.warn('[Dashboard] Could not fetch live dashboard datasets:', err)
    } finally {
      setLoading(false)
    }
  }, [isManager])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Handle Finance "Mark as Paid" action
  const handleMarkAsPaid = async (invoiceId) => {
    try {
      await api.patch(`/invoices/${invoiceId}/mark-paid`)
      toast.success('Invoice marked as PAID by Finance!')
      fetchDashboardData()
    } catch (err) {
      console.error('Failed to mark invoice as paid:', err)
      toast.error(err.response?.data?.message || 'Could not mark invoice as paid')
    }
  }

  if (isManager) {
    return (
      <ManagerDashboardView
        user={user}
        stats={stats}
        invoices={invoices}
        teamOverview={teamOverview}
        attentionInvoices={attentionInvoices}
        riskOverview={riskOverview}
        activityTimeline={activityTimeline}
        onRefresh={fetchDashboardData}
        loading={loading}
      />
    )
  }

  return (
    <FinanceDashboardView
      user={user}
      stats={stats}
      invoices={invoices}
      activityTimeline={activityTimeline}
      onMarkAsPaid={handleMarkAsPaid}
      onRefresh={fetchDashboardData}
      loading={loading}
    />
  )
}
