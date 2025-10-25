/**
 * Comprehensive Feedback Analyzer
 * Analyzes session data to generate metrics for interview preparedness
 */

export function analyzeSession(sessionHistory) {
  if (!sessionHistory || sessionHistory.length === 0) {
    return null
  }

  const startTime = sessionHistory[0].timestamp
  const endTime = sessionHistory[sessionHistory.length - 1].timestamp
  const duration = (endTime - startTime) / 1000 // seconds

  // Extract emotions over time
  const emotions = sessionHistory
    .filter(frame => frame.results && frame.results.length > 0)
    .map(frame => ({
      emotion: frame.results[0].emotion,
      confidence: frame.results[0].confidence,
      timestamp: frame.timestamp,
      bbox: frame.results[0].bbox
    }))

  if (emotions.length === 0) {
    return null
  }

  // Calculate metrics
  const confidence = calculateConfidence(emotions)
  const eyeContact = calculateEyeContact(emotions, sessionHistory)
  const communication = calculateCommunication(emotions)
  const composure = calculateComposure(emotions)
  const presence = calculatePresence(emotions)
  const timing = calculateTiming(emotions, duration)
  const readiness = calculateReadiness(emotions, duration)

  return {
    metrics: {
      confidence,
      confidenceFeedback: generateConfidenceFeedback(confidence, emotions),
      eyeContact,
      eyeContactFeedback: generateEyeContactFeedback(eyeContact, emotions),
      communication,
      communicationFeedback: generateCommunicationFeedback(communication, emotions),
      composure,
      composureFeedback: generateComposureFeedback(composure, emotions),
      presence,
      presenceFeedback: generatePresenceFeedback(presence, emotions),
      timing,
      timingFeedback: generateTimingFeedback(timing, emotions, duration),
      readiness,
      readinessFeedback: generateReadinessFeedback(readiness, emotions, duration)
    },
    duration,
    totalFrames: emotions.length,
    emotionDistribution: getEmotionDistribution(emotions)
  }
}

// 1. Confidence - Maintain positive body language
function calculateConfidence(emotions) {
  const positiveEmotions = emotions.filter(e =>
    e.emotion === 'Happy' || e.emotion === 'Neutral'
  ).length

  const avgConfidence = emotions.reduce((sum, e) => sum + e.confidence, 0) / emotions.length

  const positiveRatio = positiveEmotions / emotions.length
  const score = (positiveRatio * 0.6 + avgConfidence * 0.4) * 100

  return Math.round(Math.min(100, Math.max(0, score)))
}

function generateConfidenceFeedback(score, emotions) {
  const happyCount = emotions.filter(e => e.emotion === 'Happy').length
  const neutralCount = emotions.filter(e => e.emotion === 'Neutral').length
  const positiveRatio = ((happyCount + neutralCount) / emotions.length * 100).toFixed(0)

  if (score >= 80) {
    return `Excellent! You maintained positive body language ${positiveRatio}% of the time. Your confident demeanor came through clearly.`
  } else if (score >= 60) {
    return `Good confidence overall. You showed positive emotions ${positiveRatio}% of the time. Try to maintain more consistent positive body language.`
  } else if (score >= 40) {
    return `Your confidence could improve. Focus on maintaining a calm, positive expression even when thinking or pausing.`
  } else {
    return `Work on projecting more confidence. Practice maintaining a neutral or slightly positive expression to appear more self-assured.`
  }
}

// 2. Eye Contact - Practice proper engagement
function calculateEyeContact(emotions, sessionHistory) {
  // Face stability indicates looking at camera (eye contact proxy)
  const faceStability = emotions.map((e, i) => {
    if (i === 0) return 1
    const prev = emotions[i - 1]
    const xDiff = Math.abs(e.bbox.x - prev.bbox.x)
    const yDiff = Math.abs(e.bbox.y - prev.bbox.y)
    const movement = Math.sqrt(xDiff * xDiff + yDiff * yDiff)
    return movement < 50 ? 1 : 0.5 // Low movement = good eye contact
  })

  const stabilityScore = faceStability.reduce((sum, s) => sum + s, 0) / faceStability.length

  // Face detection consistency
  const detectionRate = emotions.length / sessionHistory.length

  const score = (stabilityScore * 0.5 + detectionRate * 0.5) * 100
  return Math.round(Math.min(100, Math.max(0, score)))
}

function generateEyeContactFeedback(score, emotions) {
  if (score >= 80) {
    return `Excellent eye contact! You maintained steady focus on the camera, demonstrating strong engagement.`
  } else if (score >= 60) {
    return `Good eye contact overall. Try to reduce head movements and maintain a more consistent gaze at the camera.`
  } else if (score >= 40) {
    return `Your eye contact needs improvement. Practice looking directly at the camera and minimizing head movements.`
  } else {
    return `Work on maintaining eye contact. Keep your head steady and look directly at the camera to show engagement.`
  }
}

// 3. Communication - Clear and effective speech
function calculateCommunication(emotions) {
  // Clear communication correlates with neutral/happy expressions
  const clearEmotions = emotions.filter(e =>
    e.emotion === 'Happy' || e.emotion === 'Neutral'
  ).length

  // Avoid negative emotions that suggest confusion or frustration
  const negativeEmotions = emotions.filter(e =>
    e.emotion === 'Angry' || e.emotion === 'Disgust' || e.emotion === 'Fear'
  ).length

  const clarityRatio = clearEmotions / emotions.length
  const negativePenalty = negativeEmotions / emotions.length

  const score = (clarityRatio - negativePenalty * 0.5) * 100
  return Math.round(Math.min(100, Math.max(0, score)))
}

function generateCommunicationFeedback(score, emotions) {
  const neutralCount = emotions.filter(e => e.emotion === 'Neutral').length
  const neutralRatio = (neutralCount / emotions.length * 100).toFixed(0)

  if (score >= 80) {
    return `Excellent communication clarity! Your expressions suggest clear, articulate delivery throughout the session.`
  } else if (score >= 60) {
    return `Good communication skills. Maintain composed, neutral expressions (${neutralRatio}% achieved) for clearer delivery.`
  } else if (score >= 40) {
    return `Communication could be clearer. Avoid showing confusion or frustration - maintain a calm, confident expression.`
  } else {
    return `Focus on clear communication. Practice delivering your message with a calm, neutral expression to appear more articulate.`
  }
}

// 4. Composure - Stay calm under pressure
function calculateComposure(emotions) {
  // Calculate emotion volatility (how much emotions change)
  const emotionChanges = emotions.map((e, i) => {
    if (i === 0) return 0
    return e.emotion !== emotions[i - 1].emotion ? 1 : 0
  })

  const changeRate = emotionChanges.reduce((sum, c) => sum + c, 0) / emotionChanges.length

  // Calm emotions
  const calmEmotions = emotions.filter(e =>
    e.emotion === 'Neutral' || e.emotion === 'Happy'
  ).length
  const calmRatio = calmEmotions / emotions.length

  // Low volatility + high calm ratio = high composure
  const score = ((1 - changeRate) * 0.4 + calmRatio * 0.6) * 100
  return Math.round(Math.min(100, Math.max(0, score)))
}

function generateComposureFeedback(score, emotions) {
  const changes = emotions.filter((e, i) => i > 0 && e.emotion !== emotions[i - 1].emotion).length

  if (score >= 80) {
    return `Excellent composure! You maintained a calm, steady demeanor throughout with minimal emotional fluctuation.`
  } else if (score >= 60) {
    return `Good composure overall. You had ${changes} emotional shifts - try to maintain even more consistency.`
  } else if (score >= 40) {
    return `Your composure could improve. Practice staying calm and avoiding visible emotional reactions (${changes} changes detected).`
  } else {
    return `Work on maintaining composure. Reduce emotional fluctuations and practice staying calm under pressure.`
  }
}

// 5. Presence - Professional demeanor
function calculatePresence(emotions) {
  // Professional presence = high confidence + consistent positive emotions
  const professionalEmotions = emotions.filter(e =>
    e.emotion === 'Neutral' || e.emotion === 'Happy'
  ).length

  const avgConfidence = emotions.reduce((sum, e) => sum + e.confidence, 0) / emotions.length
  const professionalRatio = professionalEmotions / emotions.length

  const score = (professionalRatio * 0.6 + avgConfidence * 0.4) * 100
  return Math.round(Math.min(100, Math.max(0, score)))
}

function generatePresenceFeedback(score, emotions) {
  const professionalTime = emotions.filter(e =>
    e.emotion === 'Neutral' || e.emotion === 'Happy'
  ).length
  const ratio = (professionalTime / emotions.length * 100).toFixed(0)

  if (score >= 80) {
    return `Excellent professional presence! You projected confidence and professionalism ${ratio}% of the time.`
  } else if (score >= 60) {
    return `Good professional demeanor. Maintain positive expressions more consistently to strengthen your presence.`
  } else if (score >= 40) {
    return `Your professional presence needs work. Focus on projecting confidence and maintaining a professional demeanor.`
  } else {
    return `Work on your professional presence. Practice maintaining confident, neutral expressions throughout.`
  }
}

// 6. Timing - Pacing and rhythm
function calculateTiming(emotions, duration) {
  // Good timing = consistent emotion display time
  const emotionDurations = {}
  let currentEmotion = emotions[0].emotion
  let currentStart = 0

  emotions.forEach((e, i) => {
    if (e.emotion !== currentEmotion || i === emotions.length - 1) {
      const duration = i - currentStart
      emotionDurations[currentEmotion] = (emotionDurations[currentEmotion] || 0) + duration
      currentEmotion = e.emotion
      currentStart = i
    }
  })

  // Calculate variance in emotion durations (low variance = good pacing)
  const durations = Object.values(emotionDurations)
  const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length
  const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length
  const stdDev = Math.sqrt(variance)

  // Good timing has balanced emotional pacing
  const normalizedStdDev = stdDev / emotions.length
  const score = (1 - Math.min(normalizedStdDev * 5, 1)) * 100

  return Math.round(Math.min(100, Math.max(0, score)))
}

function generateTimingFeedback(score, emotions, duration) {
  const framesPerSecond = emotions.length / duration

  if (score >= 80) {
    return `Excellent pacing! Your emotional expressions showed good rhythm and natural timing throughout.`
  } else if (score >= 60) {
    return `Good pacing overall. Work on maintaining more consistent timing in your responses and expressions.`
  } else if (score >= 40) {
    return `Your pacing needs improvement. Practice maintaining steady rhythm and avoiding rushed or prolonged expressions.`
  } else {
    return `Focus on improving your timing. Maintain consistent pacing and rhythm in your delivery.`
  }
}

// 7. Readiness - Interview preparedness
function calculateReadiness(emotions, duration) {
  // Readiness is a composite score
  const positiveEmotions = emotions.filter(e =>
    e.emotion === 'Happy' || e.emotion === 'Neutral'
  ).length

  const avgConfidence = emotions.reduce((sum, e) => sum + e.confidence, 0) / emotions.length
  const positiveRatio = positiveEmotions / emotions.length

  // Longer session = more practice = higher readiness
  const durationBonus = Math.min(duration / 60, 1) // Max bonus at 60 seconds

  const score = (positiveRatio * 0.4 + avgConfidence * 0.4 + durationBonus * 0.2) * 100
  return Math.round(Math.min(100, Math.max(0, score)))
}

function generateReadinessFeedback(score, emotions, duration) {
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)

  if (score >= 80) {
    return `You're well-prepared! Strong confidence and composure for ${minutes}m ${seconds}s demonstrates excellent readiness.`
  } else if (score >= 60) {
    return `Good preparation level. Continue practicing to build more confidence and maintain it for longer periods.`
  } else if (score >= 40) {
    return `More preparation needed. Practice maintaining confidence and positive demeanor for extended periods.`
  } else {
    return `Significant preparation required. Spend more time practicing to build confidence and interview readiness.`
  }
}

// Helper: Get emotion distribution
function getEmotionDistribution(emotions) {
  const distribution = {}
  emotions.forEach(e => {
    distribution[e.emotion] = (distribution[e.emotion] || 0) + 1
  })

  return Object.entries(distribution).map(([emotion, count]) => ({
    emotion,
    count,
    percentage: ((count / emotions.length) * 100).toFixed(1)
  }))
}
