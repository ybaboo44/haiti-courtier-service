import { supabaseServer } from "@/lib/supabase/server";
import BadgeCard from "@/components/BadgeCard";

export default async function BadgesPage() {
  const sb = supabaseServer();
  const { data: badges } = await sb
    .from("badges")
    .select("*, employes(prenom, nom, poste, photo_url, numero_identifiant)")
    .eq("actif", true)
    .order("date_emission", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Badges professionnels</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(badges ?? []).map(b => (
          <BadgeCard key={b.id} badge={b as any} />
        ))}
        {!badges?.length && <p className="text-gray-400">Aucun badge actif.</p>}
      </div>
    </div>
  );
}
