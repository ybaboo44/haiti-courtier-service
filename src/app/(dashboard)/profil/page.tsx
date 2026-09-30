import { getSessionUtilisateur } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfilForms from "@/components/ProfilForms";

export default async function ProfilPage() {
  const session = await getSessionUtilisateur();
  if (!session) redirect("/login");

  const sb = supabaseServer();
  const { data: rolePerms } = await sb
    .from("role_permissions")
    .select("permission_id")
    .eq("role_id", session.profil.role_id);
  const { data: tous } = await sb.from("permissions").select("id, code, libelle");
  const roleIds = new Set((rolePerms ?? []).map(r => r.permission_id));
  const extra = new Set(session.profil.permissions_extra ?? []);
  const ret = new Set(session.profil.permissions_retirees ?? []);
  const permsRole = (tous ?? []).filter(p => roleIds.has(p.id));
  const permsEffectives = (tous ?? []).filter(p =>
    (roleIds.has(p.id) || extra.has(p.id)) && !ret.has(p.id));

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mon profil</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center text-brand font-bold text-2xl">
          {session.profil.nom_complet.split(" ").map((m: string) => m[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-lg text-gray-800">{session.profil.nom_complet}</p>
          <p className="text-gray-500 text-sm">
            @{session.profil.nom_utilisateur} · <span className="capitalize">{session.profil.roles?.code}</span>
            {session.estAdmin && " · ⭐ tous droits"}
          </p>
        </div>
      </div>

      <ProfilForms
        nomComplet={session.profil.nom_complet}
        nomUtilisateur={session.profil.nom_utilisateur}
      />

      <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
        <h2 className="font-semibold text-gray-800 mb-3">Mes permissions ({permsEffectives.length})</h2>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {permsEffectives.map(p => (
            <li key={p.id} className="flex justify-between border-b py-1.5">
              <span>{(p as any).libelle}</span>
              <code className="text-xs text-gray-400">{p.code}</code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
