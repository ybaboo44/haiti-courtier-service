import { supabaseServer } from "@/lib/supabase/server";
import { getSessionUtilisateur } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import FormAffectation from "@/components/FormAffectation";

export default async function NouvelleAffectationPage() {
  const session = await getSessionUtilisateur();
  if (!session?.peut("affectations.manage")) redirect("/affectations");

  const sb = supabaseServer();
  const [{ data: employes }, { data: clients }] = await Promise.all([
    sb.from("employes").select("id, prenom, nom, poste, disponible").eq("actif", true).order("nom"),
    sb.from("clients").select("id, nom, telephone").order("nom"),
  ]);

  return (
    <div className="max-w-2xl">
      <Link href="/affectations" className="text-sm text-brand hover:underline">← Retour aux affectations</Link>
      <h1 className="text-2xl font-bold text-gray-800 mt-2 mb-6">Nouvelle affectation</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <FormAffectation
          employes={(employes ?? []).map(e => ({ ...e, disponible: !!e.disponible }))}
          clients={(clients ?? []).map(c => ({ ...c, telephone: c.telephone ?? null }))}
        />
      </div>
    </div>
  );
}
