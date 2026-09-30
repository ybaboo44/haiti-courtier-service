"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { changerRoleUtilisateur, basculerActifUtilisateur } from "@/app/actions/utilisateurs";

export default function ActionsUtilisateur({ profilId, actif, roleActuel, roles, estMoi }:
  { profilId: string; actif: boolean; roleActuel: string;
    roles: { code: string }[]; estMoi: boolean }) {
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function changerRole(e: React.ChangeEvent<HTMLSelectElement>) {
    setChargement(true);
    await changerRoleUtilisateur(profilId, e.target.value);
    setChargement(false);
    router.refresh();
  }

  async function basculer() {
    if (estMoi) return alert("Vous ne pouvez pas désactiver votre propre compte.");
    if (!confirm(actif ? "Désactiver ce compte ?" : "Réactiver ce compte ?")) return;
    setChargement(true);
    await basculerActifUtilisateur(profilId, !actif);
    setChargement(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select value={roleActuel} onChange={changerRole} disabled={chargement || estMoi}
        className="border rounded-lg px-2 py-1 text-xs capitalize disabled:opacity-50">
        {roles.map(r => <option key={r.code} value={r.code}>{r.code}</option>)}
      </select>
      <button onClick={basculer} disabled={chargement || estMoi}
        className={`px-2.5 py-1 rounded-lg text-xs disabled:opacity-40
          ${actif ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}>
        {actif ? "Désactiver" : "Activer"}
      </button>
    </div>
  );
}
