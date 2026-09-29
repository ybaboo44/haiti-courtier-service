import { supabaseServer } from "@/lib/supabase/server";
import { getSessionUtilisateur } from "@/lib/auth";
import { Client } from "@/lib/types";

export default async function ClientsPage() {
  const sb = supabaseServer();
  const session = await getSessionUtilisateur();
  const { data: clients } = await sb.from("clients").select("*").order("nom");
  const ecriture = session?.estAdmin || session?.peut("clients.write");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
        {ecriture && (
          <a href="/clients/nouveau"
            className="bg-brand text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-dark">
            + Nouveau client
          </a>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Nom</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Contact</th>
              <th className="text-left p-3">Téléphone</th>
              <th className="text-left p-3">E-mail</th>
            </tr>
          </thead>
          <tbody>
            {(clients as Client[] ?? []).map(c => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{c.nom}</td>
                <td className="p-3 capitalize">{c.type_client}</td>
                <td className="p-3">{c.contact_nom ?? "—"}</td>
                <td className="p-3">{c.telephone}</td>
                <td className="p-3">{c.email ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
