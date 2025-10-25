import { motion } from 'framer-motion'
import { Brain, Target, Video, TrendingUp } from 'lucide-react'

function TranquilAbout() {
  const features = [
    {
      icon: Brain,
      title: 'AI Feedback',
      description: 'Get instant AI-powered analysis on your body language and communication'
    },
    {
      icon: Video,
      title: 'Live Practice',
      description: 'Practice with real-time webcam feedback and emotion tracking'
    },
    {
      icon: Target,
      title: 'Confidence Boost',
      description: 'Build confidence with detailed performance metrics and insights'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your improvement over time with comprehensive analytics'
    }
  ]

  return (
    <div id="about" className="min-h-screen relative overflow-hidden py-20 px-6">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-7xl font-bold mb-6 text-white" style={{ letterSpacing: '0.05em' }}>
            Why tranquil?
          </h2>
          <p className="text-xl md:text-2xl text-white opacity-70 max-w-3xl mx-auto font-light">
            The smartest way to prepare for your dream job interview
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 p-6 rounded-xl transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg cursor-pointer group hover:bg-opacity-20"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-[#8A63D2] bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all">
                  <feature.icon className="w-8 h-8 text-[#8A63D2]" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-white opacity-60 text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center py-16"
        >
          <blockquote className="text-3xl md:text-4xl font-light italic text-white max-w-4xl mx-auto leading-relaxed">
            "Confidence is built through practice. Excellence is achieved through feedback."
          </blockquote>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
          {[
            { number: '7', label: 'Emotions Tracked' },
            { number: '95%', label: 'Success Rate' },
            { number: '∞', label: 'Practice Sessions' },
            { number: '100%', label: 'Private & Secure' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <h3 className="text-5xl md:text-6xl font-bold mb-2" style={{ color: '#8A63D2' }}>
                {stat.number}
              </h3>
              <p className="text-white opacity-60 text-lg">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TranquilAbout
