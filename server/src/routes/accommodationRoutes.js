import { Router } from 'express';
import {
  getAllAccommodations,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation
} from '../controllers/accommodationController.js';
import { validateRequiredFields } from '../middlewares/validateRequest.js';

const router = Router();

router.get('/', getAllAccommodations);
router.post('/', validateRequiredFields(['id', 'type', 'label']), createAccommodation);
router.put('/:id', updateAccommodation);
router.delete('/:id', deleteAccommodation);

export default router;
