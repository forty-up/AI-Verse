import { motion } from 'framer-motion'
import { Brain, Zap, Shield, Target, Cpu, Eye, Smile, Frown, Angry, AlertCircle, ShieldAlert, X, Minus } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Deep Learning',
    description: 'ResNet50 architecture trained on extensive facial expression datasets'
  },
  {
    icon: Zap,
    title: 'Real-Time Processing',
    description: 'Instant analysis with minimal latency for smooth user experience'
  },
  {
    icon: Shield,
    title: 'Privacy Protected',
    description: 'All processing happens locally. Your data remains secure'
  },
  {
    icon: Target,
    title: 'High Accuracy',
    description: '95% precision in detecting emotional states across demographics'
  },
  {
    icon: Cpu,
    title: 'Advanced AI',
    description: 'State-of-the-art computer vision and neural network technology'
  },
  {
    icon: Eye,
    title: 'Multi-Face Detection',
    description: 'Simultaneously analyzes multiple faces in real-time'
  }
]

function Features() {
  return (
    <div className="relative px-6 py-24 bg-[#1a1a1a] bg-opacity-[0.02]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-[#1a1a1a]">
            Core <span className="text-[#8A63D2]">Capabilities</span>
          </h2>
          <p className="text-lg text-[#1a1a1a] text-opacity-70 max-w-2xl mx-auto">
            Professional-grade emotion recognition technology
            with enterprise-level reliability
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -8 }}
              className="card bg-white"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-[#8A63D2] bg-opacity-20 border border-[#8A63D2] border-opacity-30
                            flex items-center justify-center mb-5 group-hover:bg-[#8A63D2] transition-all duration-300">
                <feature.icon className="w-6 h-6 text-[#1a1a1a]" strokeWidth={2} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3 text-[#1a1a1a]">
                {feature.title}
              </h3>
              <p className="text-[#1a1a1a] text-opacity-60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Emotions showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white border-2 border-[#1a1a1a] border-opacity-10 p-12 rounded-2xl shadow-lg"
        >
          <h3 className="text-3xl font-bold text-center mb-3 text-[#1a1a1a]">
            Seven Emotional States
          </h3>
          <p className="text-center text-[#1a1a1a] text-opacity-60 mb-10 max-w-xl mx-auto">
            Our system accurately identifies and classifies emotions with consistent precision
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: Smile, name: 'Happy' },
              { icon: Frown, name: 'Sad' },
              { icon: Angry, name: 'Angry' },
              { icon: AlertCircle, name: 'Surprise' },
              { icon: ShieldAlert, name: 'Fear' },
              { icon: X, name: 'Disgust' },
              { icon: Minus, name: 'Neutral' }
            ].map((emotion, index) => {
              const IconComponent = emotion.icon
              return (
                <motion.div
                  key={emotion.name}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  className="bg-[#8A63D2] bg-opacity-10 border border-[#1a1a1a] border-opacity-10 hover:border-[#8A63D2] px-8 py-5 rounded-xl cursor-pointer hover:shadow-md transition-all"
                >
                  <motion.div
                    className="mb-2 flex justify-center"
                    whileHover={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-[#8A63D2]" strokeWidth={2} />
                    </div>
                  </motion.div>
                  <div className="text-xs font-bold text-center text-[#1a1a1a] uppercase tracking-wide">{emotion.name}</div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Features
