import { supabaseServer } from "@/lib/supabase/server";
import { getSessionUtilisateur } from "@/lib/auth";
import { Employe } from "@/lib/types";
import Link from "next/link";

export default async function EmployesPage() {
  const sb = supabaseServer();
  const session = await getSessionUtilisateur();
  const { data: employes } = await sb.from("employes").select("*").order("nom");
  const ecriture = session?.estAdmin || session?.peut("employes.write");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Employés</h1>
        {ecriture && (
          <Link href="/employes/nouveau"
            className="bg-brand text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-dark">
            + Nouvel employé
          </Link>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Identifiant</th>
              <th className="text-left p-3">Nom</th>
              <th className="text-left p-3">Poste</th>
              <th className="text-left p-3">Téléphone</th>
              <th className="text-left p-3">Disponible</th>
              <th className="text-left p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(employes as Employe[] ?? []).map(e => (
              <tr key={e.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono text-xs">{e.numero_identifiant}</td>
                <td className="p-3 font-medium">{e.prenom} {e.nom}</td>
                <td className="p-3">{e.poste}</td>
                <td className="p-3">{e.telephone ?? "—"}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${e.disponible ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {e.disponible ? "Oui" : "Non"}
                  </span>
                </td>
                <td className="p-3">
                  <Link href={`/employes/${e.id}`} className="text-brand hover:underline text-xs">Détails</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
