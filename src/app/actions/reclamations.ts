"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function resoudreReclamation(reclamationId: string, resolution: string) {
  const sb = supabaseServer();
  const { error } = await sb.from("reclamations").update({
    statut: "resolue",
    resolution,
    date_resolution: new Date().toISOString(),
  }).eq("id", reclamationId);
  if (error) return { erreur: error.message };
  revalidatePath("/reclamations");
  return { succes: true };
}
