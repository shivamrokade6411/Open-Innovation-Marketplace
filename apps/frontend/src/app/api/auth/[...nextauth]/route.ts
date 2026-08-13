/*
 * Purpose: NextAuth Route Handlers for registration of authentication endpoints.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

import NextAuth from 'next-auth';
import { authOptions } from '../../../../lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
