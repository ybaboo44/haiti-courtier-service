import { supabaseServer } from "@/lib/supabase/server";
import { Affectation } from "@/lib/types";
import LienSatisfactionButton from "@/components/LienSatisfactionButton";

export default async function AffectationsPage() {
  const sb = supabaseServer();
  const { data: affectations } = await sb.from("affectations")
    .select("*, employes(prenom, nom, poste), clients(nom)")
    .order("date_debut", { ascending: false });
  const { data: prestations } = await sb.from("prestations")
    .select("id, affectation_id, description, date_prestation, statut");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Affectations</h1>
      <div className="space-y-4">
        {(affectations as any[] ?? []).map(a => (
          <div key={a.id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex flex-wrap justify-between gap-3 mb-3">
              <div>
                <p className="font-semibold">{a.employes?.prenom} {a.employes?.nom}
                  <span className="text-gray-400 font-normal"> · {a.employes?.poste}</span></p>
                <p className="text-sm text-gray-500">Client : {a.clients?.nom}</p>
              </div>
              <p className="text-sm text-gray-500">{a.date_debut} → {a.date_fin ?? "en cours"}</p>
            </div>
            <div className="border-t pt-3">
              <p className="text-xs font-medium text-gray-500 mb-2">PRESTATIONS</p>
              <ul className="space-y-2">
                {(prestations ?? []).filter((p: any) => p.affectation_id === a.id).map((p: any) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="flex-1">{p.description}</span>
                    <span className="text-gray-500">{p.date_prestation}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-brand-light text-brand">{p.statut}</span>
                    <LienSatisfactionButton prestationId={p.id} />
                  </li>
                ))}
                {!prestations?.some((p: any) => p.affectation_id === a.id) &&
                  <li className="text-gray-400 text-sm">Aucune prestation</li>}
              </ul>
            </div>
          </div>
        ))}
        {!affectations?.length && <p className="text-gray-400">Aucune affectation enregistrée.</p>}
      </div>
    </div>
  );
}
