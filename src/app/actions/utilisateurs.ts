"use server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function exigerAdmin() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false as const };
  const { data: profil } = await sb.from("profils")
    .select("*, roles(code)").eq("id", user.id).single();
  return { ok: profil?.roles?.code === "admin", sb };
}

// Création d'un compte (auth.users) + profil avec rôle — nécessite SUPABASE_SERVICE_ROLE_KEY
export async function creerUtilisateur(formData: FormData) {
  const auth = await exigerAdmin();
  if (!auth.ok) return { erreur: "Accès refusé (admin requis)" };

  const nomUtilisateur = (formData.get("nom_utilisateur") as string).trim().toLowerCase().replace(/\s/g, "");
  const motDePasse = formData.get("mot_de_passe") as string;
  if (motDePasse.length < 6) return { erreur: "Le mot de passe doit contenir au moins 6 caractères" };

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await admin.auth.admin.createUser({
    email: `${nomUtilisateur}@hcs.local`,
    password: motDePasse,
    email_confirm: true,
    user_metadata: {
      nom_utilisateur: nomUtilisateur,
      nom_complet: formData.get("nom_complet") as string,
      role: formData.get("role") as string,
    },
  });
  if (error) return { erreur: error.message === "User already registered"
    ? "Ce nom d'utilisateur existe déjà" : error.message };

  revalidatePath("/utilisateurs");
  return { succes: true };
}

export async function changerRoleUtilisateur(profilId: string, roleCode: string) {
  const auth = await exigerAdmin();
  if (!auth.ok) return { erreur: "Accès refusé" };
  const { data: role } = await auth.sb.from("roles").select("id").eq("code", roleCode).single();
  if (!role) return { erreur: "Rôle introuvable" };
  await auth.sb.from("profils").update({ role_id: role.id }).eq("id", profilId);
  revalidatePath("/utilisateurs");
  return { succes: true };
}

export async function basculerActifUtilisateur(profilId: string, actif: boolean) {
  const auth = await exigerAdmin();
  if (!auth.ok) return { erreur: "Accès refusé" };
  await auth.sb.from("profils").update({ actif }).eq("id", profilId);
  revalidatePath("/utilisateurs");
  return { succes: true };
}
