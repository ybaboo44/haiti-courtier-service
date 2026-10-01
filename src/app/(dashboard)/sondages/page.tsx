import { supabaseServer } from "@/lib/supabase/server";
import { getSessionUtilisateur } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import FormSondage from "@/components/FormSondage";
import ActionsSondage from "@/components/ActionsSondage";

const statuts: Record<string, { label: string; style: string }> = {
  brouillon: { label: "Brouillon", style: "bg-gray-100 text-gray-600" },
  publie: { label: "✅ Publié", style: "bg-emerald-100 text-emerald-700" },
  desactive: { label: "Désactivé", style: "bg-red-50 text-red-500" },
};

export default async function SondagesPage() {
  const session = await getSessionUtilisateur();
  if (!session?.peut("affectations.manage")) redirect("/dashboard");

  const sb = supabaseServer();
  const [{ data: sondages }, { data: compteurs }] = await Promise.all([
    sb.from("sondages").select("*").order("created_at", { ascending: false }),
    sb.from("liens_satisfaction").select("sondage_id"),
  ]);
  const envoisParSondage: Record<string, number> = {};
  for (const l of compteurs ?? []) {
    if (l.sondage_id) envoisParSondage[l.sondage_id] = (envoisParSondage[l.sondage_id] ?? 0) + 1;
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sondages</h1>
        <div className="flex gap-2">
          <Link href="/sondages/envoyer"
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600">
            📤 Envoyer (WhatsApp)
          </Link>
          <Link href="/sondages/reponses"
            className="border border-brand text-brand px-4 py-2 rounded-lg text-sm hover:bg-brand-light">
            📬 Réponses
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5 h-fit">
          <h2 className="font-semibold text-gray-800 mb-3">Créer un sondage</h2>
          <FormSondage />
        </div>
        <div className="lg:col-span-2 space-y-3">
          {(sondages ?? []).map(s => (
            <div key={s.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="font-semibold">{s.titre}</p>
                <span className={`px-2.5 py-1 rounded-full text-xs ${statuts[s.statut]?.style}`}>
                  {statuts[s.statut]?.label}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {envoisParSondage[s.id] ?? 0} envoi(s)
                </span>
              </div>
              {s.description && <p className="text-sm text-gray-500 mb-3">{s.description}</p>}
              <ActionsSondage sondageId={s.id} statut={s.statut} />
            </div>
          ))}
          {!sondages?.length && (
            <p className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
              Aucun sondage. Créez votre premier sondage. 📝
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
