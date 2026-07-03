import { useState, useRef } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Mail01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  SecurityValidationIcon
} from '@hugeicons/core-free-icons'
import { identityClient } from '../api/axiosClient'

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState('credentials')
  const inputRefs = useRef([])

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    setError(null)
    setStep('2fa')
  }

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(0, 1) // Only take first character
    setOtp(newOtp)

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Move to previous on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d*$/.test(pastedData)) {
      const digits = pastedData.split('')
      const newOtp = [...otp]
      digits.forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit
      })
      setOtp(newOtp)
      // Focus last filled or first empty
      const lastIndex = Math.min(digits.length, 5)
      inputRefs.current[lastIndex].focus()
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits of the verification code.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await identityClient.post('/auth/2fa/login', {
        email: email.trim(),
        otp: otpString,
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light mx-auto mb-4 flex items-center justify-center text-white font-black text-xl shadow-lg">
            OM
          </div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">OMG Temple</h1>
          <p className="text-gray-500 text-xs mt-1 font-semibold">Management Console Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <HugeiconsIcon icon={AlertCircleIcon} size={16} color="currentColor" />
            <span>{error}</span>
          </div>
        )}

        {step === 'credentials' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 flex items-center">
                  <HugeiconsIcon icon={Mail01Icon} size={18} color="currentColor" />
                </span>
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@omgtemple.org"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm font-semibold placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-primary to-primary-light text-white font-extrabold text-sm rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} color="currentColor" strokeWidth={2.5} />
              <span>Continue with Email</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4 ml-1 text-center">
                Enter 6-Digit Authenticator Code
              </label>
              
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-2xl font-black rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    disabled={loading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            <button
              id="login-otp-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-primary to-primary-light text-white font-extrabold text-sm rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
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
              className="w-full text-center text-gray-400 hover:text-gray-600 text-xs font-bold transition-colors"
            >
              ← Back to login
            </button>
          </form>
        )}

        <p className="text-[10px] text-gray-400 text-center font-semibold tracking-wide mt-8 uppercase">
          Authorized Temple Admins Only
        </p>
      </div>
    </div>
  )
}

export default LoginPage