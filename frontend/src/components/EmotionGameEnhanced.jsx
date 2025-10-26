import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Pause, RotateCcw, Trophy, Star, Heart, Shield, Zap } from 'lucide-react'
import Webcam from 'react-webcam'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

function EmotionGameEnhanced({ onBack }) {
  const canvasRef = useRef(null)
  const webcamRef = useRef(null)
  const animationRef = useRef(null)
  const audioContextRef = useRef(null)

  const gameStateRef = useRef({
    score: 0,
    lives: 3,
    speed: 4,
    level: 1,
    distance: 0,
    combo: 0,
    obstacles: [],
    collectibles: [],
    powerUps: [],
    particles: [],
    clouds: [],
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
      width: 40,
      height: 60,
      velocityY: 0,
      isJumping: false,
      isDucking: false,
      isDashing: false,
      animFrame: 0
    }
  })

  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [hasWon, setHasWon] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState('Neutral')
  const [isDetecting, setIsDetecting] = useState(false)
  const [instructions, setInstructions] = useState(true)
  const [combo, setCombo] = useState(0)
  const [activeShield, setActiveShield] = useState(false)
  const [activeMagnet, setActiveMagnet] = useState(false)

  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 400
  const GROUND_Y = 300
  const GRAVITY = 0.6
  const JUMP_FORCE = -12
  const WIN_SCORE = 500

  // Obstacle types
  const obstacleTypes = {
    spike: { width: 30, height: 50, color: '#FF4444', points: 5 },
    wall: { width: 40, height: 80, color: '#FF6B6B', points: 10 },
    flying: { width: 35, height: 35, color: '#FF9800', points: 8, flies: true },
    moving: { width: 30, height: 50, color: '#E74C3C', points: 7, moves: true }
  }

  // Power-up types
  const powerUpTypes = {
    shield: { color: '#4CAF50', icon: '🛡️', duration: 5000 },
    magnet: { color: '#2196F3', icon: '🧲', duration: 5000 },
    multiplier: { color: '#9C27B0', icon: '✖️', duration: 5000 }
  }

  // Emotion to action mapping
  const emotionActions = {
    Happy: 'jump',
    Angry: 'dash',
    Sad: 'duck',
    Surprise: 'jump',
    Fear: 'slow',
    Neutral: 'run',
    Disgust: 'repel'
  }

  // Initialize canvas and audio
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT

    // Initialize background clouds
    for (let i = 0; i < 5; i++) {
      gameStateRef.current.clouds.push({
        x: Math.random() * CANVAS_WIDTH,
        y: 50 + Math.random() * 100,
        width: 60 + Math.random() * 40,
        speed: 0.5 + Math.random() * 0.5
      })
    }

    // Start game loop
    gameLoop()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Emotion detection
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
              setCurrentEmotion(emotion)
              handleEmotionAction(emotion)
            }
          } catch (error) {
            console.error('Emotion detection error:', error)
          }
        }
      }
    }, 800)

    return () => clearInterval(interval)
  }, [isDetecting, isPaused])

  // Play sound (simple beep using Web Audio API)
  const playSound = (frequency, duration) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }

    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)

    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + duration)
  }

  // Handle emotion-based actions
  const handleEmotionAction = (emotion) => {
    const action = emotionActions[emotion]
    const state = gameStateRef.current
    const char = state.character

    if (state.gameOver || state.isPaused || state.hasWon) return

    switch (action) {
      case 'jump':
        if (!char.isJumping && char.y >= GROUND_Y - char.height) {
          char.velocityY = JUMP_FORCE
          char.isJumping = true
          playSound(523.25, 0.1) // C5 note
        }
        break
      case 'duck':
        char.isDucking = true
        setTimeout(() => { char.isDucking = false }, 600)
        break
      case 'dash':
        if (!char.isDashing) {
          char.isDashing = true
          playSound(659.25, 0.15) // E5 note
          setTimeout(() => { char.isDashing = false }, 400)
        }
        break
      default:
        break
    }
  }

  // Create particle effect
  const createParticles = (x, y, color, count = 10) => {
    const state = gameStateRef.current
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        color,
        life: 30,
        size: 3 + Math.random() * 3
      })
    }
  }

  // Spawn obstacles with variety
  const spawnObstacle = () => {
    const state = gameStateRef.current
    if (state.gameOver || state.hasWon) return

    const types = Object.keys(obstacleTypes)
    const randomType = types[Math.floor(Math.random() * types.length)]
    const config = obstacleTypes[randomType]

    let obstacle = {
      x: CANVAS_WIDTH,
      width: config.width,
      height: config.height,
      type: randomType,
      color: config.color,
      points: config.points,
      ...config
    }

    if (randomType === 'flying') {
      obstacle.y = GROUND_Y - 120 - Math.random() * 50
      obstacle.amplitude = 20
      obstacle.frequency = 0.05
    } else if (randomType === 'moving') {
      obstacle.y = GROUND_Y - obstacle.height
      obstacle.moveY = GROUND_Y - 100
      obstacle.moveDirection = 1
    } else if (randomType === 'wall') {
      obstacle.y = GROUND_Y - obstacle.height
    } else {
      obstacle.y = GROUND_Y - obstacle.height
    }

    state.obstacles.push(obstacle)
  }

  // Spawn collectibles (stars)
  const spawnCollectible = () => {
    const state = gameStateRef.current
    if (state.gameOver || state.hasWon) return

    const types = ['star', 'gem', 'coin']
    const randomType = types[Math.floor(Math.random() * types.length)]

    const collectible = {
      x: CANVAS_WIDTH,
      y: GROUND_Y - 80 - Math.random() * 120,
      width: 20,
      height: 20,
      type: randomType,
      color: randomType === 'gem' ? '#9C27B0' : randomType === 'coin' ? '#FFC107' : '#8A63D2',
      points: randomType === 'gem' ? 20 : randomType === 'coin' ? 15 : 10,
      rotation: 0
    }

    state.collectibles.push(collectible)
  }

  // Spawn power-ups
  const spawnPowerUp = () => {
    const state = gameStateRef.current
    if (state.gameOver || state.hasWon) return

    const types = Object.keys(powerUpTypes)
    const randomType = types[Math.floor(Math.random() * types.length)]
    const config = powerUpTypes[randomType]

    const powerUp = {
      x: CANVAS_WIDTH,
      y: GROUND_Y - 100 - Math.random() * 80,
      width: 25,
      height: 25,
      type: randomType,
      color: config.color,
      icon: config.icon,
      duration: config.duration,
      pulse: 0
    }

    state.powerUps.push(powerUp)
  }

  // Check collision
  const checkCollision = (rect1, rect2) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
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

    // Clear canvas
    ctx.fillStyle = 'rgba(28, 51, 51, 0.1)'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw parallax background
    state.backgroundOffset -= state.speed * 0.1
    if (state.backgroundOffset <= -CANVAS_WIDTH) {
      state.backgroundOffset = 0
    }

    // Draw clouds
    state.clouds.forEach(cloud => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.beginPath()
      ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, 20, 0, 0, Math.PI * 2)
      ctx.fill()

      cloud.x -= cloud.speed
      if (cloud.x < -cloud.width) {
        cloud.x = CANVAS_WIDTH + cloud.width
      }
    })

    // Draw ground with pattern
    ctx.fillStyle = '#8A63D2'
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 5)

    // Ground decorations
    for (let i = 0; i < CANVAS_WIDTH; i += 40) {
      const offset = (state.backgroundOffset + i) % CANVAS_WIDTH
      ctx.fillStyle = 'rgba(201, 222, 115, 0.3)'
      ctx.fillRect(offset, GROUND_Y, 20, 3)
    }

    // Update character physics
    if (!state.gameOver && !state.hasWon) {
      char.velocityY += GRAVITY
      char.y += char.velocityY
      state.distance += state.speed * 0.1

      // Ground collision
      if (char.y >= GROUND_Y - char.height) {
        char.y = GROUND_Y - char.height
        char.velocityY = 0
        char.isJumping = false
      }

      // Animation frame
      char.animFrame = (char.animFrame + 0.1) % 4

      // Spawn obstacles
      if (Math.random() < 0.015 + state.level * 0.002) {
        spawnObstacle()
      }

      // Spawn collectibles
      if (Math.random() < 0.012) {
        spawnCollectible()
      }

      // Spawn power-ups (rare)
      if (Math.random() < 0.003) {
        spawnPowerUp()
      }

      // Check win condition
      if (state.score >= WIN_SCORE) {
        state.hasWon = true
        setHasWon(true)
        playSound(783.99, 0.5) // G5 note
      }
    }

    // Draw character with animation
    const charHeight = char.isDucking ? char.height / 2 : char.height
    const charY = char.isDucking ? char.y + char.height / 2 : char.y

    // Character body
    ctx.fillStyle = char.isDashing ? '#8A63D2' : state.activeShield ? '#4CAF50' : '#FFFFFF'
    ctx.fillRect(char.x, charY, char.width, charHeight)

    // Shield effect
    if (state.activeShield) {
      ctx.strokeStyle = '#4CAF50'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(char.x + char.width / 2, charY + charHeight / 2, char.width / 2 + 10 + Math.sin(Date.now() / 100) * 3, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Character eyes
    ctx.fillStyle = '#1a1a1a'
    const eyeY = char.isDucking ? charY + 10 : charY + 15
    ctx.fillRect(char.x + 10, eyeY, 5, 5)
    ctx.fillRect(char.x + 25, eyeY, 5, 5)

    // Character smile
    if (currentEmotion === 'Happy') {
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(char.x + char.width / 2, eyeY + 10, 10, 0, Math.PI)
      ctx.stroke()
    }

    // Dash trail effect
    if (char.isDashing) {
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(201, 222, 115, ${0.3 - i * 0.1})`
        ctx.fillRect(char.x - (i + 1) * 15, charY, char.width, charHeight)
      }
    }

    // Update and draw obstacles
    state.obstacles = state.obstacles.filter(obstacle => {
      obstacle.x -= state.speed

      // Flying obstacle movement
      if (obstacle.flies) {
        obstacle.y += Math.sin(obstacle.x * obstacle.frequency) * obstacle.amplitude * 0.1
      }

      // Moving obstacle
      if (obstacle.moves) {
        obstacle.y += obstacle.moveDirection * 2
        if (obstacle.y <= obstacle.moveY || obstacle.y >= GROUND_Y - obstacle.height) {
          obstacle.moveDirection *= -1
        }
      }

      // Draw obstacle
      ctx.fillStyle = obstacle.color
      if (obstacle.type === 'spike') {
        // Draw triangle
        ctx.beginPath()
        ctx.moveTo(obstacle.x, obstacle.y + obstacle.height)
        ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y)
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height)
        ctx.closePath()
        ctx.fill()
      } else if (obstacle.type === 'flying') {
        // Draw flying enemy
        ctx.beginPath()
        ctx.arc(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.width / 2, 0, Math.PI * 2)
        ctx.fill()
        // Wings
        ctx.fillStyle = 'rgba(255, 152, 0, 0.5)'
        ctx.ellipse(obstacle.x, obstacle.y + obstacle.height / 2, 10, 5, Math.sin(Date.now() / 100), 0, Math.PI * 2)
        ctx.fill()
        ctx.ellipse(obstacle.x + obstacle.width, obstacle.y + obstacle.height / 2, 10, 5, -Math.sin(Date.now() / 100), 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Draw rectangle
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
      }

      // Check collision
      if (!state.gameOver && !state.hasWon && checkCollision(
        { x: char.x, y: charY, width: char.width, height: charHeight },
        obstacle
      )) {
        if (char.isDashing || state.activeShield) {
          // Destroy obstacle
          createParticles(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, obstacle.color)
          state.score += obstacle.points * state.scoreMultiplier
          state.combo++
          setScore(state.score)
          setCombo(state.combo)
          playSound(392.00, 0.1) // G4 note
          return false
        } else {
          // Take damage
          state.lives--
          setLives(state.lives)
          state.combo = 0
          setCombo(0)
          createParticles(char.x + char.width / 2, charY + charHeight / 2, '#FF4444', 20)
          playSound(196.00, 0.2) // G3 note (low)

          if (state.lives <= 0) {
            state.gameOver = true
            setGameOver(true)
          }
          return false
        }
      }

      return obstacle.x > -obstacle.width
    })

    // Update and draw collectibles
    state.collectibles = state.collectibles.filter(collectible => {
      collectible.x -= state.speed
      collectible.rotation += 0.1

      // Magnet effect
      if (state.activeMagnet) {
        const dx = (char.x + char.width / 2) - collectible.x
        const dy = (charY + charHeight / 2) - collectible.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 150) {
          collectible.x += dx * 0.05
          collectible.y += dy * 0.05
        }
      }

      // Draw collectible with rotation
      ctx.save()
      ctx.translate(collectible.x, collectible.y)
      ctx.rotate(collectible.rotation)

      if (collectible.type === 'star') {
        // Draw star
        ctx.fillStyle = collectible.color
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
      } else if (collectible.type === 'gem') {
        // Draw gem
        ctx.fillStyle = collectible.color
        ctx.beginPath()
        ctx.moveTo(0, -collectible.height / 2)
        ctx.lineTo(collectible.width / 2, 0)
        ctx.lineTo(0, collectible.height / 2)
        ctx.lineTo(-collectible.width / 2, 0)
        ctx.closePath()
        ctx.fill()
      } else {
        // Draw coin
        ctx.fillStyle = collectible.color
        ctx.beginPath()
        ctx.arc(0, 0, collectible.width / 2, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()

      // Check collision
      if (checkCollision(
        { x: char.x, y: charY, width: char.width, height: charHeight },
        collectible
      )) {
        state.score += collectible.points * state.scoreMultiplier
        state.combo++
        setScore(state.score)
        setCombo(state.combo)
        createParticles(collectible.x, collectible.y, collectible.color, 15)
        playSound(523.25, 0.1) // C5 note
        return false
      }

      return collectible.x > -collectible.width
    })

    // Update and draw power-ups
    state.powerUps = state.powerUps.filter(powerUp => {
      powerUp.x -= state.speed
      powerUp.pulse = (powerUp.pulse + 0.1) % (Math.PI * 2)

      // Draw power-up with pulse effect
      const pulseSize = 5 + Math.sin(powerUp.pulse) * 3

      ctx.fillStyle = powerUp.color
      ctx.beginPath()
      ctx.arc(powerUp.x, powerUp.y, powerUp.width / 2 + pulseSize, 0, Math.PI * 2)
      ctx.fill()

      // Draw icon
      ctx.font = '20px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(powerUp.icon, powerUp.x, powerUp.y)

      // Check collision
      if (checkCollision(
        { x: char.x, y: charY, width: char.width, height: charHeight },
        powerUp
      )) {
        // Activate power-up
        if (powerUp.type === 'shield') {
          state.activeShield = true
          setActiveShield(true)
          setTimeout(() => {
            state.activeShield = false
            setActiveShield(false)
          }, powerUp.duration)
        } else if (powerUp.type === 'magnet') {
          state.activeMagnet = true
          setActiveMagnet(true)
          setTimeout(() => {
            state.activeMagnet = false
            setActiveMagnet(false)
          }, powerUp.duration)
        } else if (powerUp.type === 'multiplier') {
          state.scoreMultiplier = 2
          setTimeout(() => {
            state.scoreMultiplier = 1
          }, powerUp.duration)
        }

        createParticles(powerUp.x, powerUp.y, powerUp.color, 20)
        playSound(659.25, 0.2) // E5 note
        return false
      }

      return powerUp.x > -powerUp.width
    })

    // Update and draw particles
    state.particles = state.particles.filter(particle => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.2 // Gravity
      particle.life--

      ctx.fillStyle = particle.color
      ctx.globalAlpha = particle.life / 30
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size)
      ctx.globalAlpha = 1

      return particle.life > 0
    })

    // Increase difficulty
    if (state.score > 0 && state.score % 100 === 0 && state.speed < 8) {
      state.speed = Math.min(state.speed + 0.2, 8)
      state.level = Math.floor(state.score / 100) + 1
      setLevel(state.level)
    }

    // Draw combo indicator
    if (state.combo > 2) {
      ctx.font = 'bold 24px Inter'
      ctx.fillStyle = '#8A63D2'
      ctx.textAlign = 'center'
      ctx.fillText(`COMBO x${state.combo}!`, CANVAS_WIDTH / 2, 50)
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
    state.lives = 3
    state.level = 1
    state.speed = 4
    state.distance = 0
    state.combo = 0
    state.obstacles = []
    state.collectibles = []
    state.powerUps = []
    state.particles = []
    state.gameOver = false
    state.hasWon = false
    state.activeShield = false
    state.activeMagnet = false
    state.scoreMultiplier = 1
    state.character.x = 100
    state.character.y = 250
    state.character.velocityY = 0
    state.character.isJumping = false

    setScore(0)
    setLives(3)
    setLevel(1)
    setCombo(0)
    setGameOver(false)
    setHasWon(false)
    setIsPaused(false)
    setInstructions(true)
    setIsDetecting(false)
    setActiveShield(false)
    setActiveMagnet(false)
  }

  const togglePause = () => {
    gameStateRef.current.isPaused = !isPaused
    setIsPaused(!isPaused)
  }

  return (
    <div className="min-h-screen relative py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-6 py-3 bg-white bg-opacity-10 backdrop-blur-sm text-white border border-white border-opacity-30 rounded-full font-semibold flex items-center gap-2 hover:bg-opacity-20 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="px-6 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-full text-white font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-[#8A63D2]" />
              {score}
            </div>
            <div className="px-6 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-full text-white font-bold flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              {lives}
            </div>
            <div className="px-6 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-full text-white font-bold">
              Level {level}
            </div>
            {combo > 2 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-6 py-3 bg-[#8A63D2] bg-opacity-20 border border-[#8A63D2] rounded-full text-[#8A63D2] font-bold flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                x{combo}
              </motion.div>
            )}
          </div>
        </div>

        {/* Active Power-ups Indicator */}
        <AnimatePresence>
          {(activeShield || activeMagnet) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-4 mb-4 justify-center"
            >
              {activeShield && (
                <div className="px-4 py-2 bg-green-500 bg-opacity-20 border border-green-500 rounded-full text-white font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Shield Active
                </div>
              )}
              {activeMagnet && (
                <div className="px-4 py-2 bg-blue-500 bg-opacity-20 border border-blue-500 rounded-full text-white font-semibold flex items-center gap-2">
                  🧲 Magnet Active
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Container */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Canvas */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Emotion Runner</h2>

            <div className="relative">
              <canvas
                ref={canvasRef}
                className="w-full border-2 border-[#8A63D2] rounded-xl bg-[#1a1a1a] bg-opacity-50"
                style={{ imageRendering: 'auto' }}
              />

              {/* Instructions Overlay */}
              {instructions && (
                <div className="absolute inset-0 bg-[#1a1a1a] bg-opacity-95 rounded-xl flex items-center justify-center">
                  <div className="text-center px-6">
                    <h3 className="text-3xl font-bold text-white mb-4">🎮 How to Play</h3>
                    <div className="text-white text-left space-y-2 mb-6 max-w-md">
                      <p className="font-bold text-[#8A63D2] mb-2">Controls:</p>
                      <p>😊 <strong>Happy/Surprise</strong> → Jump over obstacles</p>
                      <p>😠 <strong>Angry</strong> → Dash through obstacles</p>
                      <p>😢 <strong>Sad</strong> → Duck under barriers</p>
                      <p>😐 <strong>Neutral</strong> → Run normally</p>

                      <p className="font-bold text-[#8A63D2] mt-4 mb-2">Collectibles:</p>
                      <p>⭐ Stars: +10 points</p>
                      <p>💎 Gems: +20 points</p>
                      <p>🪙 Coins: +15 points</p>

                      <p className="font-bold text-[#8A63D2] mt-4 mb-2">Power-ups:</p>
                      <p>🛡️ Shield: Protects from damage</p>
                      <p>🧲 Magnet: Attracts collectibles</p>
                      <p>✖️ Multiplier: 2x points</p>

                      <p className="font-bold text-[#8A63D2] mt-4 mb-2">Goal:</p>
                      <p>🏆 Reach {WIN_SCORE} points to win!</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startGame}
                      className="px-8 py-4 bg-[#8A63D2] text-[#1a1a1a] rounded-full font-bold text-lg flex items-center gap-2 mx-auto"
                    >
                      <Play className="w-6 h-6" />
                      Start Game
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Win Overlay */}
              {hasWon && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-[#1a1a1a] bg-opacity-95 rounded-xl flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Trophy className="w-24 h-24 text-[#8A63D2] mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-5xl font-bold text-white mb-4">🎉 You Win! 🎉</h3>
                    <p className="text-3xl text-[#8A63D2] mb-2">Final Score: {score}</p>
                    <p className="text-xl text-white opacity-70 mb-6">Level {level} Completed!</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetGame}
                      className="px-8 py-4 bg-[#8A63D2] text-[#1a1a1a] rounded-full font-bold text-lg flex items-center gap-2 mx-auto"
                    >
                      <RotateCcw className="w-6 h-6" />
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
                  className="absolute inset-0 bg-[#1a1a1a] bg-opacity-95 rounded-xl flex items-center justify-center"
                >
                  <div className="text-center">
                    <h3 className="text-4xl font-bold text-white mb-4">Game Over!</h3>
                    <p className="text-2xl text-[#8A63D2] mb-2">Final Score: {score}</p>
                    <p className="text-xl text-white opacity-70 mb-6">Level {level}</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetGame}
                      className="px-8 py-4 bg-[#8A63D2] text-[#1a1a1a] rounded-full font-bold text-lg flex items-center gap-2 mx-auto"
                    >
                      <RotateCcw className="w-6 h-6" />
                      Try Again
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Controls */}
            {!instructions && !gameOver && !hasWon && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePause}
                  className="px-6 py-3 bg-[#8A63D2] text-[#1a1a1a] rounded-full font-semibold flex items-center gap-2"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetGame}
                  className="px-6 py-3 bg-white bg-opacity-10 backdrop-blur-sm text-white border border-white border-opacity-30 rounded-full font-semibold flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Restart
                </motion.button>
              </div>
            )}
          </div>

          {/* Webcam & Info */}
          <div className="space-y-6">
            {/* Webcam */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Your Camera</h3>
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full rounded-xl border-2 border-[#8A63D2]"
                mirrored
              />
              <div className="mt-4 text-center">
                <div className="inline-block px-6 py-3 bg-[#8A63D2] bg-opacity-20 border border-[#8A63D2] rounded-full">
                  <span className="text-white font-bold">Emotion: </span>
                  <span className="text-[#8A63D2] font-bold text-lg">{currentEmotion}</span>
                </div>
              </div>
            </div>

            {/* Game Info */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">📊 Game Stats</h3>
              <div className="space-y-3 text-white">
                <div className="flex justify-between">
                  <span>Current Score:</span>
                  <span className="font-bold text-[#8A63D2]">{score} / {WIN_SCORE}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lives Remaining:</span>
                  <span className="font-bold">{lives} ❤️</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Level:</span>
                  <span className="font-bold">{level}</span>
                </div>
                <div className="flex justify-between">
                  <span>Combo:</span>
                  <span className="font-bold text-[#8A63D2]">x{combo}</span>
                </div>

                <div className="pt-3 border-t border-white border-opacity-20">
                  <div className="text-sm opacity-70 mb-2">Progress to Win:</div>
                  <div className="w-full h-4 bg-white bg-opacity-10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#8A63D2]"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((score / WIN_SCORE) * 100, 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">💡 Pro Tips</h3>
              <ul className="text-white space-y-2 text-sm">
                <li>• Chain combos for bonus points!</li>
                <li>• Use Angry to dash through obstacles</li>
                <li>• Collect power-ups for advantages</li>
                <li>• Shield protects you from 1 hit</li>
                <li>• Magnet pulls stars toward you</li>
                <li>• Make clear expressions for accuracy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmotionGameEnhanced
