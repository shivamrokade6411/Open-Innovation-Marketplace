import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';

export async function requireSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error('Authentication required');
  }

  const user = session.user as { id?: string; role?: string; email?: string; name?: string };

  if (!user.id || !user.role) {
    throw new Error('Invalid session payload');
  }

  return {
    user: {
      id: user.id,
      role: user.role,
      email: user.email ?? '',
      name: user.name ?? ''
    }
  };
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireSession();

  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('Forbidden');
  }

  return session;
}
