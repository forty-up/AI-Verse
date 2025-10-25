import { motion } from 'framer-motion'
import { Sparkles, Brain } from 'lucide-react'

function Hero({ onTryNow, onStartInterview }) {
  const scrollToAbout = () => {
    const element = document.getElementById('about')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Content - Ultra Minimalist */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-7xl md:text-9xl font-bold mb-6"
          style={{
            color: '#FFFFFF',
            letterSpacing: '0.05em',
            fontWeight: 700
          }}
        >
          tranquil
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          className="text-xl md:text-2xl text-white opacity-70 mb-12 font-light tracking-wide"
        >
          Master your interviews with AI-powered feedback and emotion analysis
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(138, 99, 210, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartInterview}
            className="px-12 py-5 bg-[#8A63D2] text-[#1a1a1a] rounded-full font-semibold text-lg tracking-wider shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <Brain className="w-5 h-5" />
            Start Mock Interview
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={onTryNow}
            className="px-12 py-5 bg-white bg-opacity-10 backdrop-blur-sm text-white border border-white border-opacity-30 rounded-full font-semibold text-lg tracking-wider hover:bg-opacity-20 transition-all duration-300 flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Emotion Detector
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={scrollToAbout}
            className="px-8 py-3 bg-white bg-opacity-5 backdrop-blur-sm text-white border border-white border-opacity-20 rounded-full font-medium text-base tracking-wider hover:bg-opacity-10 transition-all duration-300"
          >
            Learn More
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

export default Hero
