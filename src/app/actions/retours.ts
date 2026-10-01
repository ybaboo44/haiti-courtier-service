"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function creerRetour(formData: FormData) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const { error } = await sb.from("retours_clients").insert({
    type_retour: formData.get("type_retour") as string,
    client_id: (formData.get("client_id") as string) || null,
    prestation_id: (formData.get("prestation_id") as string) || null,
    employe_id: (formData.get("employe_id") as string) || null,
    contenu: formData.get("contenu") as string,
    cree_par: user!.id,
  });
  if (error) return { erreur: error.message };
  revalidatePath("/retours");
  revalidatePath("/dashboard");
  return { succes: true };
}

export async function changerStatutRetour(retourId: string, statut: string) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const patch: any = { statut };
  if (statut === "traite") {
    patch.traite_le = new Date().toISOString();
    patch.traite_par = user!.id;
  }
  const { error } = await sb.from("retours_clients").update(patch).eq("id", retourId);
  if (error) return { erreur: error.message };
  revalidatePath("/retours");
  return { succes: true };
}
