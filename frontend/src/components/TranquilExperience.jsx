import { motion } from 'framer-motion'
import { Smile, Eye, MessageSquare, TrendingUp, Users, Clock, CheckCircle } from 'lucide-react'

function TranquilExperience() {
  const features = [
    { icon: Smile, name: 'Confidence', color: '#4CAF50', desc: 'Maintain positive body language' },
    { icon: Eye, name: 'Eye Contact', color: '#2196F3', desc: 'Practice proper engagement' },
    { icon: MessageSquare, name: 'Communication', color: '#FF9800', desc: 'Clear and effective speech' },
    { icon: TrendingUp, name: 'Composure', color: '#9C27B0', desc: 'Stay calm under pressure' },
    { icon: Users, name: 'Presence', color: '#FF4444', desc: 'Professional demeanor' },
    { icon: Clock, name: 'Timing', color: '#607D8B', desc: 'Pacing and rhythm' },
    { icon: CheckCircle, name: 'Readiness', color: '#8A63D2', desc: 'Interview preparedness' }
  ]

  return (
    <div id="emotions" className="min-h-screen relative overflow-hidden py-20 px-6">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-7xl font-bold mb-6 text-white" style={{ letterSpacing: '0.05em' }}>
            What We Analyze
          </h2>
          <p className="text-xl md:text-2xl text-white opacity-70 max-w-3xl mx-auto font-light">
            Comprehensive feedback on key interview performance metrics
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 hover:bg-opacity-20"
            >
              <div className="mb-4">
                <feature.icon className="w-10 h-10 mx-auto" style={{ color: feature.color }} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {feature.name}
              </h3>
              <p className="text-xs text-white opacity-60">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-32 text-center"
        >
          <h3 className="text-4xl md:text-5xl font-bold mb-12 text-white">
            Your Interview Journey
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Practice', desc: 'Answer common interview questions in front of your webcam' },
              { step: '02', title: 'Get Feedback', desc: 'AI analyzes your emotions, body language, and communication style' },
              { step: '03', title: 'Improve', desc: 'Review detailed insights and practice again to master your skills' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-left"
              >
                <div className="text-6xl font-bold mb-4" style={{ color: '#8A63D2', opacity: 0.3 }}>
                  {item.step}
                </div>
                <h4 className="text-2xl font-semibold mb-3 text-white">
                  {item.title}
                </h4>
                <p className="text-white opacity-60 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default TranquilExperience
