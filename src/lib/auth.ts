import { supabaseServer } from "./supabase/server";

export async function getSessionUtilisateur() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profil } = await supabase
    .from("profils").select("*, roles(code)").eq("id", user.id).single();
  if (!profil || !profil.actif) return null;

  const estAdmin = profil.roles?.code === "admin";
  const { data: tous } = await supabase.from("permissions").select("id, code");
  const extra = new Set<string>(profil.permissions_extra ?? []);
  const retirees = new Set<string>(profil.permissions_retirees ?? []);
  const permissions = (tous ?? [])
    .filter(p => extra.has(p.id) && !retirees.has(p.id))
    .map(p => p.code);

  return {
    user,
    profil,
    permissions,
    estAdmin,
    peut: (code: string) => estAdmin || permissions.includes(code),
  };
}

export function aAcces(peut: (c: string) => boolean, code: string) {
  return peut(code);
}
