import { Router } from 'express';
import {
  getPaymentsByAdmission,
  recordPayment,
  deletePayment
} from '../controllers/paymentController.js';
import { validateRequiredFields } from '../middlewares/validateRequest.js';

const router = Router();

router.get('/admission/:admissionId', getPaymentsByAdmission);
router.post('/', validateRequiredFields(['admissionId', 'amount']), recordPayment);
router.delete('/:id', deletePayment);

export default router;
