'use server';

import { auth } from '@/app/(auth)/auth';
import { updateUserRole } from '@/lib/db/admin-queries';
import { revalidatePath } from 'next/cache';

export async function makeUserAdmin(userId: string) {
  const session = await auth();
  
  // Only super admins can make other users admins
  if (!session?.user || session.user.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  try {
    await updateUserRole({ userId, role: 'admin' });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Failed to update user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

export async function removeAdminRole(userId: string) {
  const session = await auth();
  
  // Only super admins can remove admin roles
  if (!session?.user || session.user.role !== 'super_admin') {
    throw new Error('Unauthorized');
  }

  try {
    await updateUserRole({ userId, role: 'user' });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Failed to update user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}