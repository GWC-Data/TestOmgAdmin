import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ShoppingCart01Icon,
  Search01Icon,
  RefreshIcon
} from '@hugeicons/core-free-icons'

import KpiCard from '../components/ui/KpiCard'
import DataTable from '../components/ui/DataTable'
import { templeClient } from '../api/axiosClient'

const OrdersPage = () => {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [selected, setSelected] = useState(new Set())

  // Filter States
  const [search, setSearch] = useState('')

  // Metrics
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
  })

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const offset = (page - 1) * pageSize
      const res = await templeClient.get('/admin/store-orders', {
        params: {
          limit: pageSize,
          offset,
          search: search.trim() || undefined
        }
      })

      if (res.data?.success) {
        const list = res.data.data.list || []
        const totalCount = res.data.data.total || 0
        setRows(list)
        setTotal(totalCount)

        const pending = list.filter((r) => r.status === 'PENDING').length

        setMetrics({
          totalOrders: totalCount,
          pendingOrders: pending,
        })
      } else {
        setError('Failed to load orders.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [page, pageSize])

  const columns = [
    { key: 'createdAt', label: 'Date', defaultWidth: 150 },
    { key: 'name', label: 'Customer Name', defaultWidth: 180 },
    { key: 'mobile_number', label: 'Mobile Number', defaultWidth: 150 },
    { key: 'items', label: 'Items Purchased', defaultWidth: 350 },
    { key: 'total_price', label: 'Total Price', defaultWidth: 120 },
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
          {row.status}
        </span>
      )
    },
  ]



  const formattedRows = rows.map((row) => {
    let itemsStr = ''
    if (Array.isArray(row.items)) {
      itemsStr = row.items.map((i) => `${i.qty}x ${i.name || i.id}`).join(', ')
    } else if (typeof row.items === 'string') {
      try {
        const parsed = JSON.parse(row.items)
        if (Array.isArray(parsed)) {
          itemsStr = parsed.map((i) => `${i.qty}x ${i.name || i.id}`).join(', ')
        }
      } catch (e) {
        itemsStr = row.items
      }
    }
    return {
      ...row,
      createdAt: new Date(row.createdAt).toLocaleString(),
      name: row.name || 'Guest Devotee',
      items: itemsStr,
      status: (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            row.status === 'COMPLETED'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
          }`}
        >
          {row.status}
        </span>
      )
    }
  })

  return (
    <div className="tab-enter px-4 sm:px-6 lg:px-8 pb-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mt-6 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-primary">Store Orders</h1>
            <p className="text-gray-400 text-sm font-medium mt-0.5">Manage and review WhatsApp Store checkouts.</p>
          </div>
          <button
            onClick={fetchOrders}
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
          title="Total Orders"
          value={metrics.totalOrders}
          icon={ShoppingCart01Icon}
          gradientClass="kpi-1"
          subtitle="All checkouts logged"
        />
        <KpiCard
          title="Pending Contact"
          value={metrics.pendingOrders}
          icon={ShoppingCart01Icon}
          gradientClass="kpi-3"
          subtitle="Awaiting admin review"
        />
      </div>


      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">

          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <HugeiconsIcon icon={Search01Icon} size={18} />
          </span>


          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary/20 focus:bg-white transition-all duration-200"
          />
        </div>
        <button
          onClick={fetchOrders}
          className="bg-primary text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md hover:bg-primary-dark transition-all duration-200"
        >
          Search
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1">
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
  )
}

export default OrdersPage