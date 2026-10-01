"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function creerPrestation(formData: FormData) {
  const sb = supabaseServer();
  const { error } = await sb.from("prestations").insert({
    affectation_id: formData.get("affectation_id") as string,
    description: formData.get("description") as string,
    date_prestation: formData.get("date_prestation") as string,
    statut: (formData.get("statut") as string) || "planifiee",
    cout: formData.get("cout") ? Number(formData.get("cout")) : null,
  });
  if (error) return { erreur: error.message };
  revalidatePath("/prestations");
  revalidatePath("/sondages");
  return { succes: true };
}

export async function changerStatutPrestation(prestationId: string, statut: string) {
  const sb = supabaseServer();
  const { error } = await sb.from("prestations").update({ statut }).eq("id", prestationId);
  if (error) return { erreur: error.message };
  revalidatePath("/prestations");
  return { succes: true };
}
