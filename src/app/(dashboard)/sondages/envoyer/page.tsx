import { supabaseServer } from "@/lib/supabase/server";
import { getSessionUtilisateur } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SondageEnvoi from "@/components/SondageEnvoi";

export default async function EnvoyerSondagePage() {
  const session = await getSessionUtilisateur();
  if (!session?.peut("affectations.manage")) redirect("/dashboard");

  const sb = supabaseServer();
  const [{ data: prestations }, { data: sondages }] = await Promise.all([
    sb.from("prestations")
      .select("id, description, date_prestation, affectations(clients(nom, telephone))")
      .order("date_prestation", { ascending: false }),
    sb.from("sondages").select("id, titre, statut")
      .neq("statut", "desactive").order("created_at", { ascending: false }),
  ]);

  const rows = (prestations ?? []).map((p: any) => ({
    id: p.id,
    description: p.description,
    date_prestation: p.date_prestation,
    clients: p.affectations?.clients ?? null,
  }));

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Envoyer un sondage</h1>
        <Link href="/sondages" className="text-sm text-brand hover:underline">← Gérer les sondages</Link>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        1️⃣ Générez un lien unique → 2️⃣ WhatsApp s'ouvre avec un message pré-rempli (nom du client,
        prestation, lien). Chaque lien ne fonctionne qu'une seule fois.
      </p>
      <SondageEnvoi prestations={rows} sondages={(sondages ?? []) as any} />
    </div>
  );
}
