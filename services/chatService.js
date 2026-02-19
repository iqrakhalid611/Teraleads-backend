const patientModel = require('../models/patient');
const chatMessageModel = require('../models/chatMessage');

const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) || 30000;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

/**
 * Call external AI service (e.g. Python microservice).
 * Expects POST to AI_SERVICE_URL with body { message, patientContext }.
 * Expects JSON response with { reply } or { text }.
 */
async function callExternalAIService(message, patientContext) {
  const url = process.env.AI_SERVICE_URL?.trim();
  if (!url) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, patientContext }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const err = new Error(`AI service returned ${res.status}`);
      err.code = 'AI_SERVICE_ERROR';
      throw err;
    }
    const data = await res.json();
    const reply = data.reply ?? data.text ?? data.response;
    if (typeof reply !== 'string') {
      const err = new Error('AI service did not return a reply string');
      err.code = 'AI_SERVICE_ERROR';
      throw err;
    }
    return reply;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const e = new Error('AI service timeout');
      e.code = 'AI_TIMEOUT';
      throw e;
    }
    throw err;
  }
}

/**
 * Call OpenAI Chat Completions API.
 * Requires OPENAI_API_KEY. Optional: OPENAI_MODEL (default gpt-3.5-turbo).
 */
async function callOpenAI(message, patientContext) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  const systemPrompt = [
    'You are a helpful dental assistant. Answer professionally and concisely.',
    patientContext.name && `Patient name: ${patientContext.name}.`,
    patientContext.medical_notes && `Relevant notes: ${patientContext.medical_notes}.`,
  ].filter(Boolean).join(' ');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 500,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const body = await res.text();
      const err = new Error(`OpenAI API error: ${res.status} ${body}`);
      err.code = 'AI_SERVICE_ERROR';
      throw err;
    }
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      const err = new Error('OpenAI returned no content');
      err.code = 'AI_SERVICE_ERROR';
      throw err;
    }
    return reply;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const e = new Error('AI request timeout');
      e.code = 'AI_TIMEOUT';
      throw e;
    }
    throw err;
  }
}

/**
 * Get AI reply: tries AI_SERVICE_URL → OPENAI_API_KEY → mock (dev only).
 * @param {string} message - User message
 * @param {object} patientContext - Optional { name, medical_notes }
 */
async function getAIReply(message, patientContext = {}) {
  try {
    const reply = await callExternalAIService(message, patientContext) ?? await callOpenAI(message, patientContext);
    if (reply) return reply;
  } catch (err) {
    err.code = err.code || 'AI_SERVICE_ERROR';
    throw err;
  }
  // No AI configured: mock for local dev only
  const name = patientContext.name ? ` (Patient: ${patientContext.name})` : '';
  return `Thank you for your question${name}. This is a mock response. Set AI_SERVICE_URL or OPENAI_API_KEY for real AI. You asked: "${message}"`;
}

/**
 * Send a user message, get AI reply, persist both, return reply.
 * @param {number} userId
 * @param {number} patientId
 * @param {string} message
 * @returns {Promise<{ reply, userMessage, assistantMessage }>}
 */
async function sendMessage(userId, patientId, message) {
  const patient = await patientModel.findById(userId, patientId);
  if (!patient) {
    const err = new Error('Patient not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  const trimmed = (message || '').trim();
  if (!trimmed) {
    const err = new Error('Message is required');
    err.code = 'VALIDATION';
    throw err;
  }

  const userMessage = await chatMessageModel.create(userId, patientId, 'user', trimmed);
  const patientContext = { name: patient.name, medical_notes: patient.medical_notes };
  let replyContent;
  let aiError = false;
  try {
    replyContent = await getAIReply(trimmed, patientContext);
  } catch (err) {
    aiError = true;
    replyContent = 'Sorry, I couldn\'t process that right now. Please try again.';
  }
  const assistantMessage = await chatMessageModel.create(userId, patientId, 'assistant', replyContent);

  const result = {
    reply: replyContent,
    userMessage: { id: userMessage.id, role: 'user', content: userMessage.content, created_at: userMessage.created_at },
    assistantMessage: { id: assistantMessage.id, role: 'assistant', content: assistantMessage.content, created_at: assistantMessage.created_at },
  };
  if (aiError) result.aiError = true;
  return result;
}

/**
 * Get chat history for a patient (must belong to user).
 */
async function getHistory(userId, patientId, { limit } = {}) {
  const patient = await patientModel.findById(userId, patientId);
  if (!patient) {
    const err = new Error('Patient not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  return chatMessageModel.getHistory(userId, patientId, { limit });
}

module.exports = {
  sendMessage,
  getHistory,
};
