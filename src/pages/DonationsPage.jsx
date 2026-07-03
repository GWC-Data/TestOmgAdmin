import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  FolderFileStorageIcon,
  Coins01Icon,
  HandshakeIcon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon
} from '@hugeicons/core-free-icons'
import KpiCard from '../components/ui/KpiCard'
import DataTable from '../components/ui/DataTable'
import { templeClient } from '../api/axiosClient'

const DonationsPage = () => {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [selected, setSelected] = useState(new Set())
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')

  // Metrics
  const [metrics, setMetrics] = useState({
    totalRecords: 0,
    totalDonations: 0,
    uniqueDonors: 0,
    pendingDonations: 0,
  })

  const fetchDonations = async () => {
    setLoading(true)
    setError(null)
    try {
      const offset = (page - 1) * pageSize
      const res = await templeClient.get('/admin/donations-pledges', {
        params: { limit: pageSize, offset }
      })

      if (res.data?.success) {
        const list = res.data.data.list || []
        const totalCount = res.data.data.total || 0
        setRows(list)
        setTotal(totalCount)

        const totalRecs = totalCount
        const totalAmount = list.reduce((sum, r) => sum + (r.amount || 0), 0)
        const uniqueDons = new Set(list.map((r) => r.mobile_number)).size
        const pending = list.filter((r) => r.status === 'pending').length

        setMetrics({
          totalRecords: totalRecs,
          totalDonations: totalAmount,
          uniqueDonors: uniqueDons,
          pendingDonations: pending,
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
  }, [page, pageSize])

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

  const columns = [
    {
      key: 'id',
      label: 'ID',
      defaultWidth: 100,
      minWidth: 80,
      render: (row) => <span className="font-mono text-xs">{row.id?.substring(0, 8) || row.id}</span>
    },
    { key: 'name', label: 'Donor Name', defaultWidth: 200, minWidth: 150 },
    { key: 'mobile_number', label: 'Mobile Number', defaultWidth: 160, minWidth: 130 },
    {
      key: 'amount',
      label: 'Amount',
      defaultWidth: 130,
      minWidth: 100,
      render: (row) => (
        <span className="font-black text-primary">
          ₹{(row.amount || 0).toLocaleString()}
        </span>
      )
    },
    { key: 'type_of_donation', label: 'Type', defaultWidth: 180, minWidth: 120 },
    {
      key: 'status',
      label: 'Status',
      defaultWidth: 140,
      minWidth: 100,
      render: (row) => {
        let badgeColor = 'bg-amber-100 text-amber-700' // pending
        if (row.status === 'completed' || row.status === 'verified') badgeColor = 'bg-green-100 text-green-700'
        if (row.status === 'failed' || row.status === 'cancelled') badgeColor = 'bg-red-100 text-red-700'
        return (
          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-black capitalize ${badgeColor}`}>
            {row.status || 'pending'}
          </span>
        )
      }
    }
  ]

  const actionColumn = {
    label: 'Actions',
    render: (row) => (
      <div className="flex items-center justify-center gap-1.5">
        <button className="p-1 text-gray-400 hover:text-primary transition-colors">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color="currentColor" />
        </button>
        <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
          <HugeiconsIcon icon={CancelCircleIcon} size={16} color="currentColor" />
        </button>
      </div>
    )
  }

  const kpis = [
    { title: 'Total Records', value: metrics.totalRecords.toLocaleString(), subtitle: 'All entries', icon: FolderFileStorageIcon, gradientClass: 'kpi-1' },
    { title: 'Total Donation Amount', value: `₹${metrics.totalDonations.toLocaleString()}`, subtitle: 'Sponsor total', icon: Coins01Icon, gradientClass: 'kpi-2' },
    { title: 'Unique Donors', value: metrics.uniqueDonors.toLocaleString(), subtitle: 'Distinct donors', icon: HandshakeIcon, gradientClass: 'kpi-3' },
    { title: 'Pending Donations', value: metrics.pendingDonations.toLocaleString(), subtitle: 'Awaiting review', icon: Clock01Icon, gradientClass: 'kpi-4' },
  ]

  return (
    <div className="tab-enter px-4 pb-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="mt-6 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-primary">Donations</h1>
            <p className="text-gray-400 text-sm font-medium mt-0.5">Track all temple donations and offerings</p>
          </div>
          <button
            onClick={fetchDonations}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            title="Refresh Data"
          >
            🔄
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpis.map((k, i) => (
          <KpiCard key={k.title} {...k} delay={i * 80} />
        ))}
      </div>

      {/* Recent Donations */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-800 text-base">Recent Donations</h2>
        </div>

        {/* DataTable view shown on all screen sizes */}
        <div>
          <DataTable
            rows={rows}
            columns={columns}
            actionColumn={actionColumn}
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

export default DonationsPage
