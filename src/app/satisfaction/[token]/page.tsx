import { supabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SatisfactionForm from "@/components/SatisfactionForm";

export default async function SatisfactionPage({ params }: { params: { token: string } }) {
  const sb = supabaseServer();
  const { data: lien } = await sb
    .from("liens_satisfaction")
    .select("id, utilise, date_expiration, prestations(description, affectations(clients(nom), employes(prenom, nom)))")
    .eq("token", params.token)
    .single();

  if (!lien || lien.utilise) notFound();
  if (lien.date_expiration && new Date(lien.date_expiration) < new Date()) notFound();

  const { data: questions } = await sb
    .from("questions_satisfaction").select("*").eq("actif", true).order("ordre");

  const prest = (lien as any).prestations;
  return (
    <div className="min-h-screen bg-brand-light py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-xl font-bold text-brand mb-1">Évaluation de votre prestation</h1>
        <p className="text-gray-500 text-sm mb-6">
          {prest?.affectations?.clients?.nom} — {prest?.description} —
          merci de prendre quelques instants pour nous évaluer.
        </p>
        <SatisfactionForm lienId={lien.id} questions={questions ?? []} />
      </div>
    </div>
  );
}
