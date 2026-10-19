import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse, clampScore, getAverageScore } from "./utils.js";

const apiKey = AIzaSyDdYoJ_vPVAumy6IaekHY56OCNAaATG4hw;

if (!apiKey) {
  console.warn("Missing GEMINI_API_KEY. AI functions will fail until configured.");
}

const genAI = new GoogleGenerativeAI(apiKey || "missing-key");

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash"
});

export async function evaluateDiscussion({ topic, transcript }) {
  const prompt = `
You are an expert group discussion evaluator for students and interview preparation.

Evaluate this participant's GD performance.

Topic:
${topic}

Participant Transcript:
${transcript}

Return ONLY valid JSON with this exact shape:
{
  "scores": {
    "confidence": 0,
    "fluency": 0,
    "grammar": 0,
    "speakingSpeed": 0,
    "participation": 0,
    "sentiment": 0,
    "structure": 0,
    "relevance": 0
  },
  "overallScore": 0,
  "summary": "short summary",
  "strengths": ["point"],
  "improvements": ["point"],
  "tips": ["point"],
  "sentimentLabel": "positive|neutral|negative",
  "estimatedWordsPerMinute": 0
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = safeJsonParse(text);

  if (!parsed) {
    throw new Error("AI returned invalid JSON.");
  }

  const scores = {
    confidence: clampScore(parsed.scores?.confidence),
    fluency: clampScore(parsed.scores?.fluency),
    grammar: clampScore(parsed.scores?.grammar),
    speakingSpeed: clampScore(parsed.scores?.speakingSpeed),
    participation: clampScore(parsed.scores?.participation),
    sentiment: clampScore(parsed.scores?.sentiment),
    structure: clampScore(parsed.scores?.structure),
    relevance: clampScore(parsed.scores?.relevance)
  };

  return {
    scores,
    overallScore: clampScore(parsed.overallScore || getAverageScore(scores)),
    summary: parsed.summary || "Performance analyzed successfully.",
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 5) : [],
    tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 5) : [],
    sentimentLabel: parsed.sentimentLabel || "neutral",
    estimatedWordsPerMinute: Number(parsed.estimatedWordsPerMinute || 0)
  };
}

export async function generateSummary({ topic, transcript }) {
  const prompt = `
Summarize this group discussion.

Topic:
${topic}

Transcript:
${transcript}

Return ONLY valid JSON:
{
  "summary": "clear concise summary",
  "keyArguments": ["argument"],
  "conclusion": "final conclusion",
  "actionableInsights": ["insight"]
}
`;

  const result = await model.generateContent(prompt);
  const parsed = safeJsonParse(result.response.text());

  if (!parsed) {
    throw new Error("AI returned invalid JSON.");
  }

  return {
    summary: parsed.summary || "",
    keyArguments: Array.isArray(parsed.keyArguments) ? parsed.keyArguments : [],
    conclusion: parsed.conclusion || "",
    actionableInsights: Array.isArray(parsed.actionableInsights) ? parsed.actionableInsights : []
  };
}

export async function generateTopic({ category = "current affairs", difficulty = "medium" }) {
  const prompt = `
Generate one high-quality group discussion topic for students.

Category: ${category}
Difficulty: ${difficulty}

Return ONLY valid JSON:
{
  "topic": "topic title",
  "description": "short context",
  "talkingPoints": ["point"],
  "difficulty": "${difficulty}",
  "category": "${category}"
}
`;

  const result = await model.generateContent(prompt);
  const parsed = safeJsonParse(result.response.text());

  if (!parsed) {
    throw new Error("AI returned invalid JSON.");
  }

  return {
    topic: parsed.topic || "Impact of AI on Education",
    description: parsed.description || "Discuss opportunities and risks of AI in education.",
    talkingPoints: Array.isArray(parsed.talkingPoints) ? parsed.talkingPoints : [],
    difficulty: parsed.difficulty || difficulty,
    category: parsed.category || category
  };
}

export async function mentorReply({ message, history = [] }) {
  const context = history
    .map((item) => {
      if (item.role === "user") return `Student: ${item.text}`;
      return `Mentor: ${item.text}`;
    })
    .join("\n");

  const prompt = `
You are Smart GD Mentor, an AI coach for group discussion and interview communication.

Previous conversation:
${context}

Student message:
${message}

Give practical, encouraging, specific coaching. Keep it under 180 words.
`;

  const result = await model.generateContent(prompt);

  return {
    reply: result.response.text()
  };
}
