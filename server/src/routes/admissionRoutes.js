import { Router } from 'express';
import {
  getAllAdmissions,
  getAdmissionById,
  createAdmission,
  updateAdmission,
  dischargePatient,
  deleteAdmission
} from '../controllers/admissionController.js';
import { validateRequiredFields } from '../middlewares/validateRequest.js';

const router = Router();

router.get('/', getAllAdmissions);
router.get('/:id', getAdmissionById);
router.post('/', validateRequiredFields(['patient', 'contact', 'phone', 'admissionDate']), createAdmission);
router.put('/:id', updateAdmission);
router.post('/:id/discharge', validateRequiredFields(['dischargeSummary']), dischargePatient);
router.delete('/:id', deleteAdmission);

export default router;
