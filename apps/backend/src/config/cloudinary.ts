/*
 * Purpose: Cloudinary configuration for file uploads and assets.
 * Author: Copilot
 * Date: 2026-06-28
 */

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  api_key: process.env.CLOUDINARY_API_KEY ?? '',
  api_secret: process.env.CLOUDINARY_API_SECRET ?? '',
  secure: true
});

export { cloudinary };
