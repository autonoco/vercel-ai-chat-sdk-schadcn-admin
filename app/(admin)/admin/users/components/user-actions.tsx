'use client';

import { useState } from 'react';
import { MoreVerticalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { makeUserAdmin, removeAdminRole } from '../actions';
import { toast } from 'sonner';

interface UserActionsProps {
  userId: string;
  currentRole: string;
}

export function UserActions({ userId, currentRole }: UserActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMakeAdmin = async () => {
    if (currentRole === 'admin' || currentRole === 'super_admin') {
      toast.info('User is already an admin');
      return;
    }

    setIsLoading(true);
    try {
      const result = await makeUserAdmin(userId);
      if (result.success) {
        toast.success('User has been made an admin');
      } else {
        toast.error(result.error || 'Failed to update user role');
      }
    } catch (error) {
      toast.error('An error occurred while updating user role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (currentRole === 'user') {
      toast.info('User is not an admin');
      return;
    }

    if (currentRole === 'super_admin') {
      toast.error('Cannot remove super admin role');
      return;
    }

    setIsLoading(true);
    try {
      const result = await removeAdminRole(userId);
      if (result.success) {
        toast.success('Admin role has been removed');
      } else {
        toast.error(result.error || 'Failed to update user role');
      }
    } catch (error) {
      toast.error('An error occurred while updating user role');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
          size="icon"
          disabled={isLoading}
        >
          <MoreVerticalIcon />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem 
          onClick={handleMakeAdmin}
          disabled={currentRole === 'admin' || currentRole === 'super_admin' || isLoading}
        >
          Make Admin
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleRemoveAdmin}
          disabled={currentRole === 'user' || currentRole === 'super_admin' || isLoading}
          className="text-red-600 dark:text-red-400"
        >
          Remove Admin
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}