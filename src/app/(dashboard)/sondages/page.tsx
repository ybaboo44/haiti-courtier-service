import { supabaseServer } from "@/lib/supabase/server";
import { getSessionUtilisateur } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SondageEnvoi from "@/components/SondageEnvoi";

export default async function SondagesPage() {
  const session = await getSessionUtilisateur();
  if (!session?.peut("affectations.manage")) redirect("/dashboard");

  const sb = supabaseServer();
  const { data: prestations } = await sb.from("prestations")
    .select("id, description, date_prestation, affectations(clients(nom, telephone))")
    .order("date_prestation", { ascending: false });

  const rows = (prestations ?? []).map((p: any) => ({
    id: p.id,
    description: p.description,
    date_prestation: p.date_prestation,
    clients: p.affectations?.clients ?? null,
  }));

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sondages de satisfaction</h1>
        <Link href="/sondages/reponses"
          className="border border-brand text-brand px-4 py-2 rounded-lg text-sm hover:bg-brand-light">
          📬 Voir les réponses
        </Link>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        1️⃣ Générez un lien unique par prestation → 2️⃣ Envoyez-le au client via WhatsApp.
        Chaque lien ne fonctionne qu'une seule fois.
      </p>
      <SondageEnvoi prestations={rows} />
    </div>
  );
}
