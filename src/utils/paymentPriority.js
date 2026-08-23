/**
 * Compute payment priority and days until due calculation helper
 */
export function getPaymentPriority(dueDateStr) {
  if (!dueDateStr || dueDateStr === '-' || dueDateStr === 'null') {
    return {
      priority: 'Scheduled',
      daysUntilDue: 999,
      label: 'Scheduled',
      badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
    }
  }

  const dateObj = new Date(dueDateStr)
  if (isNaN(dateObj.getTime())) {
    return {
      priority: 'Scheduled',
      daysUntilDue: 999,
      label: 'Scheduled',
      badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(dateObj)
  due.setHours(0, 0, 0, 0)

  const diffTime = due.getTime() - today.getTime()
  const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (daysUntilDue < 0) {
    const absDays = Math.abs(daysUntilDue)
    return {
      priority: 'Overdue',
      daysUntilDue,
      label: `Overdue by ${absDays} day${absDays === 1 ? '' : 's'}`,
      badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200',
    }
  } else if (daysUntilDue === 0) {
    return {
      priority: 'Due Soon',
      daysUntilDue: 0,
      label: 'Due Today',
      badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200',
    }
  } else if (daysUntilDue <= 7) {
    return {
      priority: 'Due Soon',
      daysUntilDue,
      label: `Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
      badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200',
    }
  } else {
    return {
      priority: 'Scheduled',
      daysUntilDue,
      label: `Due in ${daysUntilDue} days`,
      badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
    }
  }
}
