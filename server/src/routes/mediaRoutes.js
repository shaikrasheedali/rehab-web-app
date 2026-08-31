import { Router } from 'express';
import {
  getAllMediaItems,
  getMediaItemById,
  createMediaItem,
  updateMediaItem,
  deleteMediaItem
} from '../controllers/mediaController.js';
import { validateRequiredFields } from '../middlewares/validateRequest.js';

const router = Router();

router.get('/', getAllMediaItems);
router.get('/:id', getMediaItemById);
router.post('/', validateRequiredFields(['title', 'author', 'section']), createMediaItem);
router.put('/:id', updateMediaItem);
router.delete('/:id', deleteMediaItem);

export default router;
