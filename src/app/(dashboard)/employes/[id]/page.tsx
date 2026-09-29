import { supabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Employe } from "@/lib/types";
import Link from "next/link";

export default async function EmployeDetailPage({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: e } = await sb.from("employes").select("*").eq("id", params.id).single();
  if (!e) notFound();
  const emp = e as Employe;
  const { data: affectations } = await sb.from("affectations")
    .select("id, date_debut, date_fin, actif, clients(nom)")
    .eq("employe_id", emp.id).order("date_debut", { ascending: false });
  const { data: badges } = await sb.from("badges")
    .select("*").eq("employe_id", emp.id).order("date_emission", { ascending: false });

  return (
    <div className="max-w-3xl">
      <Link href="/employes" className="text-sm text-brand hover:underline">← Retour aux employés</Link>
      <div className="bg-white rounded-xl shadow-sm p-6 mt-3">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center text-brand font-bold text-2xl overflow-hidden">
            {emp.photo_url
              ? <img src={emp.photo_url} alt="" className="w-full h-full object-cover" />
              : `${emp.prenom[0]}${emp.nom[0]}`}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{emp.prenom} {emp.nom}</h1>
            <p className="text-gray-500">{emp.poste} · <span className="font-mono text-xs">{emp.numero_identifiant}</span></p>
            <p className="text-sm mt-1">{emp.telephone ?? ""} {emp.email ? `· ${emp.email}` : ""}</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-xs mb-1">Disponibilité</p>
            <p className="font-medium">{emp.disponible ? "Disponible" : "Indisponible"} · {emp.actif ? "Actif" : "Inactif"}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-xs mb-1">Date d'embauche</p>
            <p className="font-medium">{emp.date_embauche ?? "—"}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg sm:col-span-2">
            <p className="text-gray-500 text-xs mb-1">Adresse / Notes</p>
            <p className="font-medium">{emp.adresse ?? "—"}</p>
            {emp.notes && <p className="text-gray-600 mt-1">{emp.notes}</p>}
          </div>
        </div>

        <h2 className="font-semibold text-gray-800 mb-2">Affectations ({affectations?.length ?? 0})</h2>
        <ul className="divide-y text-sm mb-6">
          {(affectations ?? []).map((a: any) => (
            <li key={a.id} className="py-2 flex justify-between">
              <span>{a.clients?.nom}</span>
              <span className="text-gray-500">{a.date_debut} → {a.date_fin ?? "en cours"}</span>
            </li>
          ))}
          {!affectations?.length && <li className="py-2 text-gray-400">Aucune affectation</li>}
        </ul>

        <h2 className="font-semibold text-gray-800 mb-2">Badges ({badges?.length ?? 0})</h2>
        <ul className="divide-y text-sm">
          {(badges ?? []).map((b: any) => (
            <li key={b.id} className="py-2 flex justify-between">
              <span className="font-mono text-xs">{b.numero_badge}</span>
              <span className="text-gray-500">émis le {b.date_emission} · {b.actif ? "actif" : "inactif"}</span>
            </li>
          ))}
          {!badges?.length && <li className="py-2 text-gray-400">Aucun badge</li>}
        </ul>
      </div>
    </div>
  );
}
