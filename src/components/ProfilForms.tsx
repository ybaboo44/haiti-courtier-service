"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ProfilForms({ nomComplet, nomUtilisateur }:
  { nomComplet: string; nomUtilisateur: string }) {
  const [msgInfos, setMsgInfos] = useState("");
  const [msgMdp, setMsgMdp] = useState("");
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function majInfos(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    const fd = new FormData(e.currentTarget);
    const sb = supabaseBrowser();
    const { error } = await sb.from("profils")
      .update({ nom_complet: fd.get("nom_complet") as string })
      .eq("id", (await sb.auth.getUser()).data.user!.id);
    setChargement(false);
    setMsgInfos(error ? "❌ " + error.message : "✅ Informations mises à jour");
    router.refresh();
  }

  async function changerMdp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    const fd = new FormData(e.currentTarget);
    if (fd.get("nouveau") !== fd.get("confirmation")) {
      setChargement(false);
      setMsgMdp("❌ Les mots de passe ne correspondent pas");
      return;
    }
    const sb = supabaseBrowser();
    const { error } = await sb.auth.updateUser({ password: fd.get("nouveau") as string });
    setChargement(false);
    setMsgMdp(error ? "❌ " + error.message : "✅ Mot de passe modifié");
    (e.target as HTMLFormElement).reset();
  }

  const champ = "w-full border rounded-lg p-2.5 text-sm";
  const label = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={majInfos} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Mes informations</h2>
        <div>
          <label className={label}>Nom d'utilisateur (non modifiable)</label>
          <input value={nomUtilisateur} disabled className={`${champ} bg-gray-50 text-gray-400`} />
        </div>
        <div>
          <label className={label}>Nom complet</label>
          <input name="nom_complet" defaultValue={nomComplet} required className={champ} />
        </div>
        {msgInfos && <p className="text-sm">{msgInfos}</p>}
        <button disabled={chargement}
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-dark disabled:opacity-60">
          Enregistrer
        </button>
      </form>

      <form onSubmit={changerMdp} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Changer mon mot de passe</h2>
        <div>
          <label className={label}>Nouveau mot de passe</label>
          <input type="password" name="nouveau" required minLength={6} className={champ} />
        </div>
        <div>
          <label className={label}>Confirmer le mot de passe</label>
          <input type="password" name="confirmation" required minLength={6} className={champ} />
        </div>
        {msgMdp && <p className="text-sm">{msgMdp}</p>}
        <button disabled={chargement}
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-dark disabled:opacity-60">
          Modifier le mot de passe
        </button>
      </form>
    </div>
  );
}
