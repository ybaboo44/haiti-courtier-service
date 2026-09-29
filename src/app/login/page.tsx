"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function connexion(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur("");
    const sb = supabaseBrowser();
    // Démo : le nom d'utilisateur est converti en email technique.
    const { error } = await sb.auth.signInWithPassword({
      email: `${identifiant.toLowerCase().replace(/\s/g, "")}@hcs.local`,
      password: motDePasse,
    });
    setChargement(false);
    if (error) setErreur("Identifiants incorrects ou compte désactivé.");
    else { router.push("/dashboard"); router.refresh(); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark px-4">
      <form onSubmit={connexion} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-brand mb-1">Haiti Courtier Service</h1>
        <p className="text-gray-500 mb-6">Connectez-vous à votre compte</p>
        {erreur && <p className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{erreur}</p>}
        <label className="block text-sm font-medium mb-1">Nom d'utilisateur</label>
        <input className="w-full border rounded-lg p-2.5 mb-4" value={identifiant}
               onChange={e => setIdentifiant(e.target.value)} required autoComplete="username" />
        <label className="block text-sm font-medium mb-1">Mot de passe</label>
        <input type="password" className="w-full border rounded-lg p-2.5 mb-6"
               value={motDePasse} onChange={e => setMotDePasse(e.target.value)}
               required autoComplete="current-password" />
        <button disabled={chargement}
          className="w-full bg-brand text-white rounded-lg py-2.5 font-medium hover:bg-brand-dark transition disabled:opacity-60">
          {chargement ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
