'use client';

import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/data-table';
import { userColumns, type UserData } from './users-data-table';

interface UsersTableWrapperProps {
  data: UserData[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
}

export function UsersTableWrapper({ 
  data, 
  totalCount, 
  pageCount, 
  currentPage,
  pageSize 
}: UsersTableWrapperProps) {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (pageSize !== 10) {
      params.set('limit', pageSize.toString());
    }
    router.push(`/admin/users?${params.toString()}`);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams();
    params.set('page', '1'); // Reset to first page when changing page size
    if (newPageSize !== 10) {
      params.set('limit', newPageSize.toString());
    }
    router.push(`/admin/users?${params.toString()}`);
  };

  return (
    <DataTable 
      data={data}
      columns={userColumns}
      totalCount={totalCount}
      pageCount={pageCount}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
}