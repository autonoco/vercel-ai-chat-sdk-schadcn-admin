'use client';

import { Home, Users, MessageSquare, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import type { User } from 'next-auth';
import type { UserRole } from '../(auth)/auth';

interface AdminSidebarProps {
  user: User & { role: UserRole };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();

  const navigation = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: Home,
      show: true,
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: Users,
      show: user.role === 'super_admin',
    },
    {
      title: 'Suggested Prompts',
      href: '/admin/prompts',
      icon: MessageSquare,
      show: true,
    },
  ].filter(item => item.show);

  return (
    <>
      <Sidebar className="group-data-[side=left]:border-r">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin" className="flex items-center gap-2">
                  <Settings className="size-5" />
                  <span className={cn('font-semibold', state === 'collapsed' && 'hidden')}>
                    Admin Panel
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/">
                      <Home className="size-4" />
                      <span>Back to Chat</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter>
          <SidebarUserNav user={user} />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}