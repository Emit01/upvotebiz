import { Providers } from "@/components/Providers";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export const metadata = {
  title: "Admin — UpvoteBiz",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="font-apple flex min-h-screen bg-surface-secondary text-[#1d1d1f] antialiased">
        <AdminSidebar />
        <div className="ml-[256px] flex flex-1 flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 px-8 py-6 animate-fade-in">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
