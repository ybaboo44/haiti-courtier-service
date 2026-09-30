"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function creerAffectation(formData: FormData) {
  const sb = supabaseServer();
  const { data: affectation, error } = await sb.from("affectations").insert({
    employe_id: formData.get("employe_id") as string,
    client_id: formData.get("client_id") as string,
    date_debut: formData.get("date_debut") as string,
    date_fin: (formData.get("date_fin") as string) || null,
  }).select().single();
  if (error) return { erreur: error.message };

  const description = formData.get("prestation") as string;
  const datePrestation = formData.get("date_prestation") as string;
  if (description && datePrestation) {
    await sb.from("prestations").insert({
      affectation_id: affectation.id,
      description,
      date_prestation: datePrestation,
    });
  }
  revalidatePath("/affectations");
  revalidatePath("/sondages");
  return { succes: true };
}

export async function terminerAffectation(affectationId: string) {
  const sb = supabaseServer();
  await sb.from("affectations")
    .update({ actif: false, date_fin: new Date().toISOString().slice(0, 10) })
    .eq("id", affectationId);
  revalidatePath("/affectations");
}
