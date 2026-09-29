"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LienSatisfactionButton({ prestationId }:
  { prestationId: string }) {
  const [lien, setLien] = useState("");
  const [chargement, setChargement] = useState(false);

  async function generer() {
    setChargement(true);
    const sb = supabaseBrowser();
    const { data, error } = await sb.from("liens_satisfaction")
      .insert({ prestation_id: prestationId })
      .select("token").single();
    if (!error && data) {
      setLien(`${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/satisfaction/${data.token}`);
    }
    setChargement(false);
  }

  const whatsapp = lien ? `https://wa.me/?text=${encodeURIComponent(
    "Bonjour ! Pourriez-vous évaluer votre récente prestation ? " + lien)}` : "";

  return (
    <span className="flex items-center gap-2">
      {!lien ? (
        <button onClick={generer} disabled={chargement}
          className="text-xs bg-brand-light text-brand px-3 py-1.5 rounded-lg hover:bg-brand hover:text-white transition disabled:opacity-60">
          {chargement ? "..." : "Générer lien"}
        </button>
      ) : (
        <>
          <input readOnly value={lien} className="text-xs border rounded px-2 py-1 w-56"
            onFocus={e => e.target.select()} />
          <a href={whatsapp} target="_blank" rel="noreferrer"
            className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600">
            WhatsApp
          </a>
          <a href={`mailto:?subject=Évaluation de votre prestation&body=${encodeURIComponent(lien)}`}
            className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300">
            E-mail
          </a>
        </>
      )}
    </span>
  );
}
