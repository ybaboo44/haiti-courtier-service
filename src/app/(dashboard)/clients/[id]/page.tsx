import { supabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: c } = await sb.from("clients").select("*").eq("id", params.id).single();
  if (!c) notFound();

  const [{ data: affectations }, { data: reclamations }] = await Promise.all([
    sb.from("affectations")
      .select("id, date_debut, date_fin, actif, employes(prenom, nom, poste), prestations(id, description, date_prestation, statut)")
      .eq("client_id", c.id).order("date_debut", { ascending: false }),
    sb.from("reclamations").select("*").eq("client_id", c.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="max-w-3xl">
      <Link href="/clients" className="text-sm text-brand hover:underline">← Retour aux clients</Link>
      <div className="bg-white rounded-xl shadow-sm p-6 mt-3">
        <h1 className="text-xl font-bold text-gray-800">{c.nom}</h1>
        <p className="text-gray-500 text-sm capitalize mb-4">{c.type_client}
          {c.contact_nom && <> · Contact : {c.contact_nom}</>}
        </p>
        <div className="grid sm:grid-cols-3 gap-4 text-sm mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-xs mb-1">Téléphone</p>
            <p className="font-medium">{c.telephone}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-xs mb-1">E-mail</p>
            <p className="font-medium break-all">{c.email ?? "—"}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-xs mb-1">Adresse</p>
            <p className="font-medium">{c.adresse ?? "—"}</p>
          </div>
        </div>
        {c.notes && <p className="text-sm text-gray-600 mb-6">📝 {c.notes}</p>}

        <h2 className="font-semibold text-gray-800 mb-2">Historique ({affectations?.length ?? 0})</h2>
        <div className="space-y-3 mb-6">
          {(affectations ?? []).map((a: any) => (
            <div key={a.id} className="border rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <p className="font-medium">{a.employes?.prenom} {a.employes?.nom} · {a.employes?.poste}</p>
                <p className="text-gray-500 text-xs">{a.date_debut} → {a.date_fin ?? "en cours"}</p>
              </div>
              {(a.prestations ?? []).map((p: any) => (
                <p key={p.id} className="text-xs text-gray-500 mt-1">
                  • {p.description} ({p.date_prestation}) — <span className="capitalize">{p.statut}</span>
                </p>
              ))}
            </div>
          ))}
          {!affectations?.length && <p className="text-gray-400 text-sm">Aucune affectation</p>}
        </div>

        <h2 className="font-semibold text-gray-800 mb-2">Réclamations ({reclamations?.length ?? 0})</h2>
        <ul className="divide-y text-sm">
          {(reclamations ?? []).map((r: any) => (
            <li key={r.id} className="py-2">
              <p className="font-medium">{r.sujet} <span className="text-xs text-gray-400">({r.statut})</span></p>
              <p className="text-gray-500 text-xs">{r.description}</p>
            </li>
          ))}
          {!reclamations?.length && <li className="py-2 text-gray-400">Aucune réclamation</li>}
        </ul>
      </div>
    </div>
  );
}
