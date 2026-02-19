const chatService = require('../services/chatService');

/**
 * POST /chat
 * Body: { patientId, message }
 * Returns: { reply, userMessage, assistantMessage }
 */
async function postChat(req, res) {
  try {
    const userId = req.user.userId;
    const { patientId, message } = req.body;
    const id = patientId != null ? parseInt(patientId, 10) : NaN;
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Valid patientId is required' });
    }
    const result = await chatService.sendMessage(userId, id, message);
    return res.json(result);
  } catch (err) {
    console.error('POST /chat error:', err.message);
    console.error(err.stack);
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Patient not found' });
    }
    if (err.code === 'VALIDATION') {
      return res.status(400).json({ error: err.message });
    }
    const body = { error: 'Chat request failed' };
    if (process.env.NODE_ENV !== 'production') body.detail = err.message || String(err);
    return res.status(500).json(body);
  }
}

/**
 * GET /chat?patientId=1&limit=50
 * Returns: array of messages { id, role, content, created_at }
 */
async function getHistory(req, res) {
  try {
    const userId = req.user.userId;
    const patientId = req.query.patientId != null ? parseInt(req.query.patientId, 10) : NaN;
    if (Number.isNaN(patientId)) {
      return res.status(400).json({ error: 'Valid patientId query is required' });
    }
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
    const messages = await chatService.getHistory(userId, patientId, { limit });
    return res.json(messages);
  } catch (err) {
    console.error('GET /chat error:', err.message);
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const body = { error: 'Failed to load chat history' };
    if (process.env.NODE_ENV !== 'production') body.detail = err.message || String(err);
    return res.status(500).json(body);
  }
}

module.exports = {
  postChat,
  getHistory,
};
