import { supabaseServer } from "@/lib/supabase/server";
import { getSessionUtilisateur } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SatisfactionChart } from "@/components/Charts";

const MOIS_FR = ["janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export default async function SatisfactionPage({ searchParams }:
  { searchParams: { note?: string; du?: string; au?: string } }) {
  const session = await getSessionUtilisateur();
  if (!session?.peut("rapports.read")) redirect("/dashboard");

  const sb = supabaseServer();
  let requete = sb.from("formulaires_satisfaction")
    .select("*, liens_satisfaction(prestations(description, affectations(clients(nom), employes(prenom, nom))))")
    .order("date_soumission", { ascending: false });
  if (searchParams.note) requete = requete.gte("note_globale", Number(searchParams.note));
  if (searchParams.du) requete = requete.gte("date_soumission", `${searchParams.du}T00:00:00`);
  if (searchParams.au) requete = requete.lte("date_soumission", `${searchParams.au}T23:59:59`);
  const { data: formulaires } = await requete;

  const { data: reponses } = await sb.from("reponses_satisfaction").select("*");
  const { data: questions } = await sb.from("questions_satisfaction").select("*").order("ordre");

  const fs = formulaires ?? [];
  const moyenne = fs.length ? fs.reduce((s, f) => s + (f.note_globale ?? 0), 0) / fs.length : null;
  const satisfaits = fs.filter(f => (f.note_globale ?? 0) >= 4).length;
  const insatisfaits = fs.filter(f => (f.note_globale ?? 0) <= 2).length;

  // Évolution 6 mois
  const ilYA6Mois = new Date();
  ilYA6Mois.setMonth(ilYA6Mois.getMonth() - 5);
  ilYA6Mois.setDate(1);
  const mois = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(ilYA6Mois);
    d.setMonth(d.getMonth() + i);
    return { cle: d.toISOString().slice(0, 7), label: MOIS_FR[d.getMonth()] };
  });
  const evolution = mois.map(m => {
    const fms = fs.filter(f => f.date_soumission?.startsWith(m.cle));
    const moy = fms.length ? fms.reduce((s, f) => s + (f.note_globale ?? 0), 0) / fms.length : 0;
    return { name: m.label, note: Math.round(moy * 10) / 10, reponses: fms.length };
  });

  // Satisfaction par question (notes)
  const questionsNotes = (questions ?? []).filter(q => q.type_question === "note").map(q => {
    const rs = (reponses ?? []).filter(r => r.question_id === q.id && r.note != null);
    const moy = rs.length ? rs.reduce((s, r) => s + r.note!, 0) / rs.length : 0;
    return { libelle: q.libelle, note: Math.round(moy * 10) / 10, nb: rs.length };
  }).filter(q => q.nb > 0).sort((a, b) => a.note - b.note);

  const inputCls = "border rounded-lg px-3 py-2 text-sm";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analyse de la satisfaction</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Note moyenne", valeur: moyenne ? `${moyenne.toFixed(1)}/5` : "—" },
          { label: "Réponses", valeur: fs.length },
          { label: "Taux de satisfaction (≥4★)", valeur: fs.length ? `${Math.round(satisfaits / fs.length * 100)}%` : "—" },
          { label: "Taux d'insatisfaction (≤2★)", valeur: fs.length ? `${Math.round(insatisfaits / fs.length * 100)}%` : "—" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-gray-500 text-xs mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-800">{s.valeur}</p>
          </div>
        ))}
      </div>

      <form method="GET" className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Note min.</label>
          <select name="note" defaultValue={searchParams.note ?? ""} className={inputCls}>
            <option value="">Toutes</option>
            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>≥ {n}★</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Du</label>
          <input type="date" name="du" defaultValue={searchParams.du ?? ""} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Au</label>
          <input type="date" name="au" defaultValue={searchParams.au ?? ""} className={inputCls} />
        </div>
        <button className="bg-brand text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-dark">Filtrer</button>
        <Link href="/satisfaction" className="text-sm text-gray-500 hover:underline">Réinitialiser</Link>
      </form>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <SatisfactionChart data={evolution} />
        <div className="bg-white rounded-xl shadow-sm p-5 h-72 overflow-y-auto">
          <h3 className="font-semibold text-gray-800 mb-3">Points forts / axes d'amélioration</h3>
          <div className="space-y-2">
            {questionsNotes.map((q, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                  <span className="truncate mr-2">{q.libelle}</span>
                  <span className="font-medium shrink-0">{q.note}/5 ({q.nb})</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${q.note >= 4 ? "bg-emerald-500" : q.note >= 3 ? "bg-amber-400" : "bg-red-400"}`}
                    style={{ width: `${q.note / 5 * 100}%` }} />
                </div>
              </div>
            ))}
            {!questionsNotes.length && <p className="text-gray-400 text-sm">Pas assez de données.</p>}
          </div>
        </div>
      </div>

      <h3 className="font-semibold text-gray-800 mb-3">Commentaires récents</h3>
      <div className="space-y-3">
        {fs.slice(0, 10).map(f => {
          const p = (f as any).liens_satisfaction?.prestations;
          const commentaires = (reponses ?? []).filter(r =>
            r.lien_id === f.lien_id && r.reponse_texte);
          return (
            <div key={f.id} className="bg-white rounded-xl shadow-sm p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2 mb-1">
                <p className="font-medium">{p?.affectations?.clients?.nom} — {p?.description}</p>
                <span className="text-amber-500">{"⭐".repeat(f.note_globale ?? 0)}</span>
              </div>
              {commentaires.map((c, i) => (
                <p key={i} className="text-gray-600 italic border-l-2 border-gray-200 pl-3 my-1">
                  « {c.reponse_texte} »
                </p>
              ))}
            </div>
          );
        })}
        {!fs.length && <p className="text-gray-400 text-sm">Aucune réponse avec ces filtres.</p>}
      </div>
    </div>
  );
}
