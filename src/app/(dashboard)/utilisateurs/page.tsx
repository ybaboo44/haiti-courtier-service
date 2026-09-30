import { supabaseServer } from "@/lib/supabase/server";
import { getSessionUtilisateur } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ActionsUtilisateur from "@/components/ActionsUtilisateur";

export default async function UtilisateursPage() {
  const session = await getSessionUtilisateur();
  if (!session?.estAdmin) redirect("/dashboard");

  const sb = supabaseServer();
  const [{ data: profils }, { data: roles }, { data: permissions }] = await Promise.all([
    sb.from("profils").select("*, roles(code)").order("nom_complet"),
    sb.from("roles").select("*"),
    sb.from("permissions").select("*").order("code"),
  ]);

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Utilisateurs & rôles</h1>
        <Link href="/utilisateurs/nouveau"
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-dark">
          + Nouvel utilisateur
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Nom</th>
              <th className="text-left p-3">Utilisateur</th>
              <th className="text-left p-3">Rôle</th>
              <th className="text-left p-3">Statut</th>
              <th className="text-left p-3">Actions</th>
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
                <td className="p-3">
                  <ActionsUtilisateur
                    profilId={p.id}
                    actif={p.actif}
                    roleActuel={(p as any).roles?.code ?? "agent"}
                    roles={(roles ?? []).map(r => ({ code: r.code as string }))}
                    estMoi={p.id === session.user.id}
                  />
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
