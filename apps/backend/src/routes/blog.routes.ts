/*
 * Purpose: Routing definitions for Blog and CMS actions.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import {
  getBlogPosts,
  getBlogPostBySlug,
  createBlogPost
} from '../controllers/blog.controller';

const router = Router();

// Public readers routes
router.get('/', getBlogPosts);
router.get('/:slug', getBlogPostBySlug);

// Admin composition routes
router.post('/', authenticateJWT, createBlogPost);

export default router;
