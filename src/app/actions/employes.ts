"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function creerEmploye(formData: FormData) {
  const sb = supabaseServer();
  const { error } = await sb.from("employes").insert({
    prenom: formData.get("prenom") as string,
    nom: formData.get("nom") as string,
    poste: formData.get("poste") as string,
    telephone: formData.get("telephone") as string,
    email: formData.get("email") as string,
    adresse: formData.get("adresse") as string,
    numero_identifiant: formData.get("numero_identifiant") as string,
    date_embauche: formData.get("date_embauche") as string,
    notes: formData.get("notes") as string,
  });
  if (error) return { erreur: error.message };
  revalidatePath("/employes");
  return { succes: true };
}

export async function changerDisponibilite(employeId: string, disponible: boolean) {
  const sb = supabaseServer();
  await sb.from("employes").update({ disponible }).eq("id", employeId);
  revalidatePath("/employes");
}
