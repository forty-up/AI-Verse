// API Configuration
// Use VITE_API_URL from environment variables, fallback to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  detect: `${API_BASE_URL}/api/detect`,
  health: `${API_BASE_URL}/api/health`,
  interview: {
    generate: `${API_BASE_URL}/api/interview/generate-questions`,
    score: `${API_BASE_URL}/api/interview/score-answer`,
    feedback: `${API_BASE_URL}/api/interview/overall-feedback`,
  },
};

console.log('[API Config] Using API URL:', API_BASE_URL);
