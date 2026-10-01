"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function creerSondage(formData: FormData) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const { error } = await sb.from("sondages").insert({
    titre: formData.get("titre") as string,
    description: formData.get("description") as string,
    cree_par: user!.id,
  });
  if (error) return { erreur: error.message };
  revalidatePath("/sondages");
  return { succes: true };
}

export async function changerStatutSondage(sondageId: string, statut: string) {
  const sb = supabaseServer();
  const { error } = await sb.from("sondages").update({ statut }).eq("id", sondageId);
  if (error) return { erreur: error.message };
  revalidatePath("/sondages");
  return { succes: true };
}

export async function dupliquerSondage(sondageId: string) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const { data: original } = await sb.from("sondages").select("*").eq("id", sondageId).single();
  if (!original) return { erreur: "Sondage introuvable" };
  const { error } = await sb.from("sondages").insert({
    titre: `${original.titre} (copie)`,
    description: original.description,
    cree_par: user!.id,
  });
  if (error) return { erreur: error.message };
  revalidatePath("/sondages");
  return { succes: true };
}
