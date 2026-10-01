"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { changerStatutPrestation } from "@/app/actions/prestations";

const statuts = [
  { code: "planifiee", label: "Planifiée" },
  { code: "en_cours", label: "En cours" },
  { code: "terminee", label: "Terminée" },
  { code: "annulee", label: "Annulée" },
];

const couleurs: Record<string, string> = {
  planifiee: "bg-blue-50 text-blue-700 border-blue-200",
  en_cours: "bg-amber-50 text-amber-700 border-amber-200",
  terminee: "bg-emerald-50 text-emerald-700 border-emerald-200",
  annulee: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function ActionsPrestation({ prestationId, statutActuel, peutModifier }:
  { prestationId: string; statutActuel: string; peutModifier: boolean }) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);

  async function changer(e: React.ChangeEvent<HTMLSelectElement>) {
    setChargement(true);
    await changerStatutPrestation(prestationId, e.target.value);
    setChargement(false);
    router.refresh();
  }

  if (!peutModifier)
    return <span className={`px-2.5 py-1 rounded-full text-xs capitalize border ${couleurs[statutActuel]}`}>{statutActuel.replace("_", " ")}</span>;

  return (
    <select value={statutActuel} onChange={changer} disabled={chargement}
      className={`border rounded-lg px-2 py-1 text-xs capitalize ${couleurs[statutActuel]}`}>
      {statuts.map(s => <option key={s.code} value={s.code}>{s.label}</option>)}
    </select>
  );
}
