'use client';

import { z } from 'zod';
import { ColumnDef } from '@tanstack/react-table';
import { UserActions } from './user-actions';
import { TableCellViewer } from '@/components/data-table';

export const userSchema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
  userId: z.string(),
});

export type UserData = z.infer<typeof userSchema>;

export const userColumns: ColumnDef<UserData>[] = [
  {
    accessorKey: "header",
    header: "User",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "target",
    header: "Created At",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.original.target}
      </div>
    ),
  },
  {
    accessorKey: "reviewer",
    header: "Type",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.original.reviewer}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <UserActions 
        userId={row.original.userId} 
        currentRole={row.original.reviewer}
      />
    ),
  },
];