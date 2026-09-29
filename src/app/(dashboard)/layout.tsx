import { redirect } from "next/navigation";
import { getSessionUtilisateur } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUtilisateur();
  if (!session) redirect("/login");
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        permissions={session.permissions}
        estAdmin={session.estAdmin}
        nom={session.profil?.nom_complet ?? ""}
        role={session.profil?.roles?.code ?? ""}
      />
      <main className="flex-1 p-4 md:p-8 overflow-x-auto">{children}</main>
    </div>
  );
}
