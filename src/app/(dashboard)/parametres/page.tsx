import { getSessionUtilisateur } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ParametresPage() {
  const session = await getSessionUtilisateur();
  if (!session?.estAdmin) redirect("/dashboard");

  const items = [
    { href: "/utilisateurs", titre: "👥 Utilisateurs & rôles", desc: "Créer des comptes, assigner les rôles, activer/désactiver" },
    { href: "/distinctions", titre: "🏅 Catalogue de distinctions", desc: "Gérer les badges récompenses et leurs attributions" },
    { href: "/sondages", titre: "📋 Sondages", desc: "Créer, publier, dupliquer les sondages de satisfaction" },
    { href: "/satisfaction", titre: "⭐ Analyse de satisfaction", desc: "Statistiques, filtres et évolution de la satisfaction" },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Paramètres</h1>
      <p className="text-sm text-gray-500 mb-6">
        Application v2.0 · Supabase : <code className="text-xs">{process.env.NEXT_PUBLIC_SUPABASE_URL}</code>
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map(i => (
          <Link key={i.href} href={i.href}
            className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition block">
            <p className="font-semibold text-gray-800">{i.titre}</p>
            <p className="text-sm text-gray-500 mt-1">{i.desc}</p>
          </Link>
        ))}
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 text-sm text-amber-800">
        ⚠️ Après avoir exécuté <code>supabase/migration_v2.sql</code>, vérifiez que les nouvelles tables
        (distinctions, retours, sondages) apparaissent dans Supabase → Table Editor.
      </div>
    </div>
  );
}
