import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Money01Icon,
  Search01Icon,
  RefreshIcon
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

  // Filter States
  const [search, setSearch] = useState('')

  // Metrics
  const [metrics, setMetrics] = useState({
    totalDonations: 0,
  })

  const fetchDonations = async () => {
    setLoading(true)
    setError(null)
    try {
      const offset = (page - 1) * pageSize
      const res = await templeClient.get('/admin/donations-pledges', {
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
  }, [page, pageSize])

  const columns = [
    { key: 'createdAt', label: 'Date', defaultWidth: 180 },
    { key: 'name', label: 'Donor Name', defaultWidth: 200 },
    { key: 'mobile_number', label: 'Mobile Number', defaultWidth: 180 },
    { key: 'type_of_donation', label: 'Donation Detail', defaultWidth: 300 },
  ]


  const formattedRows = rows.map((row) => ({
    ...row,
    createdAt: new Date(row.createdAt).toLocaleString(),
    name: row.name || 'Anonymous Donor',
    type_of_donation: row.type_of_donation || 'General Donation'
  }))

  return (
    <div className="tab-enter px-4 sm:px-6 lg:px-8 pb-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mt-6 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://omgofficial.com/omg-logo.png" 
              alt="OMG Logo" 
              className="h-8 w-auto object-contain" 
            />
            <div>
              <h1 className="text-2xl font-extrabold text-primary">Donations & Pledges</h1>
              <p className="text-gray-400 text-sm font-medium mt-0.5">Manage and review WhatsApp donations and pledges.</p>
            </div>
          </div>
          <button
            onClick={fetchDonations}
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
            onKeyDown={(e) => e.key === 'Enter' && fetchDonations()}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary/20 focus:bg-white transition-all duration-200"
          />
        </div>
        <button
          onClick={fetchDonations}
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

export default DonationsPage
