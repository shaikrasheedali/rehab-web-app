import { Router } from 'express';
import {
  getBillingByAdmission,
  saveBillingProfile,
  previewBill
} from '../controllers/billingController.js';

const router = Router();

router.get('/admission/:admissionId', getBillingByAdmission);
router.post('/admission/:admissionId', saveBillingProfile);
router.post('/preview', previewBill);

export default router;
