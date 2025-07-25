import { AdminSidebar } from "./admin-sidebar"
import { AdminSiteHeader } from "@/components/admin-site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { auth } from '../(auth)/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
    return null; // Middleware should handle this, but double-check
  }

  return (
    <SidebarProvider>
      <AdminSidebar user={session.user} />
      <SidebarInset>
        <AdminSiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}