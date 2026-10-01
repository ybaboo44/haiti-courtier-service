import { supabaseServer } from "@/lib/supabase/server";
import { getSessionUtilisateur } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import FormPrestation from "@/components/FormPrestation";

export default async function NouvellePrestationPage() {
  const session = await getSessionUtilisateur();
  if (!session?.peut("affectations.manage")) redirect("/prestations");
  const sb = supabaseServer();
  const { data: affectations } = await sb.from("affectations")
    .select("id, employes(prenom, nom), clients(nom)").eq("actif", true);

  return (
    <div className="max-w-xl">
      <Link href="/prestations" className="text-sm text-brand hover:underline">← Retour</Link>
      <h1 className="text-2xl font-bold text-gray-800 mt-2 mb-6">Nouvelle prestation</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <FormPrestation affectations={(affectations ?? []).map((a: any) => ({
          id: a.id,
          label: `${a.clients?.nom} ← ${a.employes?.prenom} ${a.employes?.nom}`,
        }))} />
      </div>
    </div>
  );
}
