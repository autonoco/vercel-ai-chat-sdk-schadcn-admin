import { auth } from '@/app/(auth)/auth';
import { getAdminStats } from '@/lib/db/admin-queries';
import { AdminSectionCards } from '@/components/admin-section-cards';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
    return null;
  }

  const stats = await getAdminStats();

  // Sample data for the admin dashboard table
  const quickActionsData = [
    {
      id: 1,
      header: "Manage Users",
      type: "User Management",
      status: "Active",
      target: stats.totalUsers.toString(),
      limit: "∞",
      reviewer: session.user.email || "Admin",
    },
    {
      id: 2,
      header: "Manage Prompts",
      type: "Content Management",
      status: "Active",
      target: stats.activePrompts.toString(),
      limit: "100",
      reviewer: session.user.email || "Admin",
    },
    {
      id: 3,
      header: "Total Chats",
      type: "Analytics",
      status: "Done",
      target: stats.totalChats.toString(),
      limit: "∞",
      reviewer: "System",
    },
    {
      id: 4,
      header: "Total Messages",
      type: "Analytics",
      status: "Done",
      target: stats.totalMessages.toString(),
      limit: "∞",
      reviewer: "System",
    },
  ];

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <AdminSectionCards stats={stats} />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
    </div>
  );
}