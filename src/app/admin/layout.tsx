
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted">
      <AdminSidebar />
      <main className="flex-grow p-8 ml-64"> {/* Adjust ml to sidebar width */}
        {children}
      </main>
    </div>
  );
}
