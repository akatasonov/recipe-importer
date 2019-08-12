import { Router } from 'express';
import RecipeRouter from './Recipe';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/', RecipeRouter);

// Export the base-router
export default router;
