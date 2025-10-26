import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Pause, RotateCcw, Trophy, Star, Heart, Shield, Zap, Smile, Info } from 'lucide-react'
import Webcam from 'react-webcam'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

function EmotionGameEasy({ onBack }) {
  const canvasRef = useRef(null)
  const webcamRef = useRef(null)
  const animationRef = useRef(null)
  const audioContextRef = useRef(null)

  const gameStateRef = useRef({
    score: 0,
    lives: 5,
    speed: 2.5,
    level: 1,
    combo: 0,
    obstacles: [],
    collectibles: [],
    powerUps: [],
    particles: [],
    clouds: [],
    lastObstacleSpawn: 0,
    gameOver: false,
    isPaused: false,
    hasWon: false,
    activeShield: false,
    activeMagnet: false,
    scoreMultiplier: 1,
    backgroundOffset: 0,
    character: {
      x: 100,
      y: 250,
      width: 50,
      height: 70,
      velocityY: 0,
      isJumping: false,
      isDucking: false,
      isDashing: false,
      animFrame: 0
    }
  })

  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(5)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [hasWon, setHasWon] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState('Neutral')
  const [lastAction, setLastAction] = useState('')
  const [isDetecting, setIsDetecting] = useState(false)
  const [instructions, setInstructions] = useState(true)
  const [combo, setCombo] = useState(0)
  const [activeShield, setActiveShield] = useState(false)
  const [showEmotionFeedback, setShowEmotionFeedback] = useState(false)

  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 400
  const GROUND_Y = 320
  const GRAVITY = 0.5
  const JUMP_FORCE = -11
  const WIN_SCORE = 300 // Easier win condition

  // Emotion to action mapping
  const emotionActions = {
    Happy: { action: 'jump', emoji: '😊', color: '#4CAF50', text: 'JUMP!' },
    Angry: { action: 'dash', emoji: '😠', color: '#FF4444', text: 'DASH!' },
    Sad: { action: 'duck', emoji: '😢', color: '#2196F3', text: 'DUCK!' },
    Surprise: { action: 'jump', emoji: '😲', color: '#FFEB3B', text: 'JUMP!' },
    Fear: { action: 'slow', emoji: '😨', color: '#FF9800', text: 'SLOW' },
    Neutral: { action: 'run', emoji: '😐', color: '#607D8B', text: 'RUN' },
    Disgust: { action: 'repel', emoji: '🤢', color: '#9C27B0', text: 'REPEL' }
  }

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT

    // Initialize background clouds
    for (let i = 0; i < 3; i++) {
      gameStateRef.current.clouds.push({
        x: Math.random() * CANVAS_WIDTH,
        y: 50 + Math.random() * 80,
        width: 80 + Math.random() * 40,
        speed: 0.3 + Math.random() * 0.3
      })
    }

    gameLoop()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Emotion detection - SLOWER for easier gameplay
  useEffect(() => {
    if (!isDetecting || isPaused) return

    const interval = setInterval(async () => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot()
        if (imageSrc) {
          try {
            const response = await axios.post(API_ENDPOINTS.detect, {
              image: imageSrc
            })

            if (response.data.success && response.data.results.length > 0) {
              const emotion = response.data.results[0].emotion
              const confidence = response.data.results[0].confidence

              // Only detect if confidence is high enough
              if (confidence > 0.6) {
                setCurrentEmotion(emotion)
                handleEmotionAction(emotion)

                // Show feedback
                setShowEmotionFeedback(true)
                setTimeout(() => setShowEmotionFeedback(false), 800)
              }
            }
          } catch (error) {
            console.error('Emotion detection error:', error)
          }
        }
      }
    }, 1500) // MUCH slower detection - 1.5 seconds

    return () => clearInterval(interval)
  }, [isDetecting, isPaused])

  // Play sound
  const playSound = (frequency, duration) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }

      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.2, audioContextRef.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)

      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + duration)
    } catch (e) {
      // Silent fail for audio
    }
  }

  // Handle emotion-based actions
  const handleEmotionAction = (emotion) => {
    const emotionConfig = emotionActions[emotion]
    if (!emotionConfig) return

    const action = emotionConfig.action
    const state = gameStateRef.current
    const char = state.character

    if (state.gameOver || state.isPaused || state.hasWon) return

    setLastAction(emotionConfig.text)

    switch (action) {
      case 'jump':
        if (!char.isJumping && char.y >= GROUND_Y - char.height) {
          char.velocityY = JUMP_FORCE
          char.isJumping = true
          playSound(523.25, 0.1)
        }
        break
      case 'duck':
        if (!char.isDucking) {
          char.isDucking = true
          setTimeout(() => { char.isDucking = false }, 1000) // Longer duck time
        }
        break
      case 'dash':
        if (!char.isDashing) {
          char.isDashing = true
          playSound(659.25, 0.15)
          setTimeout(() => { char.isDashing = false }, 600) // Longer dash time
        }
        break
      default:
        break
    }
  }

  // Create particle effect
  const createParticles = (x, y, color, count = 8) => {
    const state = gameStateRef.current
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color,
        life: 40,
        size: 4 + Math.random() * 4
      })
    }
  }

  // Spawn obstacles - MUCH LESS FREQUENT
  const spawnObstacle = () => {
    const state = gameStateRef.current
    if (state.gameOver || state.hasWon) return

    const now = Date.now()
    // Minimum 2.5 seconds between obstacles (MUCH easier)
    if (now - state.lastObstacleSpawn < 2500) return

    state.lastObstacleSpawn = now

    // Only simple obstacles
    const types = ['low', 'high']
    const randomType = types[Math.floor(Math.random() * types.length)]

    let obstacle = {
      x: CANVAS_WIDTH,
      width: 40,
      height: 60,
      type: randomType,
      color: '#FF6B6B',
      points: 10
    }

    if (randomType === 'low') {
      obstacle.y = GROUND_Y - obstacle.height
    } else if (randomType === 'high') {
      obstacle.y = GROUND_Y - 140
      obstacle.height = 40
    }

    state.obstacles.push(obstacle)
  }

  // Spawn collectibles - MORE FREQUENT
  const spawnCollectible = () => {
    const state = gameStateRef.current
    if (state.gameOver || state.hasWon) return

    const collectible = {
      x: CANVAS_WIDTH,
      y: GROUND_Y - 80 - Math.random() * 100,
      width: 25,
      height: 25,
      type: 'star',
      color: '#8A63D2',
      points: 15,
      rotation: 0
    }

    state.collectibles.push(collectible)
  }

  // Spawn power-ups - MORE FREQUENT
  const spawnPowerUp = () => {
    const state = gameStateRef.current
    if (state.gameOver || state.hasWon) return

    const powerUp = {
      x: CANVAS_WIDTH,
      y: GROUND_Y - 90 - Math.random() * 60,
      width: 30,
      height: 30,
      type: 'shield',
      color: '#4CAF50',
      icon: '🛡️',
      duration: 8000, // Longer duration
      pulse: 0
    }

    state.powerUps.push(powerUp)
  }

  // Check collision - MORE FORGIVING
  const checkCollision = (rect1, rect2) => {
    const margin = 5 // Collision margin for forgiveness
    return (
      rect1.x + margin < rect2.x + rect2.width - margin &&
      rect1.x + rect1.width - margin > rect2.x + margin &&
      rect1.y + margin < rect2.y + rect2.height - margin &&
      rect1.y + rect1.height - margin > rect2.y + margin
    )
  }

  // Game loop
  const gameLoop = () => {
    const state = gameStateRef.current
    if (state.isPaused) {
      animationRef.current = requestAnimationFrame(gameLoop)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const char = state.character

    // Clear canvas with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    gradient.addColorStop(0, 'rgba(28, 51, 51, 0.05)')
    gradient.addColorStop(1, 'rgba(28, 51, 51, 0.15)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw clouds
    state.clouds.forEach(cloud => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.beginPath()
      ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, 25, 0, 0, Math.PI * 2)
      ctx.fill()

      cloud.x -= cloud.speed
      if (cloud.x < -cloud.width) {
        cloud.x = CANVAS_WIDTH + cloud.width
      }
    })

    // Draw ground
    ctx.fillStyle = '#8A63D2'
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 8)

    // Ground shadow
    const groundGradient = ctx.createLinearGradient(0, GROUND_Y - 10, 0, GROUND_Y)
    groundGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
    groundGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)')
    ctx.fillStyle = groundGradient
    ctx.fillRect(0, GROUND_Y - 10, CANVAS_WIDTH, 10)

    // Update character physics
    if (!state.gameOver && !state.hasWon) {
      char.velocityY += GRAVITY
      char.y += char.velocityY

      // Ground collision
      if (char.y >= GROUND_Y - char.height) {
        char.y = GROUND_Y - char.height
        char.velocityY = 0
        char.isJumping = false
      }

      char.animFrame = (char.animFrame + 0.08) % 4

      // Spawn obstacles - LESS FREQUENT
      if (Math.random() < 0.008) { // Much lower spawn rate
        spawnObstacle()
      }

      // Spawn collectibles - MORE FREQUENT
      if (Math.random() < 0.02) {
        spawnCollectible()
      }

      // Spawn power-ups - MORE FREQUENT
      if (Math.random() < 0.008) {
        spawnPowerUp()
      }

      // Check win condition
      if (state.score >= WIN_SCORE) {
        state.hasWon = true
        setHasWon(true)
        playSound(783.99, 0.5)
      }
    }

    // Draw character with better visuals
    const charHeight = char.isDucking ? char.height / 2 : char.height
    const charY = char.isDucking ? char.y + char.height / 2 : char.y

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.ellipse(char.x + char.width / 2, GROUND_Y + 5, char.width / 2, 5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Character body
    ctx.fillStyle = char.isDashing ? '#8A63D2' : state.activeShield ? '#4CAF50' : '#FFFFFF'
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 3

    // Rounded rectangle for character
    const radius = 10
    ctx.beginPath()
    ctx.moveTo(char.x + radius, charY)
    ctx.lineTo(char.x + char.width - radius, charY)
    ctx.quadraticCurveTo(char.x + char.width, charY, char.x + char.width, charY + radius)
    ctx.lineTo(char.x + char.width, charY + charHeight - radius)
    ctx.quadraticCurveTo(char.x + char.width, charY + charHeight, char.x + char.width - radius, charY + charHeight)
    ctx.lineTo(char.x + radius, charY + charHeight)
    ctx.quadraticCurveTo(char.x, charY + charHeight, char.x, charY + charHeight - radius)
    ctx.lineTo(char.x, charY + radius)
    ctx.quadraticCurveTo(char.x, charY, char.x + radius, charY)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Shield effect
    if (state.activeShield) {
      ctx.strokeStyle = '#4CAF50'
      ctx.lineWidth = 4
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.arc(char.x + char.width / 2, charY + charHeight / 2, char.width / 2 + 15 + Math.sin(Date.now() / 100) * 4, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Character face
    ctx.fillStyle = '#1a1a1a'
    const eyeY = char.isDucking ? charY + 12 : charY + 20

    // Eyes
    ctx.beginPath()
    ctx.arc(char.x + 15, eyeY, 4, 0, Math.PI * 2)
    ctx.arc(char.x + 35, eyeY, 4, 0, Math.PI * 2)
    ctx.fill()

    // Smile
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(char.x + char.width / 2, eyeY + 12, 12, 0.2, Math.PI - 0.2)
    ctx.stroke()

    // Dash trail
    if (char.isDashing) {
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(201, 222, 115, ${0.4 - i * 0.12})`
        ctx.fillRect(char.x - (i + 1) * 20, charY + 10, char.width - 10, charHeight - 20)
      }
    }

    // Update obstacles - SLOWER
    state.obstacles = state.obstacles.filter(obstacle => {
      obstacle.x -= state.speed

      // Draw obstacle with better visuals
      ctx.fillStyle = obstacle.color
      ctx.strokeStyle = '#CC5555'
      ctx.lineWidth = 2

      if (obstacle.type === 'low') {
        // Triangle spike
        ctx.beginPath()
        ctx.moveTo(obstacle.x, obstacle.y + obstacle.height)
        ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y)
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      } else {
        // Floating bar
        ctx.beginPath()
        ctx.roundRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 5)
        ctx.fill()
        ctx.stroke()
      }

      // Check collision
      if (!state.gameOver && !state.hasWon && checkCollision(
        { x: char.x, y: charY, width: char.width, height: charHeight },
        obstacle
      )) {
        if (char.isDashing || state.activeShield) {
          createParticles(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.color)
          state.score += obstacle.points
          state.combo++
          setScore(state.score)
          setCombo(state.combo)
          playSound(392.00, 0.1)
          return false
        } else {
          state.lives--
          setLives(state.lives)
          state.combo = 0
          setCombo(0)
          createParticles(char.x + char.width / 2, charY + charHeight / 2, '#FF4444', 15)
          playSound(196.00, 0.2)

          if (state.lives <= 0) {
            state.gameOver = true
            setGameOver(true)
          }
          return false
        }
      }

      return obstacle.x > -obstacle.width
    })

    // Update collectibles
    state.collectibles = state.collectibles.filter(collectible => {
      collectible.x -= state.speed
      collectible.rotation += 0.08

      // Draw star
      ctx.save()
      ctx.translate(collectible.x, collectible.y)
      ctx.rotate(collectible.rotation)

      ctx.fillStyle = collectible.color
      ctx.strokeStyle = '#9BAF4D'
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
        const x = Math.cos(angle) * collectible.width / 2
        const y = Math.sin(angle) * collectible.height / 2
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.restore()

      // Check collision
      if (checkCollision(
        { x: char.x, y: charY, width: char.width, height: charHeight },
        collectible
      )) {
        state.score += collectible.points
        state.combo++
        setScore(state.score)
        setCombo(state.combo)
        createParticles(collectible.x, collectible.y, collectible.color, 12)
        playSound(523.25, 0.1)
        return false
      }

      return collectible.x > -collectible.width
    })

    // Update power-ups
    state.powerUps = state.powerUps.filter(powerUp => {
      powerUp.x -= state.speed
      powerUp.pulse = (powerUp.pulse + 0.08) % (Math.PI * 2)

      const pulseSize = 8 + Math.sin(powerUp.pulse) * 4

      ctx.fillStyle = powerUp.color
      ctx.strokeStyle = '#2E7D32'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(powerUp.x, powerUp.y, powerUp.width / 2 + pulseSize, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(powerUp.icon, powerUp.x, powerUp.y)

      // Check collision
      if (checkCollision(
        { x: char.x, y: charY, width: char.width, height: charHeight },
        powerUp
      )) {
        state.activeShield = true
        setActiveShield(true)
        setTimeout(() => {
          state.activeShield = false
          setActiveShield(false)
        }, powerUp.duration)

        createParticles(powerUp.x, powerUp.y, powerUp.color, 15)
        playSound(659.25, 0.2)
        return false
      }

      return powerUp.x > -powerUp.width
    })

    // Update particles
    state.particles = state.particles.filter(particle => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.15
      particle.life--

      ctx.fillStyle = particle.color
      ctx.globalAlpha = particle.life / 40
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      return particle.life > 0
    })

    // Increase difficulty SLOWLY
    if (state.score > 0 && state.score % 150 === 0 && state.speed < 4) {
      state.speed = Math.min(state.speed + 0.3, 4)
      state.level = Math.floor(state.score / 150) + 1
      setLevel(state.level)
    }

    // Draw combo
    if (state.combo > 2) {
      ctx.font = 'bold 28px Inter'
      ctx.fillStyle = '#8A63D2'
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 3
      ctx.textAlign = 'center'
      ctx.strokeText(`COMBO x${state.combo}!`, CANVAS_WIDTH / 2, 60)
      ctx.fillText(`COMBO x${state.combo}!`, CANVAS_WIDTH / 2, 60)
    }

    animationRef.current = requestAnimationFrame(gameLoop)
  }

  const startGame = () => {
    setInstructions(false)
    setIsDetecting(true)
  }

  const resetGame = () => {
    const state = gameStateRef.current
    state.score = 0
    state.lives = 5
    state.level = 1
    state.speed = 2.5
    state.combo = 0
    state.obstacles = []
    state.collectibles = []
    state.powerUps = []
    state.particles = []
    state.lastObstacleSpawn = 0
    state.gameOver = false
    state.hasWon = false
    state.activeShield = false
    state.scoreMultiplier = 1
    state.character.x = 100
    state.character.y = 250
    state.character.velocityY = 0
    state.character.isJumping = false

    setScore(0)
    setLives(5)
    setLevel(1)
    setCombo(0)
    setGameOver(false)
    setHasWon(false)
    setIsPaused(false)
    setInstructions(true)
    setIsDetecting(false)
    setActiveShield(false)
    setLastAction('')
  }

  const togglePause = () => {
    gameStateRef.current.isPaused = !isPaused
    setIsPaused(!isPaused)
  }

  const emotionConfig = emotionActions[currentEmotion] || emotionActions.Neutral

  return (
    <div className="min-h-screen relative py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Clean Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-6 py-3 bg-white bg-opacity-10 backdrop-blur-md text-white border border-white border-opacity-30 rounded-xl font-semibold flex items-center gap-2 hover:bg-opacity-20 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </motion.button>

          <h1 className="text-3xl md:text-4xl font-bold text-white">Emotion Runner</h1>
        </div>

        {/* Main Game Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Stats */}
          <div className="space-y-4">
            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-30 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-white text-lg font-medium">Score</span>
                <Star className="w-6 h-6 text-[#8A63D2]" />
              </div>
              <div className="text-5xl font-bold text-[#8A63D2] mb-2">{score}</div>
              <div className="text-sm text-white opacity-60">Goal: {WIN_SCORE}</div>

              {/* Progress Bar */}
              <div className="mt-4 w-full h-3 bg-white bg-opacity-10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#8A63D2] to-[#9BAF4D]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((score / WIN_SCORE) * 100, 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>

            {/* Lives Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-30 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-white text-lg font-medium">Lives</span>
                <Heart className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: i < lives ? 1 : 0.3 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Heart
                      className={`w-8 h-8 ${i < lives ? 'text-red-400 fill-red-400' : 'text-gray-600'}`}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Current Emotion Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-30 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-white text-lg font-medium">Detected</span>
                <Smile className="w-6 h-6 text-[#8A63D2]" />
              </div>
              <div className="text-center">
                <div className="text-6xl mb-2">{emotionConfig.emoji}</div>
                <div className="text-2xl font-bold text-white mb-1">{currentEmotion}</div>
                <AnimatePresence>
                  {showEmotionFeedback && lastAction && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="inline-block px-4 py-2 bg-[#8A63D2] text-[#1a1a1a] rounded-full font-bold text-sm"
                    >
                      {lastAction}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Active Effects */}
            <AnimatePresence>
              {(activeShield || combo > 2) && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-30 rounded-2xl p-4"
                >
                  <div className="text-white text-sm font-medium mb-2">Active Effects:</div>
                  <div className="space-y-2">
                    {activeShield && (
                      <div className="flex items-center gap-2 text-green-400">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-medium">Shield Protected</span>
                      </div>
                    )}
                    {combo > 2 && (
                      <div className="flex items-center gap-2 text-[#8A63D2]">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium">Combo x{combo}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Center Panel - Game Canvas */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-30 rounded-2xl p-6">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full border-4 border-[#8A63D2] rounded-xl bg-[#1a1a1a] bg-opacity-30 shadow-2xl"
                  style={{ imageRendering: 'auto' }}
                />

                {/* Instructions Overlay */}
                {instructions && (
                  <div className="absolute inset-0 bg-[#1a1a1a] bg-opacity-98 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center px-8 max-w-2xl">
                      <Info className="w-16 h-16 text-[#8A63D2] mx-auto mb-4" />
                      <h3 className="text-4xl font-bold text-white mb-6">How to Play</h3>

                      <div className="bg-white bg-opacity-5 rounded-xl p-6 mb-6 text-left">
                        <p className="text-[#8A63D2] font-bold text-lg mb-4">Use Your Emotions:</p>
                        <div className="grid grid-cols-2 gap-4 text-white">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">😊</span>
                            <div>
                              <div className="font-semibold">Happy</div>
                              <div className="text-sm opacity-70">Jump over obstacles</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">😠</span>
                            <div>
                              <div className="font-semibold">Angry</div>
                              <div className="text-sm opacity-70">Dash through obstacles</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">😢</span>
                            <div>
                              <div className="font-semibold">Sad</div>
                              <div className="text-sm opacity-70">Duck under barriers</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">😐</span>
                            <div>
                              <div className="font-semibold">Neutral</div>
                              <div className="text-sm opacity-70">Run normally</div>
                            </div>
                          </div>
                        </div>

                        <p className="text-[#8A63D2] font-bold text-lg mt-6 mb-3">Collect & Survive:</p>
                        <div className="text-white space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">⭐</span>
                            <span>Collect stars for points (+15)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🛡️</span>
                            <span>Grab shields for protection</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🏆</span>
                            <span>Reach {WIN_SCORE} points to win!</span>
                          </div>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startGame}
                        className="px-10 py-4 bg-[#8A63D2] text-[#1a1a1a] rounded-xl font-bold text-xl flex items-center gap-3 mx-auto shadow-lg"
                      >
                        <Play className="w-7 h-7" />
                        Start Game
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Win Overlay */}
                {hasWon && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 bg-[#1a1a1a] bg-opacity-98 rounded-xl flex items-center justify-center backdrop-blur-sm"
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                        transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
                      >
                        <Trophy className="w-32 h-32 text-[#8A63D2] mx-auto mb-6" />
                      </motion.div>
                      <h3 className="text-6xl font-bold text-white mb-4">🎉 Victory! 🎉</h3>
                      <p className="text-4xl text-[#8A63D2] font-bold mb-6">{score} Points</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetGame}
                        className="px-10 py-4 bg-[#8A63D2] text-[#1a1a1a] rounded-xl font-bold text-xl flex items-center gap-3 mx-auto"
                      >
                        <RotateCcw className="w-7 h-7" />
                        Play Again
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Game Over Overlay */}
                {gameOver && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-[#1a1a1a] bg-opacity-98 rounded-xl flex items-center justify-center backdrop-blur-sm"
                  >
                    <div className="text-center">
                      <h3 className="text-5xl font-bold text-white mb-4">Game Over</h3>
                      <p className="text-3xl text-[#8A63D2] font-bold mb-6">Score: {score}</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetGame}
                        className="px-10 py-4 bg-[#8A63D2] text-[#1a1a1a] rounded-xl font-bold text-xl flex items-center gap-3 mx-auto"
                      >
                        <RotateCcw className="w-7 h-7" />
                        Try Again
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Game Controls */}
              {!instructions && !gameOver && !hasWon && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePause}
                    className="px-8 py-3 bg-[#8A63D2] text-[#1a1a1a] rounded-xl font-bold flex items-center gap-2 shadow-lg"
                  >
                    {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="px-8 py-3 bg-white bg-opacity-10 backdrop-blur-md text-white border border-white border-opacity-30 rounded-xl font-bold flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Restart
                  </motion.button>
                </div>
              )}
            </div>

            {/* Webcam */}
            <div className="bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Camera Feed</h3>
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full rounded-xl border-4 border-[#8A63D2] shadow-lg"
                mirrored
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmotionGameEasy
