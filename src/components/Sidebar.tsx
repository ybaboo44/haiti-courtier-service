"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { LayoutDashboard, Users, CalendarCheck, Award, Medal, ShieldCheck, LogOut,
  UserRound, ClipboardList, MessageSquarePlus, ClipboardCheck, Inbox, BarChart3,
  CircleUserRound, Menu, X, Settings } from "lucide-react";

type Item = { href: string; label: string; icon: any; perm: string | null };
type Groupe = { label: string; items: Item[] };

const groupes: Groupe[] = [
  { label: "Principal", items: [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, perm: null },
  ]},
  { label: "RH", items: [
    { href: "/employes", label: "Employés", icon: Users, perm: "employes.read" },
    { href: "/affectations", label: "Affectations", icon: CalendarCheck, perm: "affectations.manage" },
    { href: "/badges", label: "Badges ID", icon: Award, perm: "badges.manage" },
    { href: "/distinctions", label: "Distinctions", icon: Medal, perm: "badges.manage" },
    { href: "/utilisateurs", label: "Utilisateurs", icon: ShieldCheck, perm: "utilisateurs.manage" },
  ]},
  { label: "Clients", items: [
    { href: "/clients", label: "Clients", icon: UserRound, perm: "clients.read" },
    { href: "/prestations", label: "Prestations", icon: ClipboardList, perm: "affectations.manage" },
    { href: "/retours", label: "Retours clients", icon: MessageSquarePlus, perm: "reclamations.read" },
    { href: "/reclamations", label: "Réclamations", icon: Inbox, perm: "reclamations.read" },
  ]},
  { label: "Satisfaction", items: [
    { href: "/sondages", label: "Sondages", icon: ClipboardCheck, perm: "affectations.manage" },
    { href: "/satisfaction", label: "Analyse", icon: BarChart3, perm: "rapports.read" },
  ]},
  { label: "Administration", items: [
    { href: "/rapports", label: "Exports", icon: BarChart3, perm: "rapports.read" },
    { href: "/parametres", label: "Paramètres", icon: Settings, perm: "utilisateurs.manage" },
  ]},
];

export default function Sidebar({ permissions, estAdmin, nom, role }:
  { permissions: string[]; estAdmin: boolean; nom: string; role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);

  const visible = groupes.map(g => ({
    ...g,
    items: g.items.filter(m => !m.perm || estAdmin || permissions.includes(m.perm)),
  })).filter(g => g.items.length > 0);

  async function deconnexion() {
    await supabaseBrowser().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const nav = (
    <>
      {visible.map(g => (
        <div key={g.label} className="mb-4">
          <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-blue-300/70">{g.label}</p>
          {g.items.map(m => (
            <Link key={m.href} href={m.href} onClick={() => setOuvert(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition mb-0.5
                ${pathname.startsWith(m.href) ? "bg-white/20 text-white" : "text-blue-100 hover:bg-white/10"}`}>
              <m.icon size={17} /> <span className="text-sm">{m.label}</span>
            </Link>
          ))}
        </div>
      ))}
      <Link href="/profil" onClick={() => setOuvert(false)}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1
          ${pathname.startsWith("/profil") ? "bg-white/20 text-white" : "text-blue-100 hover:bg-white/10"}`}>
        <CircleUserRound size={17} /> <span className="text-sm">Mon profil</span>
      </Link>
      <button onClick={deconnexion}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-blue-100">
        <LogOut size={17} /> Déconnexion
      </button>
    </>
  );

  return (
    <>
      {/* Barre mobile */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-brand-dark text-white flex items-center justify-between px-4 py-3">
        <span className="font-bold">Haiti Courtier</span>
        <button onClick={() => setOuvert(true)} aria-label="Menu">
          <Menu size={22} />
        </button>
      </div>

      {/* Drawer mobile */}
      {ouvert && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOuvert(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-brand-dark text-white p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-bold">{nom}</p>
                <p className="text-blue-200 text-xs capitalize">{role}</p>
              </div>
              <button onClick={() => setOuvert(false)} aria-label="Fermer"><X size={22} /></button>
            </div>
            {nav}
          </div>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 bg-brand-dark text-white min-h-screen p-4 flex-col shrink-0 overflow-y-auto">
        <div className="mb-6">
          <h2 className="font-bold text-lg">Haiti Courtier</h2>
          <p className="text-blue-200 text-sm capitalize">{nom} · {role}</p>
        </div>
        <nav className="flex-1">{nav}</nav>
      </aside>
    </>
  );
}
