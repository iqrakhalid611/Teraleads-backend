const express = require('express');
const { authenticate } = require('../middleware/auth');
const patientController = require('../controllers/patientController');

const router = express.Router();

router.use(authenticate);

router.get('/', patientController.list);
router.post('/', patientController.create);
router.get('/:id', patientController.getOne);
router.put('/:id', patientController.update);
router.patch('/:id', patientController.update);
router.delete('/:id', patientController.remove);

module.exports = router;
