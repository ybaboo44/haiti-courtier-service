"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { creerPrestation } from "@/app/actions/prestations";

const champ = "w-full border rounded-lg p-2.5 text-sm";
const label = "block text-xs font-medium text-gray-500 mb-1";

export default function FormPrestation({ affectations }:
  { affectations: { id: string; label: string }[] }) {
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    const r = await creerPrestation(new FormData(e.currentTarget));
    setChargement(false);
    if (r.erreur) setErreur(r.erreur);
    else router.push("/prestations");
  }

  return (
    <form onSubmit={soumettre} className="space-y-4">
      <div>
        <label className={label}>Affectation (client ← employé) *</label>
        <select name="affectation_id" required className={champ}>
          <option value="">— Choisir —</option>
          {affectations.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>
      </div>
      <div>
        <label className={label}>Description *</label>
        <textarea name="description" required rows={2} className={champ}
          placeholder="Ex : Transport aéroport aller-retour" />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className={label}>Date *</label>
          <input type="date" name="date_prestation" required className={champ}
                 defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div>
          <label className={label}>Statut</label>
          <select name="statut" className={champ} defaultValue="planifiee">
            <option value="planifiee">Planifiée</option>
            <option value="en_cours">En cours</option>
            <option value="terminee">Terminée</option>
            <option value="annulee">Annulée</option>
          </select>
        </div>
        <div>
          <label className={label}>Coût (HTG)</label>
          <input type="number" name="cout" min="0" step="0.01" className={champ} placeholder="0.00" />
        </div>
      </div>
      {erreur && <p className="text-red-600 text-sm">{erreur}</p>}
      <button disabled={chargement}
        className="w-full bg-brand text-white py-2.5 rounded-lg font-medium hover:bg-brand-dark disabled:opacity-60">
        {chargement ? "Enregistrement..." : "Créer la prestation"}
      </button>
    </form>
  );
}
