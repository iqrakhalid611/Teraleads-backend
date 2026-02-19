const patientModel = require('../models/patient');

/**
 * Patient service – business logic for patient CRUD.
 * All operations are scoped to the authenticated user (userId).
 */

async function createPatient(userId, data) {
  if (!data.name || !data.name.trim()) {
    const err = new Error('Name is required');
    err.code = 'VALIDATION';
    throw err;
  }
  return patientModel.create(userId, {
    name: data.name.trim(),
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || null,
    dob: data.dob || null,
    medical_notes: data.medical_notes?.trim() || null,
  });
}

async function getPatient(userId, id) {
  const patient = await patientModel.findById(userId, id);
  if (!patient) {
    const err = new Error('Patient not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  return patient;
}

async function listPatients(userId, { page, limit } = {}) {
  return patientModel.findAllPaginated(userId, { page, limit });
}

async function updatePatient(userId, id, data) {
  const existing = await patientModel.findById(userId, id);
  if (!existing) {
    const err = new Error('Patient not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  return patientModel.update(userId, id, {
    name: data.name !== undefined ? data.name?.trim() : undefined,
    email: data.email !== undefined ? (data.email?.trim() || null) : undefined,
    phone: data.phone !== undefined ? (data.phone?.trim() || null) : undefined,
    dob: data.dob !== undefined ? data.dob : undefined,
    medical_notes: data.medical_notes !== undefined ? (data.medical_notes?.trim() || null) : undefined,
  });
}

async function deletePatient(userId, id) {
  const deleted = await patientModel.remove(userId, id);
  if (!deleted) {
    const err = new Error('Patient not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  return true;
}

module.exports = {
  createPatient,
  getPatient,
  listPatients,
  updatePatient,
  deletePatient,
};
