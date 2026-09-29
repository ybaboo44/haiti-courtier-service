"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { QuestionSatisfaction } from "@/lib/types";

type Reponse = { note?: number; choix?: string; texte?: string };

export default function SatisfactionForm({ lienId, questions }:
  { lienId: string; questions: QuestionSatisfaction[] }) {
  const [reponses, setReponses] = useState<Record<string, Reponse>>({});
  const [consentement, setConsentement] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  function maj(id: string, patch: Partial<Reponse>) {
    setReponses(r => ({ ...r, [id]: { ...r[id], ...patch } }));
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    const sb = supabaseBrowser();
    const notes = questions.filter(q => q.type_question === "note");
    const somme = notes.reduce((s, q) => s + (reponses[q.id]?.note ?? 0), 0);
    const moyenne = notes.length ? Math.max(1, Math.round(somme / notes.length)) : null;

    const { data: formulaire, error: errF } = await sb
      .from("formulaires_satisfaction")
      .insert({ lien_id: lienId, note_globale: moyenne, consentement_temoignage: consentement })
      .select().single();
    if (errF) { setErreur("Erreur lors de l'envoi. Veuillez réessayer."); setChargement(false); return; }

    const lignes = questions.map(q => ({
      lien_id: lienId,
      question_id: q.id,
      note: reponses[q.id]?.note ?? null,
      reponse_choix: reponses[q.id]?.choix ?? null,
      reponse_texte: reponses[q.id]?.texte ?? null,
    }));
    await sb.from("reponses_satisfaction").insert(lignes);
    await sb.from("liens_satisfaction").update({ utilise: true }).eq("id", lienId);

    if (consentement) {
      const qTexte = questions.filter(q => q.type_question === "texte");
      const contenu = qTexte.map(q => reponses[q.id]?.texte).filter(Boolean).join("\n");
      if (contenu) {
        await sb.from("temoignages").insert({ formulaire_id: formulaire.id, contenu });
      }
    }
    setChargement(false);
    setEnvoye(true);
  }

  if (envoye) return (
    <div className="text-center py-8">
      <p className="text-4xl mb-2">🎉</p>
      <p className="font-semibold text-emerald-600">Merci ! Votre avis a bien été enregistré.</p>
    </div>
  );

  return (
    <form onSubmit={soumettre} className="space-y-6">
      {questions.map(q => (
        <div key={q.id}>
          <p className="font-medium text-sm mb-2">{q.ordre}. {q.libelle}</p>
          {q.type_question === "note" && (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button type="button" key={n} onClick={() => maj(q.id, { note: n })}
                  className={`w-10 h-10 rounded-lg border text-lg transition
                    ${reponses[q.id]?.note === n ? "bg-brand text-white border-brand" : "bg-white hover:border-brand"}`}>
                  {n}
                </button>
              ))}
            </div>
          )}
          {q.type_question === "choix" && (
            <div className="space-y-1.5">
              {(q.options as string[]).map(opt => (
                <label key={opt} className="flex items-center gap-2 text-sm">
                  <input type="radio" name={q.id} required className="accent-brand"
                    onChange={() => maj(q.id, { choix: opt })} />
                  {opt}
                </label>
              ))}
            </div>
          )}
          {q.type_question === "texte" && (
            <textarea rows={3} className="w-full border rounded-lg p-2 text-sm"
              onChange={e => maj(q.id, { texte: e.target.value })} />
          )}
        </div>
      ))}
      <label className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg cursor-pointer">
        <input type="checkbox" className="mt-0.5 accent-brand"
               checked={consentement} onChange={e => setConsentement(e.target.checked)} />
        J'accepte que mes commentaires soient publiés comme témoignage (facultatif).
      </label>
      {erreur && <p className="text-red-600 text-sm">{erreur}</p>}
      <button disabled={chargement}
        className="w-full bg-brand text-white py-3 rounded-lg font-medium hover:bg-brand-dark disabled:opacity-60">
        {chargement ? "Envoi..." : "Envoyer mon évaluation"}
      </button>
    </form>
  );
}
