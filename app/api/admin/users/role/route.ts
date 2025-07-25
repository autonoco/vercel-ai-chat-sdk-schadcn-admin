import { auth } from '@/app/(auth)/auth';
import { updateUserRole } from '@/lib/db/admin-queries';
import { ChatSDKError } from '@/lib/errors';
import type { UserRole } from '@/app/(auth)/auth';

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'super_admin') {
      return new ChatSDKError('forbidden:api', 'Only super admins can update user roles').toResponse();
    }

    const { userId, role } = await request.json();

    if (!userId || !role) {
      return new ChatSDKError('bad_request:api', 'userId and role are required').toResponse();
    }

    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return new ChatSDKError('bad_request:api', 'Invalid role').toResponse();
    }

    if (userId === session.user.id) {
      return new ChatSDKError('bad_request:api', 'Cannot change your own role').toResponse();
    }

    const updatedUser = await updateUserRole({ userId, role: role as UserRole });

    return Response.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Error updating user role:', error);
    return new ChatSDKError('internal:api', 'Failed to update user role').toResponse();
  }
}