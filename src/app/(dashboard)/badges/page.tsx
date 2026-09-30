import { supabaseServer } from "@/lib/supabase/server";
import { getSessionUtilisateur } from "@/lib/auth";
import BadgeCard from "@/components/BadgeCard";
import BadgeGenerator from "@/components/BadgeGenerator";

export default async function BadgesPage() {
  const sb = supabaseServer();
  const session = await getSessionUtilisateur();
  const peutGerer = session?.estAdmin || session?.peut("badges.manage");

  const [{ data: badges }, { data: employes }] = await Promise.all([
    sb.from("badges")
      .select("*, employes(prenom, nom, poste, photo_url, numero_identifiant)")
      .eq("actif", true)
      .order("date_emission", { ascending: false }),
    peutGerer
      ? sb.from("employes").select("id, prenom, nom, poste").eq("actif", true).order("nom")
      : Promise.resolve({ data: [] as any[] }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Badges professionnels</h1>
      {peutGerer && <BadgeGenerator employes={employes ?? []} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(badges ?? []).map(b => <BadgeCard key={b.id} badge={b as any} />)}
        {!badges?.length && <p className="text-gray-400">Aucun badge actif.</p>}
      </div>
    </div>
  );
}
