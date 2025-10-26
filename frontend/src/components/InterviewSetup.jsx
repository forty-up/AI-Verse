import { useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, FileText, Award, ArrowRight, Sparkles } from 'lucide-react'
import { API_ENDPOINTS } from '../config/api'

const InterviewSetup = ({ onStart }) => {
  const [formData, setFormData] = useState({
    role: '',
    jobDescription: '',
    experienceLevel: 'mid',
    numQuestions: 5
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.role.trim() || !formData.jobDescription.trim()) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(API_ENDPOINTS.interview.generate, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: formData.role,
          job_description: formData.jobDescription,
          experience_level: formData.experienceLevel,
          num_questions: parseInt(formData.numQuestions)
        })
      })

      const data = await response.json()

      if (data.success) {
        onStart({
          ...formData,
          questions: data.questions
        })
      } else {
        setError(data.error || 'Failed to generate questions')
      }
    } catch (err) {
      console.error('Error generating questions:', err)
      setError('Failed to connect to server. Make sure the backend is running and GROQ_API_KEY is set.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            AI Mock Interview
          </h1>
          <p className="text-gray-400 text-lg">
            Practice with AI-powered questions and real-time emotion analysis
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Input */}
            <div>
              <label className="flex items-center text-white font-medium mb-2">
                <Briefcase className="w-5 h-5 mr-2 text-purple-400" />
                Job Role / Position <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g., Senior Frontend Developer, Data Scientist, Product Manager"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="flex items-center text-white font-medium mb-2">
                <FileText className="w-5 h-5 mr-2 text-purple-400" />
                Job Description <span className="text-red-400 ml-1">*</span>
              </label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                placeholder="Paste the job description here or describe the key responsibilities and requirements..."
                rows={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                required
              />
            </div>

            {/* Experience Level */}
            <div>
              <label className="flex items-center text-white font-medium mb-2">
                <Award className="w-5 h-5 mr-2 text-purple-400" />
                Experience Level
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="entry" className="bg-gray-900">Entry Level (0-2 years)</option>
                <option value="mid" className="bg-gray-900">Mid Level (2-5 years)</option>
                <option value="senior" className="bg-gray-900">Senior Level (5+ years)</option>
              </select>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="flex items-center text-white font-medium mb-2">
                Number of Questions
              </label>
              <select
                name="numQuestions"
                value={formData.numQuestions}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="3" className="bg-gray-900">3 Questions (Quick)</option>
                <option value="5" className="bg-gray-900">5 Questions (Standard)</option>
                <option value="7" className="bg-gray-900">7 Questions (Comprehensive)</option>
                <option value="10" className="bg-gray-900">10 Questions (Full Interview)</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className={`w-full py-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  Start Interview
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Info Note */}
          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-purple-300">
              <strong>Note:</strong> Your interview will be recorded using your webcam for emotion analysis.
              All processing happens locally and your data is not stored.
            </p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="text-white font-semibold mb-1">Role-Specific</h3>
            <p className="text-gray-400 text-sm">Questions tailored to your exact role and JD</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-2xl mb-2">😊</div>
            <h3 className="text-white font-semibold mb-1">Emotion Tracking</h3>
            <p className="text-gray-400 text-sm">Real-time analysis of your facial expressions</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-white font-semibold mb-1">AI Scoring</h3>
            <p className="text-gray-400 text-sm">Get detailed feedback on every answer</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default InterviewSetup
