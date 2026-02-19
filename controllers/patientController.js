const patientService = require('../services/patientService');

async function create(req, res) {
  try {
    const userId = req.user.userId;
    const patient = await patientService.createPatient(userId, req.body);
    return res.status(201).json(patient);
  } catch (err) {
    if (err.code === 'VALIDATION') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to create patient' });
  }
}

async function list(req, res) {
  try {
    const userId = req.user?.userId;
    if (userId == null) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
    const result = await patientService.listPatients(userId, { page, limit });
    return res.json(result); // { rows, total }
  } catch (err) {
    console.error('List patients error:', err.message);
    console.error(err.stack);
    const body = { error: 'Failed to list patients' };
    if (process.env.NODE_ENV !== 'production') body.detail = err.message || String(err);
    return res.status(500).json(body);
  }
}

async function getOne(req, res) {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid patient id' });
    }
    const patient = await patientService.getPatient(userId, id);
    return res.json(patient);
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Patient not found' });
    }
    return res.status(500).json({ error: 'Failed to get patient' });
  }
}

async function update(req, res) {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid patient id' });
    }
    const patient = await patientService.updatePatient(userId, id, req.body);
    return res.json(patient);
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Patient not found' });
    }
    if (err.code === 'VALIDATION') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to update patient' });
  }
}

async function remove(req, res) {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid patient id' });
    }
    await patientService.deletePatient(userId, id);
    return res.status(204).send();
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Patient not found' });
    }
    return res.status(500).json({ error: 'Failed to delete patient' });
  }
}

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
};
