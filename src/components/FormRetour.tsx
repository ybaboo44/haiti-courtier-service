"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { creerRetour } from "@/app/actions/retours";

const champ = "w-full border rounded-lg p-2.5 text-sm";
const label = "block text-xs font-medium text-gray-500 mb-1";

export default function FormRetour({ clients, employes, prestations }:
  { clients: { id: string; nom: string }[]; employes: { id: string; nom: string }[];
    prestations: { id: string; description: string }[] }) {
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    const r = await creerRetour(new FormData(e.currentTarget));
    setChargement(false);
    if (r.erreur) setErreur(r.erreur);
    else router.push("/retours");
  }

  return (
    <form onSubmit={soumettre} className="space-y-4">
      <div>
        <label className={label}>Type de retour *</label>
        <select name="type_retour" required className={champ} defaultValue="positif">
          <option value="positif">😊 Avis positif</option>
          <option value="neutre">😐 Avis neutre</option>
          <option value="negatif">😞 Avis négatif</option>
          <option value="reclamation">⚠️ Réclamation</option>
          <option value="suggestion">💡 Suggestion</option>
        </select>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Client</label>
          <select name="client_id" className={champ}>
            <option value="">—</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Employé concerné</label>
          <select name="employe_id" className={champ}>
            <option value="">—</option>
            {employes.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={label}>Prestation associée</label>
        <select name="prestation_id" className={champ}>
          <option value="">—</option>
          {prestations.map(p => <option key={p.id} value={p.id}>{p.description}</option>)}
        </select>
      </div>
      <div>
        <label className={label}>Contenu *</label>
        <textarea name="contenu" required rows={4} className={champ}
          placeholder="Verbatim du client, résumé de l'appel..." />
      </div>
      {erreur && <p className="text-red-600 text-sm">{erreur}</p>}
      <button disabled={chargement}
        className="w-full bg-brand text-white py-2.5 rounded-lg font-medium hover:bg-brand-dark disabled:opacity-60">
        {chargement ? "Enregistrement..." : "Enregistrer le retour"}
      </button>
    </form>
  );
}
