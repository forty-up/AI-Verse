import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, Eye, MessageSquare, Shield, Users, Clock, CheckCircle, Award, AlertCircle } from 'lucide-react'

function ComprehensiveFeedback({ sessionData, onClose }) {
  if (!sessionData || !sessionData.metrics) {
    return null
  }

  const { metrics, duration, totalFrames } = sessionData

  // Get score color based on value
  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50' // Green
    if (score >= 60) return '#8A63D2' // Violet
    if (score >= 40) return '#FF9800' // Orange
    return '#FF4444' // Red
  }

  // Get score label
  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}m ${secs}s`
  }

  const parameters = [
    {
      name: 'Confidence',
      icon: Award,
      description: 'Maintain positive body language',
      score: metrics.confidence,
      feedback: metrics.confidenceFeedback,
      color: '#8A63D2'
    },
    {
      name: 'Eye Contact',
      icon: Eye,
      description: 'Practice proper engagement',
      score: metrics.eyeContact,
      feedback: metrics.eyeContactFeedback,
      color: '#2196F3'
    },
    {
      name: 'Communication',
      icon: MessageSquare,
      description: 'Clear and effective speech',
      score: metrics.communication,
      feedback: metrics.communicationFeedback,
      color: '#4CAF50'
    },
    {
      name: 'Composure',
      icon: Shield,
      description: 'Stay calm under pressure',
      score: metrics.composure,
      feedback: metrics.composureFeedback,
      color: '#9C27B0'
    },
    {
      name: 'Presence',
      icon: Users,
      description: 'Professional demeanor',
      score: metrics.presence,
      feedback: metrics.presenceFeedback,
      color: '#FF9800'
    },
    {
      name: 'Timing',
      icon: Clock,
      description: 'Pacing and rhythm',
      score: metrics.timing,
      feedback: metrics.timingFeedback,
      color: '#00BCD4'
    },
    {
      name: 'Readiness',
      icon: CheckCircle,
      description: 'Interview preparedness',
      score: metrics.readiness,
      feedback: metrics.readinessFeedback,
      color: '#FF5722'
    }
  ]

  // Calculate overall score
  const overallScore = Math.round(
    parameters.reduce((sum, param) => sum + param.score, 0) / parameters.length
  )

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-[#1a1a1a] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white border-opacity-10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#1a1a1a] border-b border-white border-opacity-10 p-6 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Comprehensive Feedback Report
                </h2>
                <p className="text-gray-light text-sm">
                  Session Duration: {formatDuration(duration)} • {totalFrames} frames analyzed
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Overall Score */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mt-6 text-center"
            >
              <div className="inline-block relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={getScoreColor(overallScore)}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${2 * Math.PI * 56}` }}
                    animate={{ strokeDasharray: `${(overallScore / 100) * 2 * Math.PI * 56} ${2 * Math.PI * 56}` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-white">{overallScore}</div>
                  <div className="text-xs text-gray-light">Overall Score</div>
                </div>
              </div>
              <div className="mt-3">
                <span
                  className="px-4 py-1 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: `${getScoreColor(overallScore)}20`,
                    color: getScoreColor(overallScore)
                  }}
                >
                  {getScoreLabel(overallScore)}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Parameters Grid */}
          <div className="p-6 grid md:grid-cols-2 gap-4">
            {parameters.map((param, index) => (
              <motion.div
                key={param.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white bg-opacity-5 backdrop-blur-lg rounded-xl p-5 border border-white border-opacity-10 hover:bg-opacity-10 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${param.color}20` }}
                  >
                    <param.icon className="w-6 h-6" style={{ color: param.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-bold text-white">{param.name}</h3>
                      <div
                        className="text-2xl font-bold"
                        style={{ color: getScoreColor(param.score) }}
                      >
                        {param.score}
                      </div>
                    </div>
                    <p className="text-xs text-gray-light mb-3">{param.description}</p>

                    {/* Score Bar */}
                    <div className="w-full bg-white bg-opacity-10 rounded-full h-2 mb-3 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: getScoreColor(param.score) }}
                        initial={{ width: 0 }}
                        animate={{ width: `${param.score}%` }}
                        transition={{ duration: 0.8, delay: 0.2 * index }}
                      />
                    </div>

                    {/* Feedback */}
                    <div className="bg-black bg-opacity-30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-light flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-light leading-relaxed">
                          {param.feedback}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary & Recommendations */}
          <div className="p-6 bg-white bg-opacity-5 border-t border-white border-opacity-10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#8A63D2]" />
              Key Recommendations
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-green-400 mb-2">Strengths</h4>
                <ul className="space-y-1 text-sm text-gray-light">
                  {parameters
                    .filter(p => p.score >= 70)
                    .map(p => (
                      <li key={p.name} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>{p.name}</span>
                      </li>
                    ))}
                  {parameters.filter(p => p.score >= 70).length === 0 && (
                    <li className="text-gray-medium">Continue practicing to build strengths</li>
                  )}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-orange-500 bg-opacity-10 border border-orange-500 border-opacity-30 rounded-lg p-4">
                <h4 className="font-semibold text-orange-400 mb-2">Focus Areas</h4>
                <ul className="space-y-1 text-sm text-gray-light">
                  {parameters
                    .filter(p => p.score < 70)
                    .sort((a, b) => a.score - b.score)
                    .slice(0, 3)
                    .map(p => (
                      <li key={p.name} className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <span>{p.name} ({p.score}/100)</span>
                      </li>
                    ))}
                  {parameters.filter(p => p.score < 70).length === 0 && (
                    <li className="text-gray-medium">Excellent work across all areas!</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-white border-opacity-10 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Got It
            </button>
            <button
              onClick={() => {
                // Download report as text
                const report = generateTextReport(sessionData, parameters, overallScore)
                const blob = new Blob([report], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `feedback-report-${Date.now()}.txt`
                a.click()
              }}
              className="btn-secondary flex items-center gap-2"
            >
              Download Report
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Generate text report
function generateTextReport(sessionData, parameters, overallScore) {
  const { duration, totalFrames } = sessionData
  const date = new Date().toLocaleString()

  let report = `
╔════════════════════════════════════════════════════════════╗
║        EMOTISENSE COMPREHENSIVE FEEDBACK REPORT            ║
╚════════════════════════════════════════════════════════════╝

Generated: ${date}
Session Duration: ${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s
Frames Analyzed: ${totalFrames}

OVERALL SCORE: ${overallScore}/100

═══════════════════════════════════════════════════════════

DETAILED ANALYSIS
═══════════════════════════════════════════════════════════

`

  parameters.forEach(param => {
    report += `
${param.name.toUpperCase()} - ${param.score}/100
${'-'.repeat(60)}
${param.description}

Feedback: ${param.feedback}

`
  })

  report += `
═══════════════════════════════════════════════════════════

SUMMARY
═══════════════════════════════════════════════════════════

STRENGTHS:
`
  parameters.filter(p => p.score >= 70).forEach(p => {
    report += `  ✓ ${p.name} (${p.score}/100)\n`
  })

  report += `
FOCUS AREAS:
`
  parameters.filter(p => p.score < 70).forEach(p => {
    report += `  → ${p.name} (${p.score}/100)\n`
  })

  report += `
═══════════════════════════════════════════════════════════

Thank you for using EmotiSense!

═══════════════════════════════════════════════════════════
`

  return report
}

export default ComprehensiveFeedback
