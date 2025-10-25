"""
Interview Service - Handles LLM integration for generating interview questions and scoring
Uses Groq API with Llama-3.3-70b model
"""

import os
from groq import Groq
from typing import List, Dict, Optional
import json

class InterviewService:
    """Service for managing AI-powered interview functionality"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the interview service with Groq API

        Args:
            api_key: Groq API key (optional, can be set via environment variable)
        """
        self.api_key = api_key or os.environ.get("GROQ_API_KEY")
        self.client = None

        if not self.api_key:
            print("[WARNING] GROQ_API_KEY not set. Interview features will not work.")
            print("[INFO] Get your free API key at: https://console.groq.com")
            print(f"[DEBUG] Environment variables available: {list(os.environ.keys())[:10]}...")
        else:
            try:
                # Show first/last 4 chars of key for debugging
                masked = f"{self.api_key[:4]}...{self.api_key[-4:]}"
                print(f"[INFO] Initializing Groq with API key: {masked}")

                self.client = Groq(api_key=self.api_key)
                print("[INFO] Groq client initialized successfully!")
            except Exception as e:
                print(f"[ERROR] Failed to initialize Groq client: {str(e)}")
                print(f"[ERROR] Exception type: {type(e).__name__}")
                import traceback
                traceback.print_exc()
                print("[INFO] Interview features will not work. Please check your Groq installation.")
                self.client = None

        self.model = "llama-3.3-70b-versatile"

    def generate_interview_questions(
        self,
        role: str,
        job_description: str,
        experience_level: str = "mid",
        num_questions: int = 5
    ) -> List[Dict[str, str]]:
        """
        Generate interview questions based on role and job description

        Args:
            role: Job title/role
            job_description: Detailed job description
            experience_level: One of "entry", "mid", "senior"
            num_questions: Number of questions to generate

        Returns:
            List of question dictionaries with type and question text
        """
        if not self.client:
            raise ValueError("Groq API key not configured")

        prompt = f"""You are an expert technical interviewer. Generate {num_questions} interview questions for the following position:

Role: {role}
Experience Level: {experience_level}
Job Description: {job_description}

Generate a mix of:
1. Technical questions (specific to the role)
2. Behavioral questions (using STAR method)
3. Scenario-based questions
4. Problem-solving questions

Return ONLY a JSON array with this exact format:
[
  {{
    "type": "technical|behavioral|scenario|problem-solving",
    "question": "the question text",
    "difficulty": "easy|medium|hard"
  }}
]

Make questions challenging but appropriate for {experience_level} level. DO NOT include any text before or after the JSON array."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert interviewer who generates high-quality, role-specific interview questions. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2000
            )

            content = response.choices[0].message.content.strip()

            # Remove markdown code blocks if present
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

            questions = json.loads(content)
            return questions

        except Exception as e:
            print(f"[ERROR] Failed to generate questions: {str(e)}")
            # Return fallback questions
            return self._get_fallback_questions(role, num_questions)

    def score_answer(
        self,
        question: str,
        answer: str,
        question_type: str,
        role: str
    ) -> Dict[str, any]:
        """
        Score an interview answer using Groq LLM

        Args:
            question: The interview question
            answer: Candidate's answer
            question_type: Type of question (technical, behavioral, etc.)
            role: Job role

        Returns:
            Dictionary with score, feedback, and strengths/improvements
        """
        if not self.client:
            raise ValueError("Groq API key not configured")

        prompt = f"""You are an expert interview evaluator. Evaluate this interview response:

Question: {question}
Question Type: {question_type}
Role: {role}
Candidate's Answer: {answer}

Provide a detailed evaluation in JSON format:
{{
  "score": 0-100,
  "feedback": "detailed feedback on the answer",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "key_points_covered": ["point 1", "point 2"],
  "missing_points": ["missing point 1", "missing point 2"]
}}

Be constructive, specific, and fair. Return ONLY the JSON object."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert interview evaluator who provides fair, constructive feedback. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,  # Lower temperature for more consistent scoring
                max_tokens=1500
            )

            content = response.choices[0].message.content.strip()

            # Clean up markdown if present
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

            evaluation = json.loads(content)
            return evaluation

        except Exception as e:
            print(f"[ERROR] Failed to score answer: {str(e)}")
            return {
                "score": 50,
                "feedback": "Unable to evaluate answer at this time.",
                "strengths": [],
                "improvements": [],
                "key_points_covered": [],
                "missing_points": []
            }

    def generate_overall_feedback(
        self,
        role: str,
        questions_and_scores: List[Dict],
        emotion_data: Dict
    ) -> Dict[str, any]:
        """
        Generate overall interview feedback

        Args:
            role: Job role
            questions_and_scores: List of questions with scores and answers
            emotion_data: Aggregated emotion data from the interview

        Returns:
            Overall feedback and recommendations
        """
        if not self.client:
            raise ValueError("Groq API key not configured")

        avg_score = sum(q.get('score', 0) for q in questions_and_scores) / len(questions_and_scores)

        prompt = f"""You are an expert career coach. Provide overall interview feedback:

Role: {role}
Number of Questions: {len(questions_and_scores)}
Average Score: {avg_score:.1f}/100

Question Performance:
{json.dumps([{"question": q.get("question", ""), "score": q.get("score", 0), "type": q.get("type", "")} for q in questions_and_scores], indent=2)}

Emotion Data:
- Dominant Emotions: {emotion_data.get('dominant_emotions', [])}
- Average Confidence: {emotion_data.get('avg_confidence', 0):.2f}
- Nervous Moments: {emotion_data.get('nervous_moments', 0)}

Provide comprehensive feedback in JSON format:
{{
  "overall_score": 0-100,
  "performance_level": "excellent|good|average|needs improvement",
  "summary": "brief overall summary",
  "technical_performance": "evaluation of technical responses",
  "communication_skills": "evaluation of communication and clarity",
  "emotional_intelligence": "insights from emotion data",
  "top_strengths": ["strength 1", "strength 2", "strength 3"],
  "areas_for_improvement": ["area 1", "area 2", "area 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "interview_readiness": "percentage readiness (0-100)"
}}

Be honest, constructive, and actionable. Return ONLY the JSON object."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert career coach who provides comprehensive, actionable interview feedback. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.4,
                max_tokens=2000
            )

            content = response.choices[0].message.content.strip()

            # Clean markdown
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

            feedback = json.loads(content)
            return feedback

        except Exception as e:
            print(f"[ERROR] Failed to generate overall feedback: {str(e)}")
            return {
                "overall_score": avg_score,
                "performance_level": "average",
                "summary": "Interview completed successfully.",
                "technical_performance": "Unable to evaluate at this time.",
                "communication_skills": "Unable to evaluate at this time.",
                "emotional_intelligence": "Unable to evaluate at this time.",
                "top_strengths": [],
                "areas_for_improvement": [],
                "recommendations": [],
                "interview_readiness": avg_score
            }

    def _get_fallback_questions(self, role: str, num_questions: int) -> List[Dict[str, str]]:
        """Return generic fallback questions if API fails"""
        fallback = [
            {
                "type": "behavioral",
                "question": "Tell me about a challenging project you worked on and how you overcame obstacles.",
                "difficulty": "medium"
            },
            {
                "type": "technical",
                "question": f"What technical skills do you consider most important for a {role} role?",
                "difficulty": "medium"
            },
            {
                "type": "scenario",
                "question": "How would you handle a situation where you disagree with your team about a technical decision?",
                "difficulty": "medium"
            },
            {
                "type": "problem-solving",
                "question": "Describe your approach to debugging a complex issue in production.",
                "difficulty": "hard"
            },
            {
                "type": "behavioral",
                "question": "Tell me about a time when you had to learn a new technology quickly. How did you approach it?",
                "difficulty": "easy"
            }
        ]
        return fallback[:num_questions]
