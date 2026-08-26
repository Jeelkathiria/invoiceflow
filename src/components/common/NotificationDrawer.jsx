import { useState, useEffect } from 'react'
import { X, Bell, CheckCircle2, AlertTriangle, Sparkles, ArrowRight, ShieldAlert, Trash2, CheckCheck, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/axios'

function formatTimeAgo(dateString) {
  if (!dateString) return 'Just now'
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationDrawer({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifications')
      if (res.data && res.data.data) {
        const list = res.data.data.notifications || []
        setNotifications(list)
        setUnreadCount(res.data.data.unreadCount || list.filter((n) => !n.read).length)
      }
    } catch (err) {
      console.warn('[NotificationDrawer] Error fetching notifications:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read')
      setNotifications([])
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    } finally {
      onClose()
    }
  }

  const handleItemClick = async (item) => {
    try {
      await api.put(`/notifications/${item._id}/read`)
      setNotifications((prev) => prev.filter((n) => n._id !== item._id))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark notification read:', err)
    }
    onClose()
    if (item.link) {
      navigate(item.link)
    }
  }

  const handleDeleteItem = async (e, id) => {
    e.stopPropagation()
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
      const remainingUnread = notifications.filter((n) => n._id !== id && !n.read).length
      setUnreadCount(remainingUnread)
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const handleClearAll = async () => {
    try {
      await api.delete('/notifications/clear-all')
      setNotifications([])
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to clear notifications:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between">
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Notifications</h2>
                  <p className="text-xs text-slate-400">
                    {unreadCount > 0 ? `${unreadCount} unread operational alerts` : 'All alerts read'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/60 px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
                    <span>Read All</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="rounded-xl border border-slate-800 bg-slate-800/60 p-2 text-slate-400 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notification List from MongoDB */}
            <div className="mt-4 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {loading ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span>Fetching MongoDB notifications...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center text-xs text-slate-500 font-medium">
                  <Bell className="h-8 w-8 text-slate-600 mx-auto mb-2 opacity-50" />
                  No active notifications found in MongoDB.
                </div>
              ) : (
                notifications.map((item) => {
                  const titleDisplay = item.title === 'Invoice Approved' ? 'Manager Approved (Payment Pending)' : item.title === 'Payment Confirmed' ? 'Payment Confirmed & Disbursed' : item.title
                  const messageDisplay = item.message && item.message.includes('has been approved and added to the Payment Queue')
                    ? item.message.replace('has been approved and added to the Payment Queue', 'was approved by Manager and sent to Payment Queue (Pending Finance Confirmation)')
                    : item.message && item.message.includes('has been marked as paid')
                    ? item.message.replace('has been marked as paid', 'was confirmed & paid by Finance Department')
                    : item.message

                  return (
                    <div
                      key={item._id}
                      onClick={() => handleItemClick(item)}
                      className={`group relative p-4 rounded-2xl border transition cursor-pointer ${
                        !item.read
                          ? 'border-blue-500/40 bg-slate-800/80 shadow-xs'
                          : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {item.type === 'warning' && <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />}
                          {item.type === 'danger' && <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />}
                          {item.type === 'info' && <Sparkles className="h-4 w-4 shrink-0 text-blue-400" />}
                          {item.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
                          <span className={`text-xs font-bold truncate ${!item.read ? 'text-white font-extrabold' : 'text-slate-300'}`}>
                            {titleDisplay}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-semibold text-slate-500">
                            {formatTimeAgo(item.createdAt)}
                          </span>
                          <button
                            onClick={(e) => handleDeleteItem(e, item._id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition"
                            title="Delete notification"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{messageDisplay}</p>

                      {!item.read && (
                        <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-slate-900"></span>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-slate-800 pt-4 flex items-center justify-between gap-3">
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear All
              </button>
            )}

            <button
              onClick={() => {
                onClose()
                navigate('/app/approval-queue')
              }}
              className="ml-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500 shadow-sm"
            >
              <span>Approval Queue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
