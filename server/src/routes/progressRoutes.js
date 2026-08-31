import { Router } from 'express';
import {
  getProgressByAdmission,
  createProgressRecord,
  deleteProgressRecord
} from '../controllers/progressController.js';
import { validateRequiredFields } from '../middlewares/validateRequest.js';

const router = Router();

router.get('/admission/:admissionId', getProgressByAdmission);
router.post('/', validateRequiredFields(['admissionId', 'author', 'note']), createProgressRecord);
router.delete('/:id', deleteProgressRecord);

export default router;
