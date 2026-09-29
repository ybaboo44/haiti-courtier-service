import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function UtilisateursPage() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const { data: moi } = await sb.from("profils")
    .select("*, roles(code)").eq("id", user!.id).single();
  if (moi?.roles?.code !== "admin") redirect("/dashboard");

  const { data: profils } = await sb.from("profils")
    .select("*, roles(code)").order("nom_complet");
  const { data: roles } = await sb.from("roles").select("*");
  const { data: permissions } = await sb.from("permissions").select("*").order("code");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Utilisateurs & permissions</h1>
      <p className="text-sm text-gray-500 mb-6">
        Les comptes se créent dans Supabase → Authentication. L'admin a tous les droits ;
        les permissions individuelles (ajout/retirer) se gèrent via la table <code>profils</code>.
      </p>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Nom</th>
              <th className="text-left p-3">Utilisateur</th>
              <th className="text-left p-3">Rôle</th>
              <th className="text-left p-3">Statut</th>
              <th className="text-left p-3">Permissions individuelles</th>
            </tr>
          </thead>
          <tbody>
            {(profils ?? []).map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{p.nom_complet}</td>
                <td className="p-3 font-mono text-xs">{p.nom_utilisateur}</td>
                <td className="p-3 capitalize">{(p as any).roles?.code}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${p.actif ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.actif ? "Actif" : "Désactivé"}
                  </span>
                </td>
                <td className="p-3 text-xs text-gray-500">
                  +{p.permissions_extra?.length ?? 0} / −{p.permissions_retirees?.length ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="font-semibold text-gray-800 mb-3">Référence des permissions</h2>
      <div className="bg-white rounded-xl shadow-sm p-5">
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {(permissions ?? []).map(p => (
            <li key={p.id} className="flex justify-between border-b py-1.5">
              <span>{p.libelle}</span>
              <code className="text-xs text-gray-400">{p.code}</code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
