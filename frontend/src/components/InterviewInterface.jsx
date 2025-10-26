import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Webcam from 'react-webcam'
import { Mic, MicOff, ArrowRight, CheckCircle, Clock, Brain } from 'lucide-react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

const InterviewInterface = ({ interviewData, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [emotions, setEmotions] = useState([])
  const [currentEmotion, setCurrentEmotion] = useState(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [speechStatus, setSpeechStatus] = useState('') // For debugging

  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const timerRef = useRef(null)
  const emotionIntervalRef = useRef(null)
  const recognitionRef = useRef(null)
  const isRecordingRef = useRef(false)

  const currentQuestion = interviewData.questions[currentQuestionIndex]

  // Show emotion label on video
  const showEmotionLabel = (result) => {
    const canvas = canvasRef.current
    const video = webcamRef.current?.video

    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')

    // Get displayed size
    const displayWidth = video.clientWidth
    const displayHeight = video.clientHeight

    // Set canvas to match displayed size
    canvas.width = displayWidth
    canvas.height = displayHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const { emotion, confidence } = result

    // Emotion colors
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

    // Draw label at top center
    // const emoji = emotion === 'Happy' ? '😊' : emotion === 'Neutral' ? '😐' : emotion === 'Sad' ? '😢' :
    //               emotion === 'Angry' ? '😠' : emotion === 'Surprise' ? '😲' : emotion === 'Fear' ? '😨' : '🤢'
    // const label = `${emoji} ${emotion} ${(confidence * 100).toFixed(0)}%`
    ctx.font = 'bold 20px Arial'
    const textWidth = ctx.measureText(label).width

    const x = (displayWidth - textWidth - 20) / 2
    const y = 20

    ctx.fillStyle = color
    ctx.fillRect(x, y, textWidth + 20, 40)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(label, x + 10, y + 28)
  }

  // Speech Recognition Setup - AUTO START
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started automatically')
        setSpeechStatus('🎤 Listening...')
        setIsRecording(true)
      }

      recognitionRef.current.onresult = (event) => {
        console.log('Speech recognition result:', event)
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          console.log('Final transcript:', finalTranscript)
          setCurrentAnswer(prev => prev + finalTranscript)
          setSpeechStatus('✅ Captured: ' + finalTranscript.substring(0, 30) + '...')
          // Reset status after 2 seconds
          setTimeout(() => setSpeechStatus('🎤 Listening...'), 2000)
        } else if (interimTranscript) {
          setSpeechStatus('👂 Hearing: ' + interimTranscript.substring(0, 30) + '...')
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)

        if (event.error === 'no-speech') {
          // Silent, just keep listening
          if (isRecordingRef.current) {
            setTimeout(() => {
              try {
                recognitionRef.current.start()
              } catch (e) {
                console.log('Recognition already started')
              }
            }, 100)
          }
        } else if (event.error === 'not-allowed') {
          setSpeechStatus('⚠️ Microphone access denied - type your answer instead')
          setIsRecording(false)
          isRecordingRef.current = false
        } else {
          console.log('Recognition error:', event.error)
        }
      }

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended')
        // Auto-restart to keep listening
        if (isRecordingRef.current) {
          console.log('Auto-restarting recognition...')
          setTimeout(() => {
            try {
              recognitionRef.current.start()
            } catch (e) {
              console.log('Could not restart recognition:', e)
            }
          }, 100)
        }
      }

      // AUTO-START speech recognition
      console.log('Auto-starting speech recognition...')
      isRecordingRef.current = true
      try {
        recognitionRef.current.start()
        setIsRecording(true)
      } catch (error) {
        console.error('Error auto-starting recognition:', error)
        setSpeechStatus('💬 Type your answer below')
      }
    } else {
      console.warn('Speech recognition not supported in this browser')
      setSpeechStatus('💬 Speech-to-text not available - type your answer')
    }

    return () => {
      if (recognitionRef.current) {
        try {
          isRecordingRef.current = false
          recognitionRef.current.stop()
        } catch (e) {
          console.log('Error stopping recognition:', e)
        }
      }
    }
  }, [])

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentQuestionIndex])

  // Emotion Detection Loop
  useEffect(() => {
    const detectEmotion = async () => {
      if (!webcamRef.current) return

      const imageSrc = webcamRef.current.getScreenshot()
      if (!imageSrc) return

      try {
        const response = await axios.post(API_ENDPOINTS.detect, {
          image: imageSrc
        })

        if (response.data.success && response.data.results.length > 0) {
          const result = response.data.results[0]
          const facialAnalysis = response.data.facial_analysis || {}

          const emotionResult = {
            emotion: result.emotion,
            confidence: result.confidence,
            timestamp: Date.now(),
            questionIndex: currentQuestionIndex,
            // Add facial analysis metrics
            eyeContact: facialAnalysis.eye_contact || 0,
            confidenceScore: facialAnalysis.confidence_score || 0,
            engagementScore: facialAnalysis.engagement_score || 0,
            headPose: facialAnalysis.head_pose || { pitch: 0, yaw: 0, roll: 0 }
          }

          setCurrentEmotion(emotionResult)
          setEmotions(prev => [...prev, emotionResult])

          // Show emotion label
          showEmotionLabel(result)
        } else {
          // Clear canvas if no face
          const canvas = canvasRef.current
          if (canvas) {
            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)
          }
        }
      } catch (error) {
        console.error('Error detecting emotion:', error)
      }
    }

    // Detect emotion every 2 seconds
    emotionIntervalRef.current = setInterval(detectEmotion, 2000)

    return () => {
      if (emotionIntervalRef.current) {
        clearInterval(emotionIntervalRef.current)
      }
    }
  }, [currentQuestionIndex])


  const handleNextQuestion = async () => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer before proceeding')
      return
    }

    setIsProcessing(true)

    try {
      // Score the answer
      const response = await axios.post(API_ENDPOINTS.interview.score, {
        question: currentQuestion.question,
        answer: currentAnswer,
        question_type: currentQuestion.type,
        role: interviewData.role
      })

      const answerData = {
        question: currentQuestion.question,
        type: currentQuestion.type,
        difficulty: currentQuestion.difficulty,
        answer: currentAnswer,
        timeSpent: timeElapsed,
        evaluation: response.data.evaluation,
        emotions: emotions.filter(e => e.questionIndex === currentQuestionIndex)
      }

      const updatedAnswers = [...answers, answerData]
      setAnswers(updatedAnswers)

      // Check if this was the last question
      if (currentQuestionIndex === interviewData.questions.length - 1) {
        // Interview complete - calculate overall feedback
        await completeInterview(updatedAnswers)
      } else {
        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1)
        setCurrentAnswer('')
        setTimeElapsed(0)
      }
    } catch (error) {
      console.error('Error processing answer:', error)
      alert('Failed to process answer. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const completeInterview = async (allAnswers) => {
    try {
      // Calculate emotion statistics
      const emotionCounts = {}
      emotions.forEach(e => {
        emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1
      })

      const dominantEmotions = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([emotion]) => emotion)

      const avgConfidence = emotions.reduce((sum, e) => sum + e.confidence, 0) / emotions.length

      const nervousMoments = emotions.filter(e =>
        ['Fear', 'Sad', 'Angry'].includes(e.emotion)
      ).length

      // Calculate facial analysis aggregates
      const avgEyeContact = emotions.reduce((sum, e) => sum + (e.eyeContact || 0), 0) / emotions.length
      const avgConfidenceScore = emotions.reduce((sum, e) => sum + (e.confidenceScore || 0), 0) / emotions.length
      const avgEngagement = emotions.reduce((sum, e) => sum + (e.engagementScore || 0), 0) / emotions.length

      // Count good eye contact moments (>70%)
      const goodEyeContactMoments = emotions.filter(e => (e.eyeContact || 0) > 0.7).length
      const eyeContactPercentage = (goodEyeContactMoments / emotions.length) * 100

      const emotionData = {
        dominant_emotions: dominantEmotions,
        avg_confidence: avgConfidence,
        nervous_moments: nervousMoments,
        total_emotions_detected: emotions.length,
        // Add facial analysis metrics
        avg_eye_contact: avgEyeContact,
        avg_confidence_score: avgConfidenceScore,
        avg_engagement: avgEngagement,
        eye_contact_percentage: eyeContactPercentage
      }

      // Get overall feedback
      const questionsAndScores = allAnswers.map(a => ({
        question: a.question,
        type: a.type,
        answer: a.answer,
        score: a.evaluation.score
      }))

      const response = await axios.post(API_ENDPOINTS.interview.feedback, {
        role: interviewData.role,
        questions_and_scores: questionsAndScores,
        emotion_data: emotionData
      })

      onComplete({
        answers: allAnswers,
        overallFeedback: response.data.feedback,
        emotionData,
        totalTimeSpent: allAnswers.reduce((sum, a) => sum + a.timeSpent, 0)
      })
    } catch (error) {
      console.error('Error completing interview:', error)
      // Still proceed with basic results
      onComplete({
        answers: allAnswers,
        overallFeedback: null,
        emotionData: {},
        totalTimeSpent: allAnswers.reduce((sum, a) => sum + a.timeSpent, 0)
      })
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        try {
          isRecordingRef.current = false
          recognitionRef.current.stop()
          setIsRecording(false)
          setSpeechStatus('🔴 Recording stopped')
        } catch (e) {
          console.error('Error stopping recognition:', e)
        }
      }
    } else {
      // Start recording
      if (recognitionRef.current) {
        try {
          isRecordingRef.current = true
          recognitionRef.current.start()
          setIsRecording(true)
          setSpeechStatus('🎤 Listening...')
        } catch (e) {
          console.error('Error starting recognition:', e)
          setSpeechStatus('⚠️ Could not start recording')
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {interviewData.role}
            </h2>
            <p className="text-gray-400">
              Question {currentQuestionIndex + 1} of {interviewData.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span className="text-white font-mono">{formatTime(timeElapsed)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentQuestionIndex + 1) / interviewData.questions.length) * 100}%`
            }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Webcam & Emotion */}
          <div className="lg:col-span-1 space-y-4">
            {/* Webcam */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4 overflow-hidden"
            >
              <div className="relative">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full rounded-lg"
                  mirrored
                />
                {/* Canvas overlay for bounding box */}
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </div>
            </motion.div>

            {/* Facial Analysis Dashboard */}
            <AnimatePresence mode="wait">
              {currentEmotion && (
                <motion.div
                  key={currentEmotion.timestamp}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-3"
                >
                  {/* Emotion Card */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Emotion</p>
                        <p className="text-2xl font-bold text-white">{currentEmotion.emotion}</p>
                      </div>
                      <div className="text-4xl">
                        {currentEmotion.emotion === 'Happy' && '😊'}
                        {currentEmotion.emotion === 'Neutral' && '😐'}
                        {currentEmotion.emotion === 'Sad' && '😢'}
                        {currentEmotion.emotion === 'Angry' && '😠'}
                        {currentEmotion.emotion === 'Surprise' && '😲'}
                        {currentEmotion.emotion === 'Fear' && '😨'}
                        {currentEmotion.emotion === 'Disgust' && '🤢'}
                      </div>
                    </div>
                  </div>

                  {/* Eye Contact */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-3">
                    <p className="text-gray-400 text-xs mb-1">👁️ Eye Contact</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          style={{ width: `${(currentEmotion.eyeContact || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-semibold text-sm">
                        {((currentEmotion.eyeContact || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-3">
                    <p className="text-gray-400 text-xs mb-1">💪 Confidence</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          style={{ width: `${(currentEmotion.confidenceScore || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-semibold text-sm">
                        {((currentEmotion.confidenceScore || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Engagement Score */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-3">
                    <p className="text-gray-400 text-xs mb-1">⚡ Engagement</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${(currentEmotion.engagementScore || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-semibold text-sm">
                        {((currentEmotion.engagementScore || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Head Pose */}
                  {currentEmotion.headPose && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-3">
                      <p className="text-gray-400 text-xs mb-2">🎯 Head Pose</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-white text-xs font-medium">Yaw</p>
                          <p className="text-gray-300 text-xs">{currentEmotion.headPose.yaw?.toFixed(1)}°</p>
                        </div>
                        <div>
                          <p className="text-white text-xs font-medium">Pitch</p>
                          <p className="text-gray-300 text-xs">{currentEmotion.headPose.pitch?.toFixed(1)}°</p>
                        </div>
                        <div>
                          <p className="text-white text-xs font-medium">Roll</p>
                          <p className="text-gray-300 text-xs">{currentEmotion.headPose.roll?.toFixed(1)}°</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Question & Answer */}
          <div className="lg:col-span-2 space-y-4">
            {/* Question Card */}
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-400" />
                  <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium">
                    {currentQuestion.type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentQuestion.difficulty === 'easy'
                      ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                      : currentQuestion.difficulty === 'medium'
                      ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300'
                      : 'bg-red-500/20 border border-red-500/30 text-red-300'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>
              </div>

              <p className="text-xl text-white leading-relaxed">
                {currentQuestion.question}
              </p>
            </motion.div>

            {/* Answer Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <label className="text-white font-medium">Your Answer</label>
                <button
                  onClick={toggleRecording}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-5 h-5" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      Start Recording
                    </>
                  )}
                </button>
              </div>

              {/* Speech Status */}
              {speechStatus && (
                <div className="mb-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                    {speechStatus}
                  </p>
                </div>
              )}

              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Speak your answer or type it here..."
                rows={8}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
              />

              <div className="flex items-center justify-between mt-4">
                <p className="text-gray-400 text-sm">
                  {currentAnswer.length} characters
                  {isRecording && <span className="ml-2 text-red-400">● Recording</span>}
                </p>
                <button
                  onClick={handleNextQuestion}
                  disabled={isProcessing || !currentAnswer.trim()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    isProcessing || !currentAnswer.trim()
                      ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : currentQuestionIndex === interviewData.questions.length - 1 ? (
                    <>
                      Complete Interview
                      <CheckCircle className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Next Question
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewInterface
