import { supabaseServer } from "@/lib/supabase/server";
import { getSessionUtilisateur } from "@/lib/auth";
import Link from "next/link";
import ActionsRetour from "@/components/ActionsRetour";

const types: Record<string, { label: string; style: string }> = {
  positif: { label: "😊 Avis positif", style: "bg-emerald-100 text-emerald-700" },
  neutre: { label: "😐 Avis neutre", style: "bg-gray-100 text-gray-600" },
  negatif: { label: "😞 Avis négatif", style: "bg-orange-100 text-orange-700" },
  reclamation: { label: "⚠️ Réclamation", style: "bg-red-100 text-red-700" },
  suggestion: { label: "💡 Suggestion", style: "bg-blue-100 text-blue-700" },
};
const statuts: Record<string, string> = {
  nouveau: "bg-red-50 text-red-600", en_cours: "bg-amber-50 text-amber-600",
  traite: "bg-emerald-50 text-emerald-600", archive: "bg-gray-100 text-gray-500",
};

export default async function RetoursPage({ searchParams }:
  { searchParams: { type?: string; statut?: string } }) {
  const session = await getSessionUtilisateur();
  const peutModifier = session?.estAdmin || session?.peut("reclamations.write");
  const sb = supabaseServer();

  let requete = sb.from("retours_clients")
    .select("*, clients(nom), employes(prenom, nom), prestations(description)")
    .order("created_at", { ascending: false });
  if (searchParams.type) requete = requete.eq("type_retour", searchParams.type);
  if (searchParams.statut) requete = requete.eq("statut", searchParams.statut);
  const { data: retours } = await requete;

  const chips = [
    { param: "type", code: "positif", label: "Positifs" },
    { param: "type", code: "negatif", label: "Négatifs" },
    { param: "type", code: "reclamation", label: "Réclamations" },
    { param: "type", code: "suggestion", label: "Suggestions" },
    { param: "statut", code: "nouveau", label: "Nouveaux" },
    { param: "statut", code: "en_cours", label: "En cours" },
  ];

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Retours clients</h1>
        {peutModifier && (
          <Link href="/retours/nouveau"
            className="bg-brand text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-dark">
            + Nouveau retour
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Link href="/retours" className="px-3 py-1.5 rounded-full text-xs border bg-white text-gray-600 hover:border-brand">
          Tous
        </Link>
        {chips.map(c => (
          <Link key={c.code} href={`/retours?${c.param}=${c.code}`}
            className={`px-3 py-1.5 rounded-full text-xs border transition
              ${searchParams[c.param as "type" | "statut"] === c.code
                ? "bg-brand text-white border-brand" : "bg-white text-gray-600 hover:border-brand"}`}>
            {c.label}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {(retours ?? []).map(r => (
          <div key={r.id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${types[r.type_retour]?.style}`}>
                {types[r.type_retour]?.label ?? r.type_retour}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs capitalize ${statuts[r.statut]}`}>
                {r.statut.replace("_", " ")}
              </span>
              <span className="text-xs text-gray-400 ml-auto">
                {new Date(r.created_at).toLocaleString("fr-FR")}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{r.contenu}</p>
            <p className="text-xs text-gray-400 mb-3">
              {(r as any).clients?.nom && <>Client : {(r as any).clients.nom} · </>}
              {(r as any).employes && <>Employé : {(r as any).employes.prenom} {(r as any).employes.nom} · </>}
              {(r as any).prestations?.description && <>Prestation : {(r as any).prestations.description}</>}
            </p>
            <ActionsRetour retourId={r.id} statut={r.statut} peutModifier={!!peutModifier} />
          </div>
        ))}
        {!retours?.length && (
          <p className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
            Aucun retour pour ces filtres. 💬
          </p>
        )}
      </div>
    </div>
  );
}
