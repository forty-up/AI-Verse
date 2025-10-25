import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Webcam from 'react-webcam'
import { ArrowLeft, Camera, Loader2, AlertCircle, Target, Lock, Brain, FileText } from 'lucide-react'
import axios from 'axios'
import EmotionResults from './EmotionResults'
import ComprehensiveFeedback from './ComprehensiveFeedback'
import { analyzeSession } from '../utils/feedbackAnalyzer'

function EmotionDetector({ onBack }) {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [emotionData, setEmotionData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fps, setFps] = useState(0)
  const detectionIntervalRef = useRef(null)
  const [sessionHistory, setSessionHistory] = useState([])
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackData, setFeedbackData] = useState(null)

  // Show emotion label
  const showEmotionLabel = (result) => {
    const canvas = canvasRef.current
    const video = webcamRef.current?.video

    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')

    // Get displayed size
    const displayWidth = video.clientWidth
    const displayHeight = video.clientHeight

    // Set canvas size
    canvas.width = displayWidth
    canvas.height = displayHeight

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const { emotion, confidence } = result

    // Color
    const colors = {
      'Happy': '#22C55E',
      'Neutral': '#60A5FA',
      'Sad': '#3B82F6',
      'Angry': '#EF4444',
      'Surprise': '#F59E0B',
      'Fear': '#8B5CF6',
      'Disgust': '#EC4899'
    }
    const color = colors[emotion] || '#8A63D2'

    // Label at top center
    const emoji = emotion === 'Happy' ? '😊' : emotion === 'Neutral' ? '😐' : emotion === 'Sad' ? '😢' :
                  emotion === 'Angry' ? '😠' : emotion === 'Surprise' ? '😲' : emotion === 'Fear' ? '😨' : '🤢'
    const label = `${emoji} ${emotion} ${(confidence * 100).toFixed(0)}%`
    ctx.font = 'bold 22px Arial'
    const textWidth = ctx.measureText(label).width

    const x = (displayWidth - textWidth - 24) / 2
    const y = 20

    ctx.fillStyle = color
    ctx.fillRect(x, y, textWidth + 24, 45)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(label, x + 12, y + 30)
  }

  useEffect(() => {
    if (isDetecting) {
      const startTime = Date.now()
      let frameCount = 0

      const detectEmotion = async () => {
        if (webcamRef.current && !isLoading) {
          try {
            setIsLoading(true)
            frameCount++

            const imageSrc = webcamRef.current.getScreenshot()
            if (!imageSrc) {
              console.error('Failed to capture image from webcam')
              setError('Failed to capture image')
              return
            }

            console.log('Sending image to backend...')
            const response = await axios.post('/api/detect', {
              image: imageSrc
            }, {
              timeout: 5000 // 5 second timeout
            })

            console.log('Backend response:', response.data)

            if (response.data.success) {
              setEmotionData(response.data)
              setError(null)

              // Track session history
              setSessionHistory(prev => [...prev, {
                timestamp: Date.now(),
                results: response.data.results
              }])

              // Show emotion label
              if (response.data.results && response.data.results.length > 0) {
                showEmotionLabel(response.data.results[0])
                console.log(`Detected ${response.data.results.length} face(s)`)
              } else {
                // Clear canvas
                const canvas = canvasRef.current
                if (canvas) {
                  const ctx = canvas.getContext('2d')
                  ctx.clearRect(0, 0, canvas.width, canvas.height)
                }
                console.log('No faces detected in frame')
              }

              // Update FPS
              const elapsed = (Date.now() - startTime) / 1000
              setFps(Math.round(frameCount / elapsed))
            } else {
              setError('Detection failed')
            }
          } catch (err) {
            console.error('Detection error:', err)
            const errorMsg = err.response?.data?.error || err.message || 'Failed to detect emotions'
            setError(errorMsg)

            if (err.code === 'ECONNABORTED') {
              setError('Backend timeout - is the server running?')
            } else if (err.code === 'ERR_NETWORK') {
              setError('Cannot connect to backend - please start the server')
            }
          } finally {
            setIsLoading(false)
          }
        }
      }

      // Run detection every 500ms (2 FPS) for smoother experience
      detectionIntervalRef.current = setInterval(detectEmotion, 500)

      // Run first detection immediately
      detectEmotion()

      return () => {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current)
        }
      }
    }
  }, [isDetecting])

  const handleStartDetection = async () => {
    setError(null)

    // Test backend connection first
    try {
      console.log('Testing backend connection...')
      const healthCheck = await axios.get('/api/health', { timeout: 3000 })
      console.log('Backend health check:', healthCheck.data)

      if (healthCheck.data.status === 'healthy') {
        setIsDetecting(true)
        setSessionHistory([])
        setSessionStartTime(Date.now())
        console.log('Detection started!')
      } else {
        setError('Backend is not ready')
      }
    } catch (err) {
      console.error('Backend connection error:', err)
      setError('Cannot connect to backend. Please ensure the backend server is running on port 5000.')
    }
  }

  const handleStopDetection = () => {
    setIsDetecting(false)
    setEmotionData(null)
    setFps(0)
    console.log('Detection stopped')
  }

  const handleGenerateFeedback = () => {
    console.log('Generating feedback from session history:', sessionHistory.length, 'frames')
    const analysis = analyzeSession(sessionHistory)
    if (analysis) {
      setFeedbackData(analysis)
      setShowFeedback(true)
      console.log('Feedback analysis:', analysis)
    } else {
      setError('Not enough data to generate feedback. Please run detection for at least 10 seconds.')
    }
  }

  return (
    <div className="min-h-screen px-6 py-8 bg-[#1a1a1a] relative overflow-hidden">
      {/* Background Image with Opacity */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/background.jpg)',
          opacity: 0.08
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-[#8A63D2] text-[#1a1a1a] px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            <span className="font-semibold">Back</span>
          </button>

          <h1 className="text-3xl md:text-5xl font-bold text-white">
            Live <span className="text-[#8A63D2]">Detection</span>
          </h1>

          <div className="w-32" /> {/* Spacer for centering */}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Webcam Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-effect p-6 rounded-3xl"
          >
            <div className="relative">
              {/* Webcam */}
              <div className="webcam-container relative">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full rounded-2xl"
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: "user"
                  }}
                  onUserMedia={() => {
                    console.log('Webcam initialized successfully')
                  }}
                  onUserMediaError={(err) => {
                    console.error('Webcam error:', err)
                    setError('Failed to access webcam. Please check permissions.')
                  }}
                />
                {/* Canvas overlay for bounding box */}
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full rounded-2xl pointer-events-none"
                />

                {/* Processing indicator */}
                {isDetecting && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-black bg-opacity-60 px-4 py-2 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white text-sm font-semibold">LIVE</span>
                    {fps > 0 && (
                      <span className="text-white text-xs ml-2">{fps} FPS</span>
                    )}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="mt-6 flex gap-3">
                {!isDetecting ? (
                  <button
                    onClick={handleStartDetection}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Start Detection
                  </button>
                ) : (
                  <button
                    onClick={handleStopDetection}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold
                             transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/50"
                  >
                    Stop Detection
                  </button>
                )}

                {/* Generate Feedback Button */}
                {sessionHistory.length > 10 && (
                  <button
                    onClick={handleGenerateFeedback}
                    className="px-6 py-3 bg-[#8A63D2] text-white rounded-xl font-semibold
                             transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[#8A63D2]/50
                             flex items-center gap-2"
                    title="Generate comprehensive feedback report"
                  >
                    <FileText className="w-5 h-5" />
                    Get Feedback
                  </button>
                )}
              </div>

              {/* Status */}
              <div className="mt-4 flex items-center justify-center gap-2 bg-[#8A63D2] bg-opacity-20 border border-[#8A63D2] border-opacity-40 py-2 px-4 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${isDetecting ? 'bg-[#8A63D2] animate-pulse' : 'bg-white bg-opacity-40'}`} />
                <span className="text-sm font-semibold text-white">
                  {isDetecting ? 'Detecting...' : 'Ready'}
                </span>
                {emotionData && emotionData.faces_detected > 0 && (
                  <span className="text-sm text-white ml-2">
                    • {emotionData.faces_detected} face(s) detected
                  </span>
                )}
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 flex items-start gap-2 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-40 rounded-lg p-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <div className="flex-1">
                      <span className="text-sm text-white font-medium block">{error}</span>
                      {error.includes('backend') && (
                        <span className="text-xs text-white text-opacity-70 mt-1 block">
                          Run: cd backend && python app.py
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <EmotionResults data={emotionData} />
          </motion.div>
        </div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 mt-8"
        >
          <motion.div
            className="bg-white bg-opacity-5 border border-white border-opacity-10 p-6 rounded-xl transform hover:scale-[1.02] transition-all duration-300 hover:bg-opacity-10"
            whileHover={{ y: -5 }}
          >
            <motion.div
              className="w-12 h-12 bg-[#8A63D2] rounded-lg flex items-center justify-center mb-4"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Target className="w-6 h-6 text-[#1a1a1a]" strokeWidth={2} />
            </motion.div>
            <h3 className="text-lg font-bold mb-2 text-white">Real-Time</h3>
            <p className="text-white text-opacity-60 text-sm leading-relaxed">
              Processes facial expressions instantly with minimal latency
            </p>
          </motion.div>

          <motion.div
            className="bg-white bg-opacity-5 border border-white border-opacity-10 p-6 rounded-xl transform hover:scale-[1.02] transition-all duration-300 hover:bg-opacity-10"
            whileHover={{ y: -5 }}
          >
            <motion.div
              className="w-12 h-12 bg-[#8A63D2] rounded-lg flex items-center justify-center mb-4"
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Lock className="w-6 h-6 text-[#1a1a1a]" strokeWidth={2} />
            </motion.div>
            <h3 className="text-lg font-bold mb-2 text-white">Privacy First</h3>
            <p className="text-white text-opacity-60 text-sm leading-relaxed">
              All processing happens locally. Data never leaves your device
            </p>
          </motion.div>

          <motion.div
            className="bg-white bg-opacity-5 border border-white border-opacity-10 p-6 rounded-xl transform hover:scale-[1.02] transition-all duration-300 hover:bg-opacity-10"
            whileHover={{ y: -5 }}
          >
            <motion.div
              className="w-12 h-12 bg-[#8A63D2] rounded-lg flex items-center justify-center mb-4"
              whileHover={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.6 }}
            >
              <Brain className="w-6 h-6 text-[#1a1a1a]" strokeWidth={2} />
            </motion.div>
            <h3 className="text-lg font-bold mb-2 text-white">Deep Learning</h3>
            <p className="text-white text-opacity-60 text-sm leading-relaxed">
              Powered by ResNet50 trained on extensive expression datasets
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Comprehensive Feedback Modal */}
      {showFeedback && feedbackData && (
        <ComprehensiveFeedback
          sessionData={feedbackData}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  )
}

export default EmotionDetector
