import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, Smile, Frown, Angry, AlertCircle, ShieldAlert, X, Minus, BarChart3 } from 'lucide-react'

function EmotionResults({ data }) {
  if (!data || !data.results || data.results.length === 0) {
    return (
      <div className="bg-white bg-opacity-5 border border-white border-opacity-10 shadow-lg p-8 rounded-2xl h-full flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-4 flex justify-center"
          >
            <div className="w-20 h-20 bg-[#8A63D2] rounded-full flex items-center justify-center">
              <Smile className="w-10 h-10 text-[#1a1a1a]" strokeWidth={2} />
            </div>
          </motion.div>
          <p className="text-white text-opacity-60 font-medium">Start detection to see results</p>
        </div>
      </div>
    )
  }

  const result = data.results[0] // Show first detected face
  const chartData = Object.entries(result.probabilities).map(([emotion, probability]) => ({
    emotion,
    probability: (probability * 100).toFixed(1),
    value: probability * 100,
    icon: getEmotionIcon(emotion)
  }))

  return (
    <div className="bg-white bg-opacity-5 border border-white border-opacity-10 shadow-lg p-6 rounded-2xl space-y-6">
      {/* Primary Emotion */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center p-8 rounded-xl bg-[#8A63D2] bg-opacity-15 border border-[#8A63D2] border-opacity-30"
      >
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-6 flex justify-center"
        >
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-[#8A63D2] shadow-lg">
            {getEmotionIconComponent(result.emotion)}
          </div>
        </motion.div>
        <h2 className="text-4xl font-bold mb-2 text-white">
          {result.emotion}
        </h2>
        <div className="flex items-center justify-center gap-2">
          <TrendingUp className="w-5 h-5 text-white text-opacity-60" strokeWidth={2} />
          <span className="text-xl font-semibold text-white text-opacity-80">
            {(result.confidence * 100).toFixed(1)}% Confidence
          </span>
        </div>
      </motion.div>

      {/* Faces Detected Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-white bg-opacity-5 border border-white border-opacity-10 p-4 rounded-lg"
      >
        <span className="text-white text-opacity-60 font-medium">Faces Detected</span>
        <span className="text-2xl font-bold text-white">{data.faces_detected}</span>
      </motion.div>

      {/* Probability Chart */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
          <div className="w-8 h-8 bg-[#8A63D2] rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#1a1a1a]" strokeWidth={2} />
          </div>
          Emotion Probabilities
        </h3>
        <div className="bg-white bg-opacity-5 border border-white border-opacity-10 p-4 rounded-xl">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" strokeOpacity={0.1} />
              <XAxis
                type="number"
                stroke="#FFFFFF"
                tick={{ fill: '#FFFFFF', opacity: 0.6, fontSize: 11 }}
                domain={[0, 100]}
              />
              <YAxis
                type="category"
                dataKey="emotion"
                stroke="#FFFFFF"
                tick={{ fill: '#FFFFFF', opacity: 0.6, fontSize: 11 }}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                }}
                formatter={(value) => [`${value}%`, 'Probability']}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.emotion === result.emotion ? '#8A63D2' : '#FFFFFF'}
                    fillOpacity={entry.emotion === result.emotion ? 1 : 0.2}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Emotion Grid */}
      <div>
        <h3 className="text-lg font-bold mb-4 text-white">All Emotions</h3>
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {chartData.map((item, index) => {
              const IconComponent = item.icon
              return (
                <motion.div
                  key={item.emotion}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white bg-opacity-5 border ${
                    item.emotion === result.emotion ? 'border-[#8A63D2] border-opacity-60' : 'border-white border-opacity-10'
                  } p-4 rounded-xl hover:bg-opacity-10 transition-all`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <IconComponent
                          className="w-5 h-5 text-white"
                          style={{ opacity: item.emotion === result.emotion ? 1 : 0.5 }}
                          strokeWidth={2}
                        />
                      </motion.div>
                      <span className="text-sm font-semibold text-white">{item.emotion}</span>
                    </div>
                    <span
                      className="text-base font-bold text-white"
                      style={{ opacity: item.emotion === result.emotion ? 1 : 0.6 }}
                    >
                      {item.probability}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-white bg-opacity-10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.probability}%` }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: item.emotion === result.emotion ? '#8A63D2' : '#FFFFFF',
                        opacity: item.emotion === result.emotion ? 1 : 0.3
                      }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function getEmotionIcon(emotion) {
  const icons = {
    'Angry': Angry,
    'Disgust': X,
    'Fear': ShieldAlert,
    'Happy': Smile,
    'Neutral': Minus,
    'Sad': Frown,
    'Surprise': AlertCircle
  }
  return icons[emotion] || Smile
}

function getEmotionIconComponent(emotion) {
  const iconMap = {
    'Angry': <Angry className="w-14 h-14 text-[#1a1a1a]" strokeWidth={2} />,
    'Disgust': <X className="w-14 h-14 text-[#1a1a1a]" strokeWidth={2} />,
    'Fear': <ShieldAlert className="w-14 h-14 text-[#1a1a1a]" strokeWidth={2} />,
    'Happy': <Smile className="w-14 h-14 text-[#1a1a1a]" strokeWidth={2} />,
    'Neutral': <Minus className="w-14 h-14 text-[#1a1a1a]" strokeWidth={2} />,
    'Sad': <Frown className="w-14 h-14 text-[#1a1a1a]" strokeWidth={2} />,
    'Surprise': <AlertCircle className="w-14 h-14 text-[#1a1a1a]" strokeWidth={2} />
  }
  return iconMap[emotion] || <Smile className="w-14 h-14 text-[#1a1a1a]" strokeWidth={2} />
}

export default EmotionResults
