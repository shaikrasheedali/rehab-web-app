import { Router } from 'express';
import {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage
} from '../controllers/packageController.js';
import { validateRequiredFields } from '../middlewares/validateRequest.js';

const router = Router();

router.get('/', getAllPackages);
router.get('/:id', getPackageById);
router.post('/', validateRequiredFields(['name', 'rate']), createPackage);
router.put('/:id', updatePackage);
router.delete('/:id', deletePackage);

export default router;
