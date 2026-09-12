import { Router } from 'express';
import { listCategories } from '../controllers/category.controller.js';

const router = Router();

router.get('/', listCategories); // public

export default router;