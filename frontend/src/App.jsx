import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TranquilAbout from './components/TranquilAbout'
import TranquilExperience from './components/TranquilExperience'
import EmotionDetector from './components/EmotionDetector'
import InterviewSetup from './components/InterviewSetup'
import InterviewInterface from './components/InterviewInterface'
import InterviewResults from './components/InterviewResults'

function App() {
  // App modes: 'home', 'emotion-detector', 'interview-setup', 'interview', 'results'
  const [mode, setMode] = useState('home')
  const [interviewData, setInterviewData] = useState(null)
  const [interviewResults, setInterviewResults] = useState(null)

  const handleStartInterview = (data) => {
    setInterviewData(data)
    setMode('interview')
  }

  const handleInterviewComplete = (results) => {
    setInterviewResults(results)
    setMode('results')
  }

  const handleBackToHome = () => {
    setMode('home')
    setInterviewData(null)
    setInterviewResults(null)
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#1a1a1a]">
      {/* Global Mountain Background - Fixed & Monochrome */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed grayscale"
          style={{
            backgroundImage: 'url(/background.jpg)',
            opacity: 0.15,
            filter: 'grayscale(100%) contrast(1.1)'
          }}
        />
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {mode === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Navbar
                onTryNow={() => setMode('emotion-detector')}
                onStartInterview={() => setMode('interview-setup')}
              />
              <Hero
                onTryNow={() => setMode('emotion-detector')}
                onStartInterview={() => setMode('interview-setup')}
              />
              <TranquilAbout />
              <TranquilExperience />
            </motion.div>
          )}

          {mode === 'emotion-detector' && (
            <motion.div
              key="emotion-detector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <EmotionDetector onBack={handleBackToHome} />
            </motion.div>
          )}

          {mode === 'interview-setup' && (
            <motion.div
              key="interview-setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <InterviewSetup onStart={handleStartInterview} />
            </motion.div>
          )}

          {mode === 'interview' && interviewData && (
            <motion.div
              key="interview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <InterviewInterface
                interviewData={interviewData}
                onComplete={handleInterviewComplete}
              />
            </motion.div>
          )}

          {mode === 'results' && interviewResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <InterviewResults
                results={interviewResults}
                onBackToHome={handleBackToHome}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
