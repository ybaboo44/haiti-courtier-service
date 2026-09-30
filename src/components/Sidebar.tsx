"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { LayoutDashboard, Users, UserRound, CalendarCheck, Award, MessageSquareWarning, BarChart3, ShieldCheck, LogOut, ClipboardCheck, CircleUserRound } from "lucide-react";

const menu = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, perm: null },
  { href: "/employes", label: "Employés", icon: Users, perm: "employes.read" },
  { href: "/clients", label: "Clients", icon: UserRound, perm: "clients.read" },
  { href: "/affectations", label: "Affectations", icon: CalendarCheck, perm: "affectations.manage" },
  { href: "/sondages", label: "Sondages", icon: ClipboardCheck, perm: "affectations.manage" },
  { href: "/badges", label: "Badges", icon: Award, perm: "badges.manage" },
  { href: "/reclamations", label: "Réclamations", icon: MessageSquareWarning, perm: "reclamations.read" },
  { href: "/rapports", label: "Rapports", icon: BarChart3, perm: "rapports.read" },
  { href: "/utilisateurs", label: "Utilisateurs", icon: ShieldCheck, perm: "utilisateurs.manage" },
];

export default function Sidebar({ permissions, estAdmin, nom, role }:
  { permissions: string[]; estAdmin: boolean; nom: string; role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const visible = menu.filter(m => !m.perm || estAdmin || permissions.includes(m.perm));

  async function deconnexion() {
    await supabaseBrowser().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 bg-brand-dark text-white min-h-screen p-4 flex flex-col shrink-0 hidden md:flex">
      <div className="mb-8">
        <h2 className="font-bold text-lg">Haiti Courtier</h2>
        <p className="text-blue-200 text-sm capitalize">{nom} · {role}</p>
      </div>
      <nav className="flex-1 space-y-1">
        {visible.map(m => (
          <Link key={m.href} href={m.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition
              ${pathname.startsWith(m.href) ? "bg-white/20" : "hover:bg-white/10"}`}>
            <m.icon size={18} /> <span className="text-sm">{m.label}</span>
          </Link>
        ))}
      </nav>
      <Link href="/profil"
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition
          ${pathname.startsWith("/profil") ? "bg-white/20" : "hover:bg-white/10 text-blue-100"}`}>
        <CircleUserRound size={18} /> Mon profil
      </Link>
      <button onClick={deconnexion}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-sm text-blue-100">
        <LogOut size={18} /> Déconnexion
      </button>
    </aside>
  );
}
