"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { creerUtilisateur } from "@/app/actions/utilisateurs";

const roles = [
  { code: "admin", label: "Administrateur (tous les droits)" },
  { code: "gestionnaire", label: "Gestionnaire (opérations complètes)" },
  { code: "agent", label: "Agent (lecture + réclamations)" },
  { code: "lecteur", label: "Lecteur (consultation seule)" },
];

const champ = "w-full border rounded-lg p-2.5 text-sm";
const label = "block text-xs font-medium text-gray-500 mb-1";

export default function FormUtilisateur() {
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    const r = await creerUtilisateur(new FormData(e.currentTarget));
    setChargement(false);
    if (r.erreur) setErreur(r.erreur);
    else router.push("/utilisateurs");
  }

  return (
    <form onSubmit={soumettre} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Nom complet *</label>
          <input name="nom_complet" required className={champ} placeholder="Ex : Marie Dupont" />
        </div>
        <div>
          <label className={label}>Nom d'utilisateur (connexion) *</label>
          <input name="nom_utilisateur" required className={champ} placeholder="Ex : marie.dupont" />
        </div>
      </div>
      <div>
        <label className={label}>Mot de passe * (min. 6 caractères)</label>
        <input type="password" name="mot_de_passe" required minLength={6} className={champ} />
      </div>
      <div>
        <label className={label}>Rôle *</label>
        <select name="role" required className={champ} defaultValue="agent">
          {roles.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
        </select>
        <p className="text-xs text-gray-400 mt-1">
          L'utilisateur pourra se connecter immédiatement avec son nom d'utilisateur et ce mot de passe.
        </p>
      </div>
      {erreur && <p className="text-red-600 text-sm">{erreur}</p>}
      <button disabled={chargement}
        className="w-full bg-brand text-white py-2.5 rounded-lg font-medium hover:bg-brand-dark disabled:opacity-60">
        {chargement ? "Création..." : "Créer le compte"}
      </button>
    </form>
  );
}
