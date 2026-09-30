"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function creerBadge(employeId: string) {
  const sb = supabaseServer();
  const annee = new Date().getFullYear();
  const { count } = await sb.from("badges")
    .select("id", { count: "exact", head: true });
  const numero = `HCS-B-${annee}-${String((count ?? 0) + 1).padStart(4, "0")}`;

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { data, error } = await sb.from("badges").insert({
    employe_id: employeId,
    numero_badge: numero,
    qr_code_url: `${base}/verification/${numero}`,
  }).select().single();

  if (error) return { erreur: error.message };
  revalidatePath("/badges");
  return { succes: true, badge: data };
}

export async function desactiverBadge(badgeId: string) {
  const sb = supabaseServer();
  await sb.from("badges").update({ actif: false }).eq("id", badgeId);
  revalidatePath("/badges");
}
