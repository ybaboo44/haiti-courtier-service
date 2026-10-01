"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { creerSondage } from "@/app/actions/sondages";

const champ = "w-full border rounded-lg p-2.5 text-sm";
const label = "block text-xs font-medium text-gray-500 mb-1";

export default function FormSondage() {
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    const r = await creerSondage(new FormData(e.currentTarget));
    setChargement(false);
    if (r.erreur) setErreur(r.erreur);
    else { (e.target as HTMLFormElement).reset(); router.refresh(); }
  }

  return (
    <form onSubmit={soumettre} className="space-y-3">
      <div>
        <label className={label}>Titre *</label>
        <input name="titre" required className={champ} placeholder="Ex : Sondage satisfaction Q4 2026" />
      </div>
      <div>
        <label className={label}>Description</label>
        <textarea name="description" rows={3} className={champ}
          placeholder="Contexte, objectif du sondage..." />
      </div>
      {erreur && <p className="text-red-600 text-sm">{erreur}</p>}
      <button disabled={chargement}
        className="w-full bg-brand text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-60">
        {chargement ? "..." : "Créer le sondage"}
      </button>
    </form>
  );
}
