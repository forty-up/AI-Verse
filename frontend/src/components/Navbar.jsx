import { motion } from 'framer-motion'

function Navbar({ onTryNow, onStartInterview }) {
  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 right-0 z-50 px-8 py-6"
    >
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => scrollToSection('about')}
          className="px-6 py-2.5 bg-white bg-opacity-10 backdrop-blur-md text-white border border-white border-opacity-20 rounded-lg font-medium hover:bg-opacity-20 transition-all duration-300"
        >
          Features
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onTryNow}
          className="px-6 py-2.5 bg-white bg-opacity-10 backdrop-blur-md text-white border border-white border-opacity-20 rounded-lg font-medium hover:bg-opacity-20 transition-all duration-300"
        >
          Emotion Detector
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartInterview}
          className="px-8 py-2.5 bg-[#8A63D2] text-[#1a1a1a] rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
        >
          Start Interview
        </motion.button>
      </div>
    </motion.nav>
  )
}

export default Navbar
