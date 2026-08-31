import { Router } from 'express';
import {
  getAllInquiries,
  getInquiryById,
  createInquiry,
  updateInquiryStatus,
  deleteInquiry
} from '../controllers/inquiryController.js';
import { validateRequiredFields } from '../middlewares/validateRequest.js';

const router = Router();

router.get('/', getAllInquiries);
router.get('/:id', getInquiryById);
router.post('/', validateRequiredFields(['patient', 'contact', 'phone']), createInquiry);
router.put('/:id', updateInquiryStatus);
router.delete('/:id', deleteInquiry);

export default router;
