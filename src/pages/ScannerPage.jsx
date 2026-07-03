import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { HugeiconsIcon } from '@hugeicons/react'
import { Camera01Icon, FlashIcon, FlashOffIcon, RefreshIcon } from '@hugeicons/core-free-icons'
import ScanResultModal from '../components/ui/ScanResultModal'

const SCANNER_ELEMENT_ID = 'qr-scanner-viewport'

const ScannerPage = ({ onVerify, onConfirmVerification, onCancelVerification, scanResult }) => {
  const [cameras, setCameras] = useState([])
  const [activeCameraId, setActiveCameraId] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState(null)

  const scannerRef = useRef(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!isMountedRef.current) return
        setCameras(devices)
        if (devices.length > 0) {
          const backCamera = devices.find((d) => /back|rear|environment/i.test(d.label))
          setActiveCameraId(backCamera ? backCamera.id : devices[0].id)
        } else {
          setError('No camera found on this device.')
        }
      })
      .catch(() => {
        if (isMountedRef.current) setError('Camera permission denied or unavailable.')
      })

    return () => {
      isMountedRef.current = false
      stopScanner()
    }
  }, [])

  useEffect(() => {
    if (activeCameraId && !scanResult) {
      startScanner(activeCameraId)
    }
    return () => {
      stopScanner()
    }
  }, [activeCameraId, scanResult])

  const startScanner = async (cameraId) => {
    setError(null)
    const instance = new Html5Qrcode(SCANNER_ELEMENT_ID, {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_13,
      ],
      verbose: false,
    })
    scannerRef.current = instance

    try {
      await instance.start(
        cameraId,
        { 
          fps: 10, 
          aspectRatio: 1.0, 
          qrbox: { width: 400, height: 400 } 
        },
        (decodedText) => handleDecoded(decodedText),
        () => {}
      )
      setScanning(true)

      const capabilities = instance.getRunningTrackCapabilities?.()
      setTorchSupported(Boolean(capabilities?.torch))
    } catch (err) {
      setScanning(false)
      setError('Unable to start camera. Check permissions and try again.')
    }
  }

  const stopScanner = async () => {
    const instance = scannerRef.current
    if (instance && instance.isScanning) {
      try {
        await instance.stop()
        instance.clear()
      } catch (err) {}
    }
    scannerRef.current = null
    setScanning(false)
  }

  const toggleTorch = async () => {
    const instance = scannerRef.current
    if (!instance) return
    try {
      await instance.applyVideoConstraints({ advanced: [{ torch: !torchOn }] })
      setTorchOn(!torchOn)
    } catch (err) {}
  }

  const switchCamera = () => {
    if (cameras.length < 2) return
    const currentIndex = cameras.findIndex((c) => c.id === activeCameraId)
    const nextCamera = cameras[(currentIndex + 1) % cameras.length]
    stopScanner().then(() => setActiveCameraId(nextCamera.id))
  }

  const handleDecoded = async (rawValue) => {
    if (!scannerRef.current || verifying) return
    await stopScanner()
    setVerifying(true)
    try {
      if (onVerify) {
        await onVerify(rawValue)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="tab-enter flex flex-col items-center px-4 pb-6">
      <div className="w-full max-w-sm mt-6 mb-4 flex items-center gap-3">
        <img 
          src="https://omgofficial.com/omg-logo.png" 
          alt="OMG Logo" 
          className="md:hidden h-8 w-auto object-contain" 
        />
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Scan Entry</h1>
          <p className="text-gray-400 text-sm font-medium mt-0.5">
            Point camera at the QR / barcode
          </p>
        </div>
      </div>

      <div className="relative w-full max-w-sm bg-gray-900 rounded-3xl overflow-hidden shadow-2xl select-none">
        <div id={SCANNER_ELEMENT_ID} className="absolute inset-0 [&>video]:w-full [&>video]:h-full [&>video]:object-cover" />

        {!scanning && !error && (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center pointer-events-none">
            <div className="text-center flex flex-col items-center text-white/25">
              <div className="pulse-ring mb-2">
                <HugeiconsIcon icon={Camera01Icon} size={64} color="currentColor" strokeWidth={1} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center px-6">
            <p className="text-red-300 text-sm font-semibold text-center">{error}</p>
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex gap-2">
          {torchSupported && (
            <button
              onClick={toggleTorch}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <HugeiconsIcon icon={torchOn ? FlashOffIcon : FlashIcon} size={18} color="currentColor" />
            </button>
          )}
          {cameras.length > 1 && (
            <button
              onClick={switchCamera}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <HugeiconsIcon icon={RefreshIcon} size={18} color="currentColor" />
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4 font-medium text-center max-w-xs">
        Align the QR code within the frame. The scanner will detect it automatically.
      </p>
    </div>
  )
}

export default ScannerPage