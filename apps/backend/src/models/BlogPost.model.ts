/*
 * Purpose: Blog and CMS article persistence model.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import mongoose, { Schema } from 'mongoose';

const blogPostSchema = new Schema<any>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true }, // Markdown/MDX
    coverImage: { type: String, default: '' },
    author: { type: String, required: true },
    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [] },
    publishedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

export const BlogPost: mongoose.Model<any> = mongoose.models.BlogPost || mongoose.model<any>('BlogPost', blogPostSchema);
