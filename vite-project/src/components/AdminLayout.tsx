import { AdminNavbar } from "./AdminNavbar";
import { AdminFooter } from "./AdminFooter";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminNavbar />
      <main className="flex-1">
        {children}
      </main>
      <AdminFooter />
    </div>
  );
}

