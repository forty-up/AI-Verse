import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Heart, Clock, Target, CheckCircle, AlertCircle, Home } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const InterviewResults = ({ results, onBackToHome }) => {
  const { answers, overallFeedback, emotionData, totalTimeSpent } = results

  const avgScore = answers.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0) / answers.length

  // Prepare chart data
  const scoreData = answers.map((answer, index) => ({
    name: `Q${index + 1}`,
    score: answer.evaluation?.score || 0,
    type: answer.type
  }))

  const emotionChartData = emotionData.dominant_emotions?.map((emotion, index) => ({
    name: emotion,
    value: index === 0 ? 40 : index === 1 ? 30 : 20
  })) || []

  const COLORS = ['#9333EA', '#EC4899', '#8B5CF6', '#F59E0B', '#10B981']

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getPerformanceLevel = (score) => {
    if (score >= 85) return { text: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' }
    if (score >= 70) return { text: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' }
    if (score >= 50) return { text: 'Average', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' }
    return { text: 'Needs Improvement', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' }
  }

  const performance = getPerformanceLevel(avgScore)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Interview Complete!
          </h1>
          <p className="text-gray-400 text-lg">
            Here's your detailed performance analysis
          </p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-purple-400" />
              <span className={`px-3 py-1 ${performance.bg} border ${performance.border} rounded-full text-sm font-medium ${performance.color}`}>
                {performance.text}
              </span>
            </div>
            <p className="text-3xl font-bold text-white">{avgScore.toFixed(1)}%</p>
            <p className="text-gray-400 text-sm">Answer Score</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6"
          >
            <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-3xl font-bold text-white">{answers.length}</p>
            <p className="text-gray-400 text-sm">Questions Answered</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6"
          >
            <Clock className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-3xl font-bold text-white">{formatTime(totalTimeSpent)}</p>
            <p className="text-gray-400 text-sm">Total Time</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6"
          >
            <Heart className="w-8 h-8 text-pink-400 mb-2" />
            <p className="text-3xl font-bold text-white">{emotionData.dominant_emotions?.[0] || 'N/A'}</p>
            <p className="text-gray-400 text-sm">Dominant Emotion</p>
          </motion.div>

          {/* Facial Analysis Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6"
          >
            <div className="text-2xl mb-2">👁️</div>
            <p className="text-3xl font-bold text-white">
              {((emotionData.avg_eye_contact || 0) * 100).toFixed(0)}%
            </p>
            <p className="text-gray-400 text-sm">Eye Contact</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6"
          >
            <div className="text-2xl mb-2">💪</div>
            <p className="text-3xl font-bold text-white">
              {((emotionData.avg_confidence_score || 0) * 100).toFixed(0)}%
            </p>
            <p className="text-gray-400 text-sm">Confidence</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6"
          >
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-3xl font-bold text-white">
              {((emotionData.avg_engagement || 0) * 100).toFixed(0)}%
            </p>
            <p className="text-gray-400 text-sm">Engagement</p>
          </motion.div>
        </div>

        {/* Facial Analysis Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-6 mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-3xl">🎯</span>
            Facial Analysis Report
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Eye Contact Details */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
                <span>👁️</span> Eye Contact Analysis
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Average Score</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                        style={{ width: `${(emotionData.avg_eye_contact || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-white font-bold">
                      {((emotionData.avg_eye_contact || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Good Contact Time</p>
                  <p className="text-white text-lg font-semibold">
                    {(emotionData.eye_contact_percentage || 0).toFixed(0)}% of interview
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-gray-300 text-sm">
                    {(emotionData.avg_eye_contact || 0) >= 0.75
                      ? '✅ Excellent camera presence!'
                      : (emotionData.avg_eye_contact || 0) >= 0.60
                      ? '👍 Good eye contact, minor improvements possible'
                      : '💡 Try looking at the camera more often'}
                  </p>
                </div>
              </div>
            </div>

            {/* Confidence Details */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-green-300 mb-3 flex items-center gap-2">
                <span>💪</span> Confidence Analysis
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Average Score</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                        style={{ width: `${(emotionData.avg_confidence_score || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-white font-bold">
                      {((emotionData.avg_confidence_score || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Confidence Level</p>
                  <p className="text-white text-lg font-semibold">
                    {(emotionData.avg_confidence_score || 0) >= 0.80
                      ? 'Very Confident'
                      : (emotionData.avg_confidence_score || 0) >= 0.65
                      ? 'Confident'
                      : 'Building Confidence'}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-gray-300 text-sm">
                    {(emotionData.avg_confidence_score || 0) >= 0.80
                      ? '✅ Strong, confident demeanor!'
                      : (emotionData.avg_confidence_score || 0) >= 0.65
                      ? '👍 Good confidence, keep it up'
                      : '💡 Work on posture and eye contact'}
                  </p>
                </div>
              </div>
            </div>

            {/* Engagement Details */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                <span>⚡</span> Engagement Analysis
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Average Score</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-white/10 rounded-full h-2">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${(emotionData.avg_engagement || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-white font-bold">
                      {((emotionData.avg_engagement || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Engagement Level</p>
                  <p className="text-white text-lg font-semibold">
                    {(emotionData.avg_engagement || 0) >= 0.80
                      ? 'Highly Engaged'
                      : (emotionData.avg_engagement || 0) >= 0.65
                      ? 'Well Engaged'
                      : 'Moderately Engaged'}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-gray-300 text-sm">
                    {(emotionData.avg_engagement || 0) >= 0.80
                      ? '✅ Enthusiastic and animated!'
                      : (emotionData.avg_engagement || 0) >= 0.65
                      ? '👍 Good energy throughout'
                      : '💡 Show more enthusiasm'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Score Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Question Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="score" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333EA" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Emotion Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Emotion Distribution</h3>
            {emotionChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={emotionChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {emotionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No emotion data available
              </div>
            )}
          </motion.div>
        </div>

        {/* AI Feedback */}
        {overallFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <h3 className="text-2xl font-bold text-white">AI-Powered Feedback</h3>
            </div>

            <div className="space-y-6">
              {/* Summary */}
              <div>
                <h4 className="text-lg font-semibold text-purple-300 mb-2">Summary</h4>
                <p className="text-gray-300 leading-relaxed">{overallFeedback.summary}</p>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="text-lg font-semibold text-green-300 mb-2">Top Strengths</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {overallFeedback.top_strengths?.map((strength, index) => (
                    <div key={index} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <p className="text-green-200 text-sm">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div>
                <h4 className="text-lg font-semibold text-yellow-300 mb-2">Areas for Improvement</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {overallFeedback.areas_for_improvement?.map((area, index) => (
                    <div key={index} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <p className="text-yellow-200 text-sm">{area}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-lg font-semibold text-blue-300 mb-2">Recommendations</h4>
                <ul className="space-y-2">
                  {overallFeedback.recommendations?.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Detailed Answers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Question-by-Question Breakdown</h3>
          <div className="space-y-6">
            {answers.map((answer, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium">
                        Question {index + 1}
                      </span>
                      <span className="px-3 py-1 bg-gray-500/20 border border-gray-500/30 rounded-full text-gray-300 text-sm font-medium">
                        {answer.type}
                      </span>
                    </div>
                    <p className="text-white font-medium mb-3">{answer.question}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-3xl font-bold ${getPerformanceLevel(answer.evaluation?.score || 0).color}`}>
                      {answer.evaluation?.score || 0}
                    </div>
                    <div className="text-gray-400 text-sm">/ 100</div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-1">Your Answer:</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{answer.answer}</p>
                </div>

                {answer.evaluation && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Feedback:</p>
                      <p className="text-gray-300 text-sm leading-relaxed">{answer.evaluation.feedback}</p>
                    </div>

                    {answer.evaluation.strengths?.length > 0 && (
                      <div>
                        <p className="text-green-400 text-sm font-medium mb-1">Strengths:</p>
                        <ul className="list-disc list-inside text-green-300 text-sm space-y-1">
                          {answer.evaluation.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {answer.evaluation.improvements?.length > 0 && (
                      <div>
                        <p className="text-yellow-400 text-sm font-medium mb-1">Could Improve:</p>
                        <ul className="list-disc list-inside text-yellow-300 text-sm space-y-1">
                          {answer.evaluation.improvements.map((i, idx) => (
                            <li key={idx}>{i}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBackToHome}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default InterviewResults
