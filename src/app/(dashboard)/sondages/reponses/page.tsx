import { supabaseServer } from "@/lib/supabase/server";
import { getSessionUtilisateur } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ReponsesSondagesPage() {
  const session = await getSessionUtilisateur();
  if (!session?.peut("rapports.read")) redirect("/dashboard");

  const sb = supabaseServer();
  const [{ data: formulaires }, { data: reponses }, { data: questions }] = await Promise.all([
    sb.from("formulaires_satisfaction")
      .select("*, liens_satisfaction(prestations(description, affectations(clients(nom), employes(prenom, nom))))")
      .order("date_soumission", { ascending: false }),
    sb.from("reponses_satisfaction").select("*"),
    sb.from("questions_satisfaction").select("*").order("ordre"),
  ]);

  const reponsesParLien: Record<string, any[]> = {};
  for (const r of reponses ?? []) {
    (reponsesParLien[r.lien_id] ??= []).push(r);
  }
  const noteMoyenne = formulaires?.length
    ? (formulaires.reduce((s, f) => s + (f.note_globale ?? 0), 0) / formulaires.length).toFixed(1)
    : null;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Réponses aux sondages</h1>
        <Link href="/sondages" className="text-sm text-brand hover:underline">← Envoyer un sondage</Link>
      </div>

      {noteMoyenne && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 flex items-center gap-4">
          <span className="text-4xl font-bold text-brand">{noteMoyenne}</span>
          <span className="text-gray-500 text-sm">/ 5 — note moyenne sur {formulaires!.length} sondage(s) complété(s)</span>
        </div>
      )}

      <div className="space-y-4">
        {(formulaires ?? []).map(f => {
          const p = (f as any).liens_satisfaction?.prestations;
          const reps = reponsesParLien[f.lien_id] ?? [];
          return (
            <div key={f.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-wrap justify-between gap-2 mb-3">
                <p className="font-semibold">
                  {p?.affectations?.clients?.nom} — {p?.description}
                  <span className="text-gray-400 font-normal text-sm">
                    {" "}({p?.affectations?.employes?.prenom} {p?.affectations?.employes?.nom})
                  </span>
                </p>
                <span className="bg-brand-light text-brand px-2.5 py-1 rounded-full text-xs font-medium">
                  Note globale : {f.note_globale ?? "—"}/5
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Reçu le {new Date(f.date_soumission).toLocaleString("fr-FR")}
                {f.consentement_temoignage && " · ✅ Consentement témoignage"}
              </p>
              <div className="space-y-2">
                {(questions ?? []).map(q => {
                  const r = reps.find(x => x.question_id === q.id);
                  if (!r || (r.note == null && !r.reponse_choix && !r.reponse_texte)) return null;
                  return (
                    <div key={q.id} className="text-sm bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs mb-0.5">{q.ordre}. {q.libelle}</p>
                      <p className="font-medium">
                        {r.note != null ? "⭐".repeat(r.note) : r.reponse_choix ?? r.reponse_texte}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {!formulaires?.length && (
          <p className="text-gray-400 bg-white rounded-xl shadow-sm p-8 text-center">
            Aucune réponse pour le moment. Envoyez un sondage depuis la page précédente. 📭
          </p>
        )}
      </div>
    </div>
  );
}
