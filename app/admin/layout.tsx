/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/layout.tsx
import AdminSidebar from "@/components/admin/AdminSidebar";
import WaiterCallsPanel from "@/components/admin/WaiterCallsPanel";

export default function AdminLayout({ children }: any) {
  return (
    <div className="flex max-h-screen bg-[#0d1f1a]">
      <AdminSidebar />
      {children}
      <WaiterCallsPanel />  {/* floats fixed bottom-right */}
    </div>
  );
}