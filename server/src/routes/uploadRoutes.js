import { Router } from 'express';
import { upload } from '../middlewares/uploadMiddleware.js';
import {
  handleSingleUpload,
  handleMultipleUploads
} from '../controllers/uploadController.js';

const router = Router();

router.post('/single', upload.single('file'), handleSingleUpload);
router.post('/multiple', upload.array('files', 10), handleMultipleUploads);

export default router;
