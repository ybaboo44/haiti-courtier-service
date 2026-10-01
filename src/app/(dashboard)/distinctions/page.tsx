import { supabaseServer } from "@/lib/supabase/server";
import { getSessionUtilisateur } from "@/lib/auth";
import { redirect } from "next/navigation";
import GestionDistinctions from "@/components/GestionDistinctions";

export default async function DistinctionsPage() {
  const session = await getSessionUtilisateur();
  if (!session?.peut("badges.manage")) redirect("/dashboard");

  const sb = supabaseServer();
  const [{ data: types }, { data: employes }, { data: attributions }] = await Promise.all([
    sb.from("type_badges").select("*").order("nom"),
    sb.from("employes").select("id, prenom, nom").eq("actif", true).order("nom"),
    sb.from("employe_badges")
      .select("*, employes(prenom, nom), type_badges(nom, icone, couleur)")
      .order("date_attribution", { ascending: false }).limit(50),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Distinctions & récompenses</h1>
      <GestionDistinctions
        types={(types ?? []).map(t => ({ ...t, description: t.description ?? null }))}
        employes={(employes ?? []).map(e => ({ ...e }))}
        attributions={(attributions ?? []) as any}
      />
    </div>
  );
}
