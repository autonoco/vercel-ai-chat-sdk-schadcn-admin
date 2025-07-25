import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { getAllUsers } from '@/lib/db/admin-queries';
import { UsersTableWrapper } from './components/users-table-wrapper';
import { format } from 'date-fns';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'super_admin') {
    redirect('/admin');
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const offset = (page - 1) * limit;

  const { users, total, hasMore } = await getAllUsers({ limit, offset });

  // Transform users data for DataTable
  const userData = users.map((user, index) => ({
    id: offset + index + 1,
    header: user.email,
    type: "User Account",
    status: user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'User',
    target: format(new Date(user.createdAt), 'PP'),
    limit: format(new Date(user.updatedAt), 'PP'),
    reviewer: user.role,
    userId: user.id,
  }));

  const pageCount = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <UsersTableWrapper 
        data={userData} 
        totalCount={total}
        pageCount={pageCount}
        currentPage={page}
        pageSize={limit}
      />
    </div>
  );
}