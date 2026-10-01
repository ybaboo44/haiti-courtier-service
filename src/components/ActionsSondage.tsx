"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { changerStatutSondage, dupliquerSondage } from "@/app/actions/sondages";

export default function ActionsSondage({ sondageId, statut }:
  { sondageId: string; statut: string }) {
  const router = useRouter();
  const [chargement, setChargement] = useState(false);

  async function agir(fn: () => Promise<any>) {
    setChargement(true);
    await fn();
    setChargement(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {statut !== "publie" && (
        <button onClick={() => agir(() => changerStatutSondage(sondageId, "publie"))} disabled={chargement}
          className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-600 disabled:opacity-50">
          Publier
        </button>
      )}
      {statut === "publie" && (
        <button onClick={() => agir(() => changerStatutSondage(sondageId, "desactive"))} disabled={chargement}
          className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-100 disabled:opacity-50">
          Désactiver
        </button>
      )}
      {statut === "desactive" && (
        <button onClick={() => agir(() => changerStatutSondage(sondageId, "brouillon"))} disabled={chargement}
          className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50 disabled:opacity-50">
          Remettre en brouillon
        </button>
      )}
      <button onClick={() => agir(() => dupliquerSondage(sondageId))} disabled={chargement}
        className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50 disabled:opacity-50">
        Dupliquer
      </button>
    </div>
  );
}
