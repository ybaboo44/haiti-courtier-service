import { supabaseServer } from "@/lib/supabase/server";
import StatCard from "@/components/StatCard";
import { PrestationsChart, SatisfactionChart, SondagesChart } from "@/components/Charts";
import { Users, UserCheck, UserX, UserRound, ClipboardList, PlayCircle,
  CalendarCheck, ClipboardCheck, Inbox, Star, MessageSquareWarning, TrendingUp, TrendingDown } from "lucide-react";

const MOIS_FR = ["janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export default async function DashboardPage() {
  const sb = supabaseServer();
  const ilYA6Mois = new Date();
  ilYA6Mois.setMonth(ilYA6Mois.getMonth() - 5);
  ilYA6Mois.setDate(1);
  const depuis = ilYA6Mois.toISOString().slice(0, 10);

  const [
    empActifs, empInactifs, cli, cliRecents, pres, presEnCours, presTerminees,
    affActives, liens, formulaires, reclam, retoursNouveaux, journal,
  ] = await Promise.all([
    sb.from("employes").select("id", { count: "exact", head: true }).eq("actif", true),
    sb.from("employes").select("id", { count: "exact", head: true }).eq("actif", false),
    sb.from("clients").select("id", { count: "exact", head: true }),
    sb.from("clients").select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    sb.from("prestations").select("id", { count: "exact", head: true }),
    sb.from("prestations").select("id", { count: "exact", head: true }).eq("statut", "en_cours"),
    sb.from("prestations").select("id", { count: "exact", head: true }).eq("statut", "terminee"),
    sb.from("affectations").select("id", { count: "exact", head: true }).eq("actif", true),
    sb.from("liens_satisfaction").select("date_creation"),
    sb.from("formulaires_satisfaction").select("note_globale, date_soumission"),
    sb.from("reclamations").select("id", { count: "exact", head: true }).eq("statut", "ouverte"),
    sb.from("retours_clients").select("id", { count: "exact", head: true }).eq("statut", "nouveau"),
    sb.from("journal_activite").select("*").order("created_at", { ascending: false }).limit(10),
  ]);

  // Séries sur 6 mois
  const mois = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(ilYA6Mois);
    d.setMonth(d.getMonth() + i);
    return { cle: d.toISOString().slice(0, 7), label: MOIS_FR[d.getMonth()] };
  });

  const { data: prestsMois } = await sb.from("prestations")
    .select("date_prestation").gte("date_prestation", depuis);
  const prestationsData = mois.map(m => ({
    name: m.label,
    prestations: prestsMois?.filter(p => p.date_prestation?.startsWith(m.cle)).length ?? 0,
  }));

  const satisfactionData = mois.map(m => {
    const fs = formulaires.data?.filter(f => f.date_soumission?.startsWith(m.cle)) ?? [];
    const moy = fs.length ? fs.reduce((s, f) => s + (f.note_globale ?? 0), 0) / fs.length : 0;
    return { name: m.label, note: Math.round(moy * 10) / 10, reponses: fs.length };
  });
  const sondagesData = mois.map((m, i) => ({
    name: m.label,
    envoyes: liens.data?.filter(l => l.date_creation?.startsWith(m.cle)).length ?? 0,
    reponses: satisfactionData[i].reponses,
  }));

  const nbReponses = formulaires.data?.length ?? 0;
  const moyenne = nbReponses
    ? formulaires.data!.reduce((s, f) => s + (f.note_globale ?? 0), 0) / nbReponses : null;
  const tauxSatisfaction = nbReponses
    ? Math.round(formulaires.data!.filter(f => (f.note_globale ?? 0) >= 4).length / nbReponses * 100) : null;

  const stats = [
    { titre: "Employés actifs", valeur: empActifs.count ?? 0, icon: <UserCheck size={20}/>, couleur: "bg-blue-500" },
    { titre: "Employés inactifs", valeur: empInactifs.count ?? 0, icon: <UserX size={20}/>, couleur: "bg-gray-400" },
    { titre: "Clients (dont nouveaux)", valeur: `${cli.count ?? 0} (+${cliRecents.count ?? 0})`, icon: <UserRound size={20}/>, couleur: "bg-emerald-500" },
    { titre: "Prestations (en cours / terminées)", valeur: `${pres.count ?? 0} (${presEnCours.count ?? 0} / ${presTerminees.count ?? 0})`, icon: <ClipboardList size={20}/>, couleur: "bg-violet-500" },
    { titre: "Affectations actives", valeur: affActives.count ?? 0, icon: <CalendarCheck size={20}/>, couleur: "bg-cyan-500" },
    { titre: "Sondages envoyés", valeur: liens.data?.length ?? 0, icon: <ClipboardCheck size={20}/>, couleur: "bg-amber-500" },
    { titre: "Réponses reçues", valeur: nbReponses, icon: <Inbox size={20}/>, couleur: "bg-teal-500" },
    { titre: "Note moyenne", valeur: moyenne ? `${moyenne.toFixed(1)}/5` : "—", icon: <Star size={20}/>, couleur: "bg-rose-500" },
    { titre: "Taux de satisfaction", valeur: tauxSatisfaction !== null ? `${tauxSatisfaction}%` : "—", icon: <TrendingUp size={20}/>, couleur: "bg-emerald-600" },
    { titre: "Retours à traiter", valeur: (retoursNouveaux.count ?? 0) + (reclam.count ?? 0), icon: <MessageSquareWarning size={20}/>, couleur: "bg-red-500" },
  ];

  const labelsEntite: Record<string, string> = {
    employes: "👤 Employé ajouté", clients: "🏢 Client créé",
    affectations: "📋 Affectation créée", prestations: "🔧 Prestation créée",
    formulaires_satisfaction: "⭐ Réponse de sondage reçue", retours_clients: "💬 Retour client",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {stats.map(s => <StatCard key={s.titre} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <PrestationsChart data={prestationsData} />
        <SatisfactionChart data={satisfactionData} />
        <div className="lg:col-span-2"><SondagesChart data={sondagesData} /></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Activité récente</h3>
        <ul className="divide-y text-sm">
          {(journal.data ?? []).map((j: any) => (
            <li key={j.id} className="py-2.5 flex flex-wrap justify-between gap-2">
              <span>{labelsEntite[j.entite] ?? `📌 ${j.entite}`}
                {j.details?.nom && <span className="text-gray-500"> — {j.details.nom}</span>}
                {j.details?.nom_complet && <span className="text-gray-500"> — {j.details.nom_complet}</span>}
                {j.details?.description && <span className="text-gray-500"> — {j.details.description}</span>}
                {j.details?.sujet && <span className="text-gray-500"> — {j.details.sujet}</span>}
                {j.details?.contenu && <span className="text-gray-500"> — « {String(j.details.contenu).slice(0, 60)}… »</span>}
              </span>
              <span className="text-gray-400 text-xs">
                {new Date(j.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </li>
          ))}
          {!journal.data?.length && <li className="py-3 text-gray-400">Aucune activité récente.</li>}
        </ul>
      </div>
    </div>
  );
}
