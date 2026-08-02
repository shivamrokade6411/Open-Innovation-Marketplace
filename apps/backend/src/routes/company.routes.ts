/*
 * Purpose: Company route declarations.
 * Author: Antigravity
 * Date: 2026-08-02
 */

import { Router } from 'express';
import { getCompanies, getCompanyBySlug } from '../controllers/company.controller';

export const companyRouter = Router();

companyRouter.get('/', getCompanies);
companyRouter.get('/:slug', getCompanyBySlug);
