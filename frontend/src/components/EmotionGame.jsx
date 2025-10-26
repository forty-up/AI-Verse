import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react'
import Webcam from 'react-webcam'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

function EmotionGame({ onBack }) {
  const canvasRef = useRef(null)
  const webcamRef = useRef(null)
  const animationRef = useRef(null)
  const gameStateRef = useRef({
    score: 0,
    lives: 3,
    speed: 3,
    obstacles: [],
    collectibles: [],
    gameOver: false,
    isPaused: false,
    character: {
      x: 100,
      y: 250,
      width: 40,
      height: 60,
      velocityY: 0,
      isJumping: false,
      isDucking: false,
      isDashing: false
    }
  })

  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState('Neutral')
  const [isDetecting, setIsDetecting] = useState(false)
  const [instructions, setInstructions] = useState(true)

  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 400
  const GROUND_Y = 300
  const GRAVITY = 0.6
  const JUMP_FORCE = -12

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

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT

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
    }, 1000) // Check every second

    return () => clearInterval(interval)
  }, [isDetecting, isPaused])

  // Handle emotion-based actions
  const handleEmotionAction = (emotion) => {
    const action = emotionActions[emotion]
    const state = gameStateRef.current
    const char = state.character

    if (state.gameOver || state.isPaused) return

    switch (action) {
      case 'jump':
        if (!char.isJumping && char.y >= GROUND_Y - char.height) {
          char.velocityY = JUMP_FORCE
          char.isJumping = true
        }
        break
      case 'duck':
        char.isDucking = true
        setTimeout(() => { char.isDucking = false }, 500)
        break
      case 'dash':
        char.isDashing = true
        setTimeout(() => { char.isDashing = false }, 300)
        break
      default:
        break
    }
  }

  // Spawn obstacles
  const spawnObstacle = () => {
    const state = gameStateRef.current
    if (state.gameOver) return

    const types = ['low', 'high', 'middle']
    const type = types[Math.floor(Math.random() * types.length)]

    let obstacle = {
      x: CANVAS_WIDTH,
      width: 30,
      height: 50,
      type: type,
      color: '#FF4444'
    }

    if (type === 'low') {
      obstacle.y = GROUND_Y - obstacle.height
    } else if (type === 'high') {
      obstacle.y = GROUND_Y - 150
      obstacle.height = 30
    } else {
      obstacle.y = GROUND_Y - 100
    }

    state.obstacles.push(obstacle)
  }

  // Spawn collectibles (stars)
  const spawnCollectible = () => {
    const state = gameStateRef.current
    if (state.gameOver) return

    const collectible = {
      x: CANVAS_WIDTH,
      y: GROUND_Y - 100 - Math.random() * 100,
      width: 20,
      height: 20,
      color: '#8A63D2'
    }

    state.collectibles.push(collectible)
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

    // Draw ground
    ctx.fillStyle = '#8A63D2'
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 5)

    // Update character physics
    if (!state.gameOver) {
      char.velocityY += GRAVITY
      char.y += char.velocityY

      // Ground collision
      if (char.y >= GROUND_Y - char.height) {
        char.y = GROUND_Y - char.height
        char.velocityY = 0
        char.isJumping = false
      }

      // Spawn obstacles randomly
      if (Math.random() < 0.02) {
        spawnObstacle()
      }

      // Spawn collectibles randomly
      if (Math.random() < 0.015) {
        spawnCollectible()
      }
    }

    // Draw character
    const charHeight = char.isDucking ? char.height / 2 : char.height
    const charY = char.isDucking ? char.y + char.height / 2 : char.y

    ctx.fillStyle = char.isDashing ? '#8A63D2' : '#FFFFFF'
    ctx.fillRect(char.x, charY, char.width, charHeight)

    // Character eyes (simple face)
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(char.x + 10, charY + 15, 5, 5)
    ctx.fillRect(char.x + 25, charY + 15, 5, 5)

    // Update and draw obstacles
    state.obstacles = state.obstacles.filter(obstacle => {
      obstacle.x -= state.speed

      // Draw obstacle
      ctx.fillStyle = obstacle.color
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)

      // Check collision
      if (!state.gameOver && checkCollision(
        { x: char.x, y: charY, width: char.width, height: charHeight },
        obstacle
      )) {
        if (!char.isDashing) {
          state.lives--
          setLives(state.lives)

          if (state.lives <= 0) {
            state.gameOver = true
            setGameOver(true)
          }
          return false // Remove obstacle
        }
      }

      return obstacle.x > -obstacle.width
    })

    // Update and draw collectibles
    state.collectibles = state.collectibles.filter(collectible => {
      collectible.x -= state.speed

      // Draw collectible (star)
      ctx.fillStyle = collectible.color
      ctx.beginPath()
      ctx.arc(collectible.x, collectible.y, collectible.width / 2, 0, Math.PI * 2)
      ctx.fill()

      // Check collision
      if (checkCollision(
        { x: char.x, y: charY, width: char.width, height: charHeight },
        collectible
      )) {
        state.score += 10
        setScore(state.score)
        return false // Remove collectible
      }

      return collectible.x > -collectible.width
    })

    // Increase difficulty over time
    if (state.score > 0 && state.score % 50 === 0) {
      state.speed = Math.min(state.speed + 0.1, 8)
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
    state.speed = 3
    state.obstacles = []
    state.collectibles = []
    state.gameOver = false
    state.character.x = 100
    state.character.y = 250
    state.character.velocityY = 0
    state.character.isJumping = false

    setScore(0)
    setLives(3)
    setGameOver(false)
    setIsPaused(false)
    setInstructions(true)
    setIsDetecting(false)
  }

  const togglePause = () => {
    gameStateRef.current.isPaused = !isPaused
    setIsPaused(!isPaused)
  }

  return (
    <div className="min-h-screen relative py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-6 py-3 bg-white bg-opacity-10 backdrop-blur-sm text-white border border-white border-opacity-30 rounded-full font-semibold flex items-center gap-2 hover:bg-opacity-20 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </motion.button>

          <div className="flex items-center gap-4">
            <div className="px-6 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-full text-white font-bold">
              Score: {score}
            </div>
            <div className="px-6 py-3 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-full text-white font-bold">
              Lives: ❤️ {lives}
            </div>
          </div>
        </div>

        {/* Game Container */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Canvas */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Emotion Runner</h2>

            <div className="relative">
              <canvas
                ref={canvasRef}
                className="w-full border-2 border-[#8A63D2] rounded-xl bg-[#1a1a1a] bg-opacity-50"
                style={{ imageRendering: 'pixelated' }}
              />

              {/* Instructions Overlay */}
              {instructions && (
                <div className="absolute inset-0 bg-[#1a1a1a] bg-opacity-90 rounded-xl flex items-center justify-center">
                  <div className="text-center px-6">
                    <h3 className="text-3xl font-bold text-white mb-4">How to Play</h3>
                    <div className="text-white text-left space-y-2 mb-6">
                      <p>😊 <strong>Happy/Surprise</strong> → Jump</p>
                      <p>😠 <strong>Angry</strong> → Dash (break obstacles)</p>
                      <p>😢 <strong>Sad</strong> → Duck</p>
                      <p>😐 <strong>Neutral</strong> → Normal run</p>
                      <p className="mt-4">⭐ Collect stars: +10 points</p>
                      <p>💥 Hit obstacles: -1 life</p>
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

              {/* Game Over Overlay */}
              {gameOver && (
                <div className="absolute inset-0 bg-[#1a1a1a] bg-opacity-90 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-4xl font-bold text-white mb-4">Game Over!</h3>
                    <p className="text-2xl text-[#8A63D2] mb-6">Final Score: {score}</p>
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
                </div>
              )}
            </div>

            {/* Controls */}
            {!instructions && (
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
                  <span className="text-white font-bold">Current Emotion: </span>
                  <span className="text-[#8A63D2] font-bold text-lg">{currentEmotion}</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">💡 Tips</h3>
              <ul className="text-white space-y-2 text-sm">
                <li>• Make clear facial expressions for best detection</li>
                <li>• Good lighting helps accuracy</li>
                <li>• Use Happy/Surprise to jump over obstacles</li>
                <li>• Use Angry to dash through obstacles</li>
                <li>• Use Sad to duck under high obstacles</li>
                <li>• Collect all the stars you can!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmotionGame
