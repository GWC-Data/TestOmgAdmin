import { useState } from 'react'
import TopNav           from './components/layout/TopNav'
import BottomNav        from './components/layout/BottomNav'
import ScannerPage       from './pages/ScannerPage'
import RegistrationsPage from './pages/RegistrationsPage'
import OrdersPage        from './pages/OrdersPage'
import DonationsPage     from './pages/DonationsPage'
import ScanResultModal   from './components/ui/ScanResultModal'
import { templeClient }  from './api/axiosClient'


export default function App() {
  const [activeTab, setActiveTab] = useState('scanner')
  const [scanResult, setScanResult] = useState(null)

  // Verification helper for live scanning
  const handleVerifyTicket = async (rawValue) => {
    let parsedToken = rawValue.trim()
    if (parsedToken.includes('/verify/')) {
      const parts = parsedToken.split('/verify/')
      parsedToken = parts[parts.length - 1]
    }

    try {
      const response = await templeClient.post('/admin/tickets/verify', {
        token: parsedToken,
        confirm: false
      })

      if (response.data && response.data.success) {
        const ticketData = response.data.data || {}
        const isVerified = ticketData.isVerified === true || response.data.message === 'already verified';
        const result = {
          valid: !isVerified, // Mark invalid if already verified so they can't confirm again or it shows warning
          message: response.data.message || (isVerified ? 'already verified' : 'Ticket is valid. Press verify to check in.'),
          details: {
            'Name': ticketData.customerName || 'Guest Devotee',
            'Pooja/Event': ticketData.pooja || 'Registration',
            'Booking Details': ticketData.bookingDate || 'N/A',
            'Ticket ID': ticketData.refId || parsedToken,
            'Status': ticketData.status || 'Active',
            'Verified': isVerified ? '✅ Yes' : '❌ No'
          },
          token: parsedToken
        }
        setScanResult(result)
        return result
      } else {
        const result = {
          valid: false,
          message: response.data.message || 'Ticket not found.',
          details: { 'Scanned Value': parsedToken }
        }
        setScanResult(result)
        return result
      }
    } catch (err) {
      const result = {
        valid: false,
        message: err.response?.data?.message || 'Verification failed.',
        details: { 'Scanned Value': parsedToken }
      }
      setScanResult(result)
      return result
    }
  }

  // Confirmation callback when verification is accepted
  const handleConfirmTicket = async (tokenVal) => {
    try {
      const response = await templeClient.post('/admin/tickets/verify', {
        token: tokenVal,
        confirm: true
      })
      setScanResult(null)
      return response.data?.success || false
    } catch (err) {
      console.error('Failed to confirm ticket:', err)
      setScanResult(null)
      return false
    }
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'scanner':
        return (
          <ScannerPage
            onVerify={handleVerifyTicket}
            onConfirmVerification={handleConfirmTicket}
            onCancelVerification={() => setScanResult(null)}
            scanResult={scanResult}
          />
        )
      case 'registrations': return <RegistrationsPage />
      case 'orders':        return <OrdersPage />
      case 'donations':     return <DonationsPage />
      default:              return <ScannerPage />
    }
  }


  return (
    <div className="font-nunito min-h-screen bg-[#eef0f8] flex flex-col relative">
      <TopNav active={activeTab} onChange={setActiveTab} />

      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <div key={activeTab} className="w-full">
          {renderPage()}
        </div>
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />

      {/* Render Scan Result Modal at root level to overlay the bottom nav and body */}
      {scanResult && (
        <ScanResultModal
          result={scanResult}
          onConfirm={() => handleConfirmTicket(scanResult.token)}
          onCancel={() => setScanResult(null)}
        />
      )}
    </div>
  )
}
