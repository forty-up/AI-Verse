import { motion } from 'framer-motion'
import { Github, Heart, Linkedin, Twitter } from 'lucide-react'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative px-6 py-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold gradient-text mb-3">EmotiSense</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Advanced AI-powered emotion detection using deep learning and computer vision
              to understand human emotions in real-time.
            </p>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-4">Technology</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-purple-400 transition-colors cursor-pointer">ResNet50 Architecture</li>
              <li className="hover:text-purple-400 transition-colors cursor-pointer">TensorFlow & Keras</li>
              <li className="hover:text-purple-400 transition-colors cursor-pointer">OpenCV</li>
              <li className="hover:text-purple-400 transition-colors cursor-pointer">React & Framer Motion</li>
            </ul>
          </motion.div>

          {/* Emotions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4">Emotions</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {['😊 Happy', '😢 Sad', '😠 Angry', '😲 Surprise', '😨 Fear', '🤢 Disgust', '😐 Neutral'].map((emotion) => (
                <div key={emotion} className="text-gray-400 hover:text-purple-400 transition-colors cursor-pointer">
                  {emotion}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-sm text-gray-400 flex items-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by AI Researchers
            © {currentYear}
          </p>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <motion.a
              href="#"
              whileHover={{ scale: 1.2, rotate: 5 }}
              className="w-10 h-10 glass-effect rounded-full flex items-center justify-center hover:bg-purple-500/20 transition-colors"
            >
              <Github className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.2, rotate: 5 }}
              className="w-10 h-10 glass-effect rounded-full flex items-center justify-center hover:bg-purple-500/20 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.2, rotate: 5 }}
              className="w-10 h-10 glass-effect rounded-full flex items-center justify-center hover:bg-purple-500/20 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </motion.a>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 glass-effect p-4 rounded-xl"
        >
          <p className="text-xs text-gray-500 text-center">
            This is a demonstration of AI emotion detection technology. Results may vary based on
            lighting conditions, camera quality, and facial expressions. For educational and research
            purposes only.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
