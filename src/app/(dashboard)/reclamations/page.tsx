import { supabaseServer } from "@/lib/supabase/server";
import { getSessionUtilisateur } from "@/lib/auth";
import { Reclamation } from "@/lib/types";

const couleursStatut: Record<string, string> = {
  ouverte: "bg-red-100 text-red-700",
  en_traitement: "bg-amber-100 text-amber-700",
  resolue: "bg-emerald-100 text-emerald-700",
  fermee: "bg-gray-100 text-gray-500",
};

export default async function ReclamationsPage() {
  const sb = supabaseServer();
  const session = await getSessionUtilisateur();
  const { data: reclamations } = await sb.from("reclamations")
    .select("*, clients(nom)").order("created_at", { ascending: false });
  const ecriture = session?.estAdmin || session?.peut("reclamations.write");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Réclamations</h1>
        {ecriture && (
          <a href="/reclamations/nouvelle"
            className="bg-brand text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-dark">
            + Nouvelle réclamation
          </a>
        )}
      </div>
      <div className="space-y-3">
        {(reclamations as any[] ?? []).map(r => (
          <div key={r.id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex flex-wrap justify-between gap-2 mb-2">
              <p className="font-semibold">{r.sujet}
                <span className="text-gray-400 font-normal text-sm"> · {r.clients?.nom ?? "—"}</span>
              </p>
              <span className={`px-2 py-1 rounded-full text-xs capitalize ${couleursStatut[r.statut]}`}>
                {r.statut.replace("_", " ")}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{r.description}</p>
            {r.resolution && (
              <p className="text-sm bg-emerald-50 text-emerald-800 p-2 rounded-lg">
                Résolution : {r.resolution}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Signalée le {new Date(r.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
        ))}
        {!reclamations?.length && <p className="text-gray-400">Aucune réclamation.</p>}
      </div>
    </div>
  );
}
