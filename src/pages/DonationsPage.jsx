import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Money01Icon,
  Search01Icon,
  RefreshIcon,
  FilterIcon,
  Calendar02Icon
} from '@hugeicons/core-free-icons'

import KpiCard from '../components/ui/KpiCard'
import DataTable from '../components/ui/DataTable'
import Toast from '../components/ui/Toast'
import Dialog from '../components/ui/Dialog'
import { templeClient } from '../api/axiosClient'

const DonationsPage = () => {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [selected, setSelected] = useState(new Set())

  // Filter States
  const [search, setSearch] = useState('')
  const [dateRangePreset, setDateRangePreset] = useState('') // '', 'today', 'yesterday', '7days', '30days', 'custom'
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [donationType, setDonationType] = useState('')
  const [availableTypes, setAvailableTypes] = useState([])

  // Auto-suggestions states
  const [suggestions, setSuggestions] = useState({ names: [], mobiles: [] })
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Toast State
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Dialog State
  const [dialogConfig, setDialogConfig] = useState(null)

  // Metrics
  const [metrics, setMetrics] = useState({
    totalDonations: 0,
  })

  // Fetch unique donation types from backend on mount
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await templeClient.get('/admin/donations-pledges', {
          params: { distinctTypes: 'true' }
        })
        if (res.data?.success) {
          setAvailableTypes(res.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch donation types:', err)
      }
    }
    fetchTypes()
  }, [])

  // Debounce search and fetch suggestions
  useEffect(() => {
    if (!search.trim()) {
      setSuggestions({ names: [], mobiles: [] })
      return
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await templeClient.get('/admin/donations-pledges', {
          params: { suggestions: 'true', search: search.trim() }
        })
        if (res.data?.success) {
          setSuggestions(res.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch suggestions:', err)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [search])

  const fetchDonations = async (overrideSearch) => {
    setLoading(true)
    setError(null)
    try {
      const offset = (page - 1) * pageSize
      const activeSearch = typeof overrideSearch === 'string' ? overrideSearch : search

      let activeStartDate = startDate || undefined
      let activeEndDate = endDate || undefined

      if (dateRangePreset === 'today') {
        const today = new Date().toISOString().split('T')[0]
        activeStartDate = today
        activeEndDate = today
      } else if (dateRangePreset === 'yesterday') {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        activeStartDate = yesterday
        activeEndDate = yesterday
      } else if (dateRangePreset === '7days') {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
        activeStartDate = sevenDaysAgo
        activeEndDate = new Date().toISOString().split('T')[0]
      } else if (dateRangePreset === '30days') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
        activeStartDate = thirtyDaysAgo
        activeEndDate = new Date().toISOString().split('T')[0]
      }

      const res = await templeClient.get('/admin/donations-pledges', {
        params: {
          limit: pageSize,
          offset,
          search: activeSearch.trim() || undefined,
          startDate: activeStartDate,
          endDate: activeEndDate,
          type_of_donation: donationType.trim() || undefined
        }
      })

      if (res.data?.success) {
        const list = res.data.data.list || []
        const totalCount = res.data.data.total || 0
        setRows(list)
        setTotal(totalCount)

        setMetrics({
          totalDonations: totalCount,
        })
      } else {
        setError('Failed to load donations.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load donations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDonations()
  }, [page, pageSize, startDate, endDate, donationType, dateRangePreset])

  const handleSendPaymentLink = (id) => {
    setDialogConfig({
      type: 'prompt',
      title: 'Send Payment Link',
      message: 'Enter Razorpay / Payment Link (Optional):',
      defaultValue: 'https://rzp.io/l/donation',
      onConfirm: async (link) => {
        try {
          const res = await templeClient.post(`/admin/donations-pledges/${id}/send-payment-link`, {
            paymentLink: link
          })
          if (res.data?.success) {
            showToast("Payment link sent successfully via WhatsApp!")
          } else {
            showToast("Failed to send payment link.", "error")
          }
        } catch (err) {
          console.error(err)
          showToast("Error sending payment link.", "error")
        }
      }
    })
  }

  const handleMarkAsPaid = (id) => {
    setDialogConfig({
      type: 'confirm',
      title: 'Mark as Paid',
      message: 'Are you sure you want to mark this donation as completed/paid?',
      onConfirm: async () => {
        try {
          const res = await templeClient.patch(`/admin/donations-pledges/${id}`, {
            status: 'COMPLETED'
          })
          if (res.data?.success) {
            showToast("Status updated to COMPLETED!")
            fetchDonations() // refresh list
          } else {
            showToast("Failed to update status.", "error")
          }
        } catch (err) {
          console.error(err)
          showToast("Error updating status.", "error")
        }
      }
    })
  }

  // Updated Column Order: Name -> Donation Detail -> Date -> Time -> Mobile -> Status -> Actions
  const columns = [
    { key: 'name', label: 'Donor Name', defaultWidth: 150 },
    { key: 'type_of_donation', label: 'Donation Detail', defaultWidth: 200 },
    { key: 'date', label: 'Date', defaultWidth: 120 },
    { key: 'time', label: 'Time', defaultWidth: 100 },
    { key: 'mobile_number', label: 'Mobile Number', defaultWidth: 150 },
    {
      key: 'status',
      label: 'Status',
      defaultWidth: 120,
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            row.status === 'COMPLETED'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
          }`}
        >
          {row.status || 'PENDING'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      defaultWidth: 220,
      render: (row) => {
        const isCompleted = (row.status || 'PENDING') === 'COMPLETED';
        if (isCompleted) {
          return (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg select-none cursor-default">
              Payment Paid ✓
            </span>
          );
        }
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleSendPaymentLink(row.id)}
              className="px-2.5 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary-dark transition-all"
            >
              Send Pay Link
            </button>
            <button
              onClick={() => handleMarkAsPaid(row.id)}
              className="px-2.5 py-1.5 bg-green-600 text-white text-[10px] font-bold rounded-lg hover:bg-green-700 transition-all"
            >
              Mark Paid
            </button>
          </div>
        );
      }
    }
  ]

  const formattedRows = rows.map((row) => {
    const d = new Date(row.createdAt);
    return {
      ...row,
      name: row.name || 'Anonymous Donor',
      type_of_donation: row.type_of_donation || 'General Donation',
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  })

  return (
    <div className="tab-enter px-4 sm:px-6 lg:px-8 pb-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mt-6 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://omgofficial.com/omg-logo.png" 
              alt="OMG Logo" 
              className="md:hidden h-8 w-auto object-contain" 
            />
            <div>
              <h1 className="text-2xl font-extrabold text-primary">Donations & Pledges</h1>
              <p className="text-gray-400 text-sm font-medium mt-0.5">Manage and review WhatsApp donations and pledges.</p>
            </div>
          </div>
          <button
            onClick={() => fetchDonations()}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
            title="Refresh Data"
          >
            <HugeiconsIcon icon={RefreshIcon} size={16} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <KpiCard
          title="Total Donations/Pledges"
          value={metrics.totalDonations}
          icon={Money01Icon}
          gradientClass="kpi-2"
          subtitle="Pledged submissions logged"
        />
        <KpiCard
          title="Monthly Goal"
          value="$5,000"
          icon={Money01Icon}
          gradientClass="kpi-4"
          subtitle="Target campaign progress"
        />
      </div>

      {/* Filter Toolbar & DataTable */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        {/* Responsive Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="font-extrabold text-gray-800 text-base shrink-0">Submissions Log</h2>
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
            {/* Search Input with Auto-suggestions */}
            <div className="relative w-full md:w-60">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search name or phone..."
                className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-gray-50/50"
              />
              <button 
                onClick={() => fetchDonations()} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary flex items-center"
              >
                <HugeiconsIcon icon={Search01Icon} size={15} />
              </button>

              {showSuggestions && (
                /^\d+$/.test(search.trim()) ? (
                  suggestions.mobiles?.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto p-2">
                      {suggestions.mobiles.map(mobile => (
                        <div
                          key={mobile}
                          onClick={() => {
                            setSearch(mobile)
                            setShowSuggestions(false)
                            fetchDonations(mobile)
                          }}
                          className="px-4 py-2 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer text-left"
                        >
                          {mobile}
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  suggestions.names?.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto p-2">
                      {suggestions.names.map(name => (
                        <div
                          key={name}
                          onClick={() => {
                            setSearch(name)
                            setShowSuggestions(false)
                            fetchDonations(name)
                          }}
                          className="px-4 py-2 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer text-left"
                        >
                          {name}
                        </div>
                      ))}
                    </div>
                  )
                )
              )}
            </div>

            {/* Selects Container */}
            <div className="grid grid-cols-2 md:flex gap-2">
              {/* Preset Date Range Select */}
              <div className="relative w-full md:w-auto">
                <HugeiconsIcon 
                  icon={Calendar02Icon} 
                  size={14} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                />
                <select
                  value={dateRangePreset}
                  onChange={(e) => { setDateRangePreset(e.target.value); setPage(1); }}
                  className="w-full md:w-auto pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-gray-50/50 cursor-pointer text-gray-600 appearance-none"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="custom">Custom Range...</option>
                </select>
              </div>

              {/* Donation Type Select */}
              <div className="relative w-full md:w-auto">
                <HugeiconsIcon 
                  icon={FilterIcon} 
                  size={14} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                />
                <select
                  value={donationType}
                  onChange={(e) => { setDonationType(e.target.value); setPage(1); }}
                  className="w-full md:w-auto pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-gray-50/50 cursor-pointer text-gray-600 appearance-none"
                >
                  <option value="">All Types</option>
                  {availableTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Range Inputs - Rendered only when preset is 'custom' */}
        {dateRangePreset === 'custom' && (
          <div className="px-5 py-3 bg-slate-50 border-b border-gray-100 flex flex-row items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 focus:outline-none"
              />
            </div>
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); setDateRangePreset(''); setPage(1); }} 
              className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-auto"
            >
              Clear Custom Range
            </button>
          </div>
        )}

        {/* DataTable view */}
        <div>
          <DataTable
            rows={formattedRows}
            columns={columns}
            loading={loading}
            error={error}
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            getRowKey={(r) => r.id}
            selected={selected}
            onSelectAll={(all) => setSelected(all)}
            onSelectOne={(one) => setSelected(one)}
          />
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {dialogConfig && (
        <Dialog
          isOpen={!!dialogConfig}
          type={dialogConfig.type}
          title={dialogConfig.title}
          message={dialogConfig.message}
          defaultValue={dialogConfig.defaultValue}
          onConfirm={dialogConfig.onConfirm}
          onClose={() => setDialogConfig(null)}
        />
      )}
    </div>
  )
}

export default DonationsPage