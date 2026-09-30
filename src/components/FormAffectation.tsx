"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { creerAffectation } from "@/app/actions/affectations";

type Emp = { id: string; prenom: string; nom: string; poste: string; disponible: boolean };
type Cli = { id: string; nom: string; telephone: string | null };

const champ = "w-full border rounded-lg p-2.5 text-sm";
const label = "block text-xs font-medium text-gray-500 mb-1";

export default function FormAffectation({ employes, clients }: { employes: Emp[]; clients: Cli[] }) {
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    const r = await creerAffectation(new FormData(e.currentTarget));
    setChargement(false);
    if (r.erreur) setErreur(r.erreur);
    else router.push("/affectations");
  }

  return (
    <form onSubmit={soumettre} className="space-y-4">
      <div>
        <label className={label}>Employé *</label>
        <select name="employe_id" required className={champ}>
          <option value="">— Choisir —</option>
          {employes.map(e => (
            <option key={e.id} value={e.id}>
              {e.prenom} {e.nom} · {e.poste}{e.disponible ? "" : " (indisponible)"}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={label}>Client *</label>
        <select name="client_id" required className={champ}>
          <option value="">— Choisir —</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Date de début *</label>
          <input type="date" name="date_debut" required className={champ}
                 defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div>
          <label className={label}>Date de fin (optionnel)</label>
          <input type="date" name="date_fin" className={champ} />
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-xs font-medium text-gray-500 mb-3">PREMIÈRE PRESTATION (optionnel)</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Description</label>
            <input name="prestation" placeholder="Ex : Transport aéroport" className={champ} />
          </div>
          <div>
            <label className={label}>Date de la prestation</label>
            <input type="date" name="date_prestation" className={champ} />
          </div>
        </div>
      </div>

      {erreur && <p className="text-red-600 text-sm">{erreur}</p>}
      <button disabled={chargement}
        className="w-full bg-brand text-white py-2.5 rounded-lg font-medium hover:bg-brand-dark disabled:opacity-60">
        {chargement ? "Enregistrement..." : "Créer l'affectation"}
      </button>
    </form>
  );
}
