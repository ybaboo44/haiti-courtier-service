"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { changerStatutRetour } from "@/app/actions/retours";

const transitions: Record<string, { code: string; label: string }[]> = {
  nouveau: [{ code: "en_cours", label: "Prendre en charge" }, { code: "archive", label: "Archiver" }],
  en_cours: [{ code: "traite", label: "Marquer traité" }, { code: "archive", label: "Archiver" }],
  traite: [{ code: "archive", label: "Archiver" }],
  archive: [{ code: "nouveau", label: "Rouvrir" }],
};

export default function ActionsRetour({ retourId, statut, peutModifier }:
  { retourId: string; statut: string; peutModifier: boolean }) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  if (!peutModifier) return null;

  async function agir(code: string) {
    setChargement(true);
    await changerStatutRetour(retourId, code);
    setChargement(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      {(transitions[statut] ?? []).map(t => (
        <button key={t.code} onClick={() => agir(t.code)} disabled={chargement}
          className={`px-3 py-1.5 rounded-lg text-xs disabled:opacity-50
            ${t.code === "traite" ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : t.code === "en_cours" ? "bg-amber-500 text-white hover:bg-amber-600"
              : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
