import { useEffect, useState, useMemo } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  NoteEditIcon,
  UserGroupIcon,
  UserStar01Icon,
  HourglassIcon,
  LicenseIcon,
  UserIcon,
  SmartPhone01Icon,
  Calendar02Icon,
  CheckmarkCircle02Icon,
  Search01Icon,
  RefreshIcon,
  FilterIcon
} from '@hugeicons/core-free-icons'
import KpiCard from '../components/ui/KpiCard'
import DataTable from '../components/ui/DataTable'
import { templeClient } from '../api/axiosClient'

const RegistrationsPage = () => {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [selected, setSelected] = useState(new Set())
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')

  // Filter States
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [timeSlotFilter, setTimeSlotFilter] = useState('')

  // Metrics
  const [metrics, setMetrics] = useState({
    totalRegistrations: 0,
    totalHeadcount: 0,
    uniqueDevotees: 0,
    pendingRegistrations: 0,
  })

  const fetchRegistrations = async () => {
    setLoading(true)
    setError(null)
    try {
      const offset = (page - 1) * pageSize
      
      const [res, pendingRes] = await Promise.all([
        templeClient.get('/admin/koozhu-thiruvizha', {
          params: {
            limit: pageSize,
            offset,
            search: search.trim() || undefined,
            status: statusFilter || undefined,
            time_slot: timeSlotFilter || undefined
          }
        }),
        templeClient.get('/admin/koozhu-thiruvizha', {
          params: {
            limit: 1,
            status: 'pending'
          }
        }).catch(() => null)
      ])

      if (res.data?.success) {
        const list = res.data.data.list || []
        const totalCount = res.data.data.total || 0
        setRows(list)
        setTotal(totalCount)

        const totalRegs = totalCount
        const totalHead = list.reduce((sum, r) => sum + (r.headcount || 0), 0)
        const uniqueDevs = new Set(list.map((r) => r.mobile_number)).size
        const pending = pendingRes?.data?.data?.total ?? list.filter((r) => r.ticketVerification?.is_verified !== true && r.status !== 'completed' && r.status !== 'verified' && r.status !== 'cancelled').length

        setMetrics({
          totalRegistrations: totalRegs,
          totalHeadcount: totalHead,
          uniqueDevotees: uniqueDevs,
          pendingRegistrations: pending,
        })
      } else {
        setError('Failed to load registrations.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load registrations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [page, pageSize, statusFilter, timeSlotFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchRegistrations()
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(new Set(rows.map((r) => r.id)))
    } else {
      setSelected(new Set())
    }
  }

  const handleSelectOne = (key) => {
    const next = new Set(selected)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    setSelected(next)
  }

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedRows = useMemo(() => {
    const sorted = [...rows]
    if (!sortKey) return sorted

    sorted.sort((a, b) => {
      let av = a[sortKey]
      let bv = b[sortKey]

      if (sortKey === 'time_slot_preference') {
        av = a.time_slot_preference || ''
        bv = b.time_slot_preference || ''
      }

      if (av == null) return 1
      if (bv == null) return -1

      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }

      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })

    return sorted
  }, [rows, sortKey, sortDir])

  const columns = [
    { 
      key: 'id', 
      label: 'ID',
      defaultWidth: 100,
      minWidth: 80,
      render: (row) => <span className="font-mono text-xs">{row.id?.substring(0, 8) || row.id}</span>
    },
    { 
      key: 'name', 
      label: 'Devotee Name', 
      defaultWidth: 200, 
      minWidth: 150
    },
    { 
      key: 'mobile_number', 
      label: 'Mobile Number', 
      defaultWidth: 160, 
      minWidth: 130
    },
    { 
      key: 'headcount', 
      label: 'Headcount', 
      defaultWidth: 120, 
      minWidth: 120, 
      cellAlign: 'center'
    },
    { 
      key: 'time_slot_preference', 
      label: 'Timeslot', 
      defaultWidth: 180, 
      minWidth: 120
    },
    {
      key: 'status',
      label: 'Status',
      defaultWidth: 140,
      minWidth: 100,
      render: (row) => {
        const isVerified = row.ticketVerification?.is_verified === true || row.status === 'completed' || row.status === 'verified'
        const isCancelled = row.status === 'cancelled'
        
        let badgeColor = 'bg-amber-100 text-amber-700' // pending
        let statusLabel = 'pending'

        if (isVerified) {
          badgeColor = 'bg-green-100 text-green-700'
          statusLabel = 'verified'
        } else if (isCancelled) {
          badgeColor = 'bg-red-100 text-red-700'
          statusLabel = 'cancelled'
        }

        return (
          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-black capitalize ${badgeColor}`}>
            {statusLabel}
          </span>
        )
      }
    }
  ]

  const kpis = [
    { title: 'Total Registrations', value: metrics.totalRegistrations.toLocaleString(), subtitle: 'All entries', icon: NoteEditIcon, gradientClass: 'kpi-1' },
    { title: 'Total Headcount', value: metrics.totalHeadcount.toLocaleString(), subtitle: 'All members', icon: UserGroupIcon, gradientClass: 'kpi-2' },
    { title: 'Unique Devotees', value: metrics.uniqueDevotees.toLocaleString(), subtitle: 'By phone', icon: UserStar01Icon, gradientClass: 'kpi-3' },
    { title: 'Pending Registrations', value: metrics.pendingRegistrations.toLocaleString(), subtitle: 'Need approval', icon: HourglassIcon, gradientClass: 'kpi-4' },
  ]

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
              <h1 className="text-2xl font-extrabold text-primary">Registrations</h1>
              <p className="text-gray-400 text-sm font-medium mt-0.5">Overview of all devotee registrations</p>
            </div>
          </div>
          <button
            onClick={fetchRegistrations}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
            title="Refresh Data"
          >
            <HugeiconsIcon icon={RefreshIcon} size={16} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpis.map((k, i) => (
          <KpiCard key={k.title} {...k} delay={i * 80} />
        ))}
      </div>

      {/* Filter Toolbar & DataTable */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {/* Responsive Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-extrabold text-gray-800 text-base shrink-0">Devotee Registrations</h2>
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-60">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or phone..."
                className="w-full pl-4 pr-10 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-gray-50/50"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary flex items-center">
                <HugeiconsIcon icon={Search01Icon} size={15} />
              </button>
            </form>

            {/* Selects Container */}
            <div className="grid grid-cols-2 md:flex gap-2">
              <div className="relative w-full md:w-auto">
                <HugeiconsIcon 
                  icon={FilterIcon} 
                  size={14} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                />
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="w-full md:w-auto pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-gray-50/50 cursor-pointer text-gray-600 appearance-none"
                >
                  <option value="">All Statuses</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="relative w-full md:w-auto">
                <HugeiconsIcon 
                  icon={Calendar02Icon} 
                  size={14} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
                />
                <select
                  value={timeSlotFilter}
                  onChange={(e) => { setTimeSlotFilter(e.target.value); setPage(1); }}
                  className="w-full md:w-auto pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-gray-50/50 cursor-pointer text-gray-600 appearance-none"
                >
                  <option value="">All Timeslots</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* DataTable view */}
        <div>
          <DataTable
            rows={sortedRows}
            columns={columns}
            loading={loading}
            error={error}
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            sortKey={sortKey}
            onSort={handleSort}
            getRowKey={(row) => row.id}
            selected={selected}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
          />
        </div>
      </div>
    </div>
  )
}

export default RegistrationsPage
