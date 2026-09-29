import { supabaseServer } from "@/lib/supabase/server";
import StatCard from "@/components/StatCard";
import { Users, UserCheck, ClipboardList, Star, MessageSquareWarning, Award } from "lucide-react";

export default async function DashboardPage() {
  const sb = supabaseServer();
  const [emp, cli, pres, badges, notes, reclam] = await Promise.all([
    sb.from("employes").select("id", { count: "exact", head: true }).eq("actif", true),
    sb.from("clients").select("id", { count: "exact", head: true }),
    sb.from("prestations").select("id", { count: "exact", head: true }),
    sb.from("badges").select("id", { count: "exact", head: true }).eq("actif", true),
    sb.from("formulaires_satisfaction").select("note_globale"),
    sb.from("reclamations").select("id", { count: "exact", head: true }).eq("statut", "ouverte"),
  ]);
  const moyenne = notes.data?.length
    ? (notes.data.reduce((s, n) => s + (n.note_globale ?? 0), 0) / notes.data.length).toFixed(1)
    : "—";

  const stats = [
    { titre: "Employés actifs", valeur: emp.count ?? 0, icon: <Users size={22}/>, couleur: "bg-blue-500" },
    { titre: "Clients", valeur: cli.count ?? 0, icon: <UserCheck size={22}/>, couleur: "bg-emerald-500" },
    { titre: "Prestations", valeur: pres.count ?? 0, icon: <ClipboardList size={22}/>, couleur: "bg-violet-500" },
    { titre: "Badges actifs", valeur: badges.count ?? 0, icon: <Award size={22}/>, couleur: "bg-amber-500" },
    { titre: "Note moyenne", valeur: moyenne, icon: <Star size={22}/>, couleur: "bg-rose-500" },
    { titre: "Réclamations ouvertes", valeur: reclam.count ?? 0, icon: <MessageSquareWarning size={22}/>, couleur: "bg-red-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(s => <StatCard key={s.titre} {...s} />)}
      </div>
    </div>
  );
}
