"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function creerTypeBadge(formData: FormData) {
  const sb = supabaseServer();
  const { error } = await sb.from("type_badges").insert({
    nom: formData.get("nom") as string,
    description: formData.get("description") as string,
    icone: (formData.get("icone") as string) || "🏅",
    couleur: (formData.get("couleur") as string) || "#0E5FA8",
  });
  if (error) return { erreur: error.message === "duplicate key value violates unique constraint \"type_badges_nom_key\""
    ? "Ce nom de badge existe déjà" : error.message };
  revalidatePath("/distinctions");
  return { succes: true };
}

export async function basculerTypeBadge(typeBadgeId: string, actif: boolean) {
  const sb = supabaseServer();
  await sb.from("type_badges").update({ actif }).eq("id", typeBadgeId);
  revalidatePath("/distinctions");
}

export async function attribuerBadge(formData: FormData) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const { error } = await sb.from("employe_badges").insert({
    employe_id: formData.get("employe_id") as string,
    type_badge_id: formData.get("type_badge_id") as string,
    note: (formData.get("note") as string) || null,
    attribue_par: user!.id,
  });
  if (error) return { erreur: error.message.includes("unique")
    ? "Ce badge est déjà attribué à cet employé aujourd'hui" : error.message };
  revalidatePath("/distinctions");
  revalidatePath("/employes");
  return { succes: true };
}

export async function retirerBadge(employeBadgeId: string) {
  const sb = supabaseServer();
  await sb.from("employe_badges").delete().eq("id", employeBadgeId);
  revalidatePath("/distinctions");
}
