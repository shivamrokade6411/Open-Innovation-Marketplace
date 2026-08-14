/*
 * Purpose: Blog and CMS article content controller.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import type { Request, Response } from 'express';
import { BlogPost } from '../models/BlogPost.model';
import { AppError, unauthorized, forbidden } from '../middleware/errorHandler.middleware';

// Get list of blog posts (paginated and filtered)
export async function getBlogPosts(req: Request, res: Response): Promise<void> {
  const { category, tag, page = 1, limit = 10 } = req.query;

  const filter: any = {};
  if (category) filter.category = String(category);
  if (tag) filter.tags = String(tag);

  const skipIndex = (Number(page) - 1) * Number(limit);

  const [posts, total] = await Promise.all([
    BlogPost.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skipIndex)
      .limit(Number(limit))
      .lean(),
    BlogPost.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: posts,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      hasMore: skipIndex + posts.length < total
    }
  });
}

// Get single blog post by slug
export async function getBlogPostBySlug(req: Request, res: Response): Promise<void> {
  const { slug } = req.params;

  const post = await BlogPost.findOne({ slug }).lean();
  if (!post) {
    throw new AppError('Blog article not found', 404, 'ARTICLE_NOT_FOUND');
  }

  res.status(200).json({ success: true, data: post });
}

// Create new blog post
export async function createBlogPost(req: Request, res: Response): Promise<void> {
  if (!req.user || req.user.role !== 'admin') {
    throw forbidden('Only platform administrators can publish blog posts');
  }

  const { title, slug, excerpt, content, coverImage, author, category, tags } = req.body;

  if (!title || !slug || !excerpt || !content || !author || !category) {
    throw new AppError('Missing required article fields', 400, 'MISSING_CMS_FIELDS');
  }

  // Double check slug uniqueness
  const existing = await BlogPost.findOne({ slug });
  if (existing) {
    throw new AppError('Slug has already been claimed by another post', 400, 'DUPLICATE_SLUG');
  }

  const post = await BlogPost.create({
    title,
    slug,
    excerpt,
    content,
    coverImage: coverImage || '',
    author,
    category,
    tags: tags || [],
    publishedAt: new Date()
  });

  res.status(201).json({ success: true, data: post });
}
