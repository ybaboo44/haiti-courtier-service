import { supabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProfilEmploye from "@/components/ProfilEmploye";

export default async function EmployeDetailPage({ params }: { params: { id: string } }) {
  const sb = supabaseServer();
  const { data: emp } = await sb.from("employes").select("*").eq("id", params.id).single();
  if (!emp) notFound();

  const [{ data: affectations }, { data: badgesPhysiques }, { data: distinctions }, { data: retours }] =
    await Promise.all([
      sb.from("affectations")
        .select("id, date_debut, date_fin, responsable, clients(nom), prestations(id, description, date_prestation, statut)")
        .eq("employe_id", emp.id).order("date_debut", { ascending: false }),
      sb.from("badges").select("*").eq("employe_id", emp.id)
        .order("date_emission", { ascending: false }),
      sb.from("employe_badges")
        .select("*, type_badges(nom, icone, couleur)")
        .eq("employe_id", emp.id).order("date_attribution", { ascending: false }),
      sb.from("retours_clients")
        .select("*, clients(nom), prestations(description)")
        .eq("employe_id", emp.id).order("created_at", { ascending: false }),
    ]);

  return (
    <div className="max-w-4xl">
      <Link href="/employes" className="text-sm text-brand hover:underline">← Retour aux employés</Link>
      <div className="mt-3">
        <ProfilEmploye
          emp={emp}
          affectations={(affectations ?? []) as any}
          badgesPhysiques={(badgesPhysiques ?? []) as any}
          distinctions={(distinctions ?? []) as any}
          retours={(retours ?? []) as any}
        />
      </div>
    </div>
  );
}
