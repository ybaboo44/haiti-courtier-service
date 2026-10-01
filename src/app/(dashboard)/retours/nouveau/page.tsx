import { supabaseServer } from "@/lib/supabase/server";
import { getSessionUtilisateur } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import FormRetour from "@/components/FormRetour";

export default async function NouveauRetourPage() {
  const session = await getSessionUtilisateur();
  if (!session?.peut("reclamations.write")) redirect("/retours");
  const sb = supabaseServer();
  const [{ data: clients }, { data: employes }, { data: prestations }] = await Promise.all([
    sb.from("clients").select("id, nom").order("nom"),
    sb.from("employes").select("id, prenom, nom").eq("actif", true).order("nom"),
    sb.from("prestations").select("id, description").order("date_prestation", { ascending: false }).limit(100),
  ]);

  return (
    <div className="max-w-xl">
      <Link href="/retours" className="text-sm text-brand hover:underline">← Retour</Link>
      <h1 className="text-2xl font-bold text-gray-800 mt-2 mb-6">Nouveau retour client</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <FormRetour
          clients={(clients ?? []).map(c => ({ id: c.id, nom: c.nom }))}
          employes={(employes ?? []).map(e => ({ id: e.id, nom: `${e.prenom} ${e.nom}` }))}
          prestations={(prestations ?? []).map(p => ({ id: p.id, description: p.description }))}
        />
      </div>
    </div>
  );
}
