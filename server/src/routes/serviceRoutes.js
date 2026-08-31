import { Router } from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';
import { validateRequiredFields } from '../middlewares/validateRequest.js';

const router = Router();

router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.post('/', validateRequiredFields(['name', 'rate', 'summary']), createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
