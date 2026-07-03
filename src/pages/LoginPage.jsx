import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Mail01Icon,
  LicenseIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  SecurityValidationIcon
} from '@hugeicons/core-free-icons'
import { identityClient } from '../api/axiosClient'

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Step state: 'credentials' or '2fa'
  const [step, setStep] = useState('credentials')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await identityClient.post('/auth/login', {
        email: email.trim(),
        password: password.trim(),
      })

      if (response.status === 200 && response.data?.success !== false) {
        const data = response.data?.data || {}

        // Check if 2FA is required
        if (data.require2FA || data.require2FASetup) {
          setStep('2fa')
          setLoading(false)
          return
        }

        const { accessToken, user } = data

        if (accessToken && user) {
          // Check role (must be admin or similar)
          const isAllowedRole = user.role?.toLowerCase().includes('admin') || user.roleId

          if (!isAllowedRole) {
            setError('Access Denied: Admin privileges required.')
            return
          }

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('user', JSON.stringify(user))

          // Trigger state reload in root App
          onLoginSuccess(user)
        } else {
          setError('Invalid login response. Please contact support.')
        }
      } else {
        setError(response.data?.message || 'Login failed. Please verify credentials.')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Connection error.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp.trim()) {
      setError('Please enter the verification code.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await identityClient.post('/auth/2fa/login', {
        email: email.trim(),
        otp: otp.trim(),
      })

      if (response.status === 200 && response.data?.success !== false) {
        const data = response.data?.data || {}
        const { accessToken, user } = data

        if (accessToken && user) {
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('user', JSON.stringify(user))
          onLoginSuccess(user)
        } else {
          setError('Invalid OTP session response.')
        }
      } else {
        setError(response.data?.message || 'Verification failed. Please check the code.')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || '2FA Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-primary-variant via-[#1b2257] to-secondary-variant">
      <div className="w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 p-8 shadow-2xl relative overflow-hidden">
        {/* Shimmer background */}
        <div className="absolute inset-0 kpi-shimmer pointer-events-none opacity-20" />

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light mx-auto mb-4 flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/10">
            OM
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">OMG Temple</h1>
          <p className="text-white/60 text-xs mt-1 font-semibold">Management Console Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <HugeiconsIcon icon={AlertCircleIcon} size={16} color="currentColor" />
            <span>{error}</span>
          </div>
        )}

        {step === 'credentials' ? (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="block text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 flex items-center">
                  <HugeiconsIcon icon={Mail01Icon} size={18} color="currentColor" />
                </span>
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@omgtemple.org"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-white/20 focus:ring-2 focus:ring-white/5 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1.5 ml-1">
                Secret Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 flex items-center">
                  <HugeiconsIcon icon={LicenseIcon} size={18} color="currentColor" />
                </span>
                <input
                  id="login-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-white/20 focus:ring-2 focus:ring-white/5 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-primary to-primary-light text-white font-extrabold text-sm rounded-xl shadow-lg shadow-black/10 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 border border-white/10"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} color="currentColor" strokeWidth={2.5} />
                  <span>Log In Portal</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5 relative z-10">
            <div>
              <label className="block text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1.5 ml-1 text-center">
                Enter 6-Digit Authenticator Code
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 flex items-center">
                  <HugeiconsIcon icon={SecurityValidationIcon} size={18} color="currentColor" />
                </span>
                <input
                  id="login-otp-input"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-lg font-black tracking-[0.25em] placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-white/20 focus:ring-2 focus:ring-white/5 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              id="login-otp-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-primary to-primary-light text-white font-extrabold text-sm rounded-xl shadow-lg shadow-black/10 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 border border-white/10"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} color="currentColor" strokeWidth={2.5} />
                  <span>Verify Code</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep('credentials'); setError(null); }}
              className="w-full text-center text-white/50 hover:text-white text-xs font-bold transition-colors"
            >
              ← Back to login
            </button>
          </form>
        )}

        <p className="text-[10px] text-white/40 text-center font-semibold tracking-wide mt-8 uppercase">
          Authorized Temple Admins Only
        </p>
      </div>
    </div>
  )
}

export default LoginPage
