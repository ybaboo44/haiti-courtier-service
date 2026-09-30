"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { lienWhatsApp } from "@/lib/utils";

type PrestationRow = {
  id: string; description: string; date_prestation: string;
  clients: { nom: string; telephone: string | null } | null;
};

export default function SondageEnvoi({ prestations }: { prestations: PrestationRow[] }) {
  const [liens, setLiens] = useState<Record<string, string>>({});
  const [chargement, setChargement] = useState<string | null>(null);
  const [copie, setCopie] = useState<string | null>(null);

  async function generer(prestation: PrestationRow) {
    setChargement(prestation.id);
    const sb = supabaseBrowser();
    const { data, error } = await sb.from("liens_satisfaction")
      .insert({ prestation_id: prestation.id })
      .select("token").single();
    if (!error && data) {
      const base = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
      const url = `${base}/satisfaction/${data.token}`;
      setLiens(l => ({ ...l, [prestation.id]: url }));
    }
    setChargement(null);
  }

  async function copier(prestationId: string, url: string) {
    await navigator.clipboard.writeText(url);
    setCopie(prestationId);
    setTimeout(() => setCopie(null), 2000);
  }

  return (
    <div className="space-y-3">
      {prestations.map(p => {
        const url = liens[p.id];
        const client = p.clients;
        const message = `Bonjour ${client?.nom ?? ""} !\n\nMerci d'avoir fait confiance à Haiti Courtier Service. Pourriez-vous prendre 2 minutes pour évaluer votre prestation « ${p.description} » ?\n\n${url ?? ""}`;
        const wa = url ? lienWhatsApp(client?.telephone, message) : null;
        return (
          <div key={p.id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-semibold">{p.description}</p>
                <p className="text-sm text-gray-500">
                  {client?.nom} · {p.date_prestation} · 📞 {client?.telephone ?? "non renseigné"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!url ? (
                  <button onClick={() => generer(p)} disabled={chargement === p.id}
                    className="bg-brand text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-dark disabled:opacity-60">
                    {chargement === p.id ? "..." : "1️⃣ Générer le lien"}
                  </button>
                ) : (
                  <>
                    <button onClick={() => copier(p.id, url)}
                      className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
                      {copie === p.id ? "✓ Copié !" : "Copier"}
                    </button>
                    {wa ? (
                      <a href={wa} target="_blank" rel="noreferrer"
                        className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600">
                        2️⃣ Envoyer WhatsApp
                      </a>
                    ) : (
                      <span className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                        ⚠️ Téléphone invalide — utilisez « Copier »
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            {url && (
              <input readOnly value={url} onFocus={e => e.target.select()}
                className="mt-3 w-full text-xs border rounded-lg px-3 py-2 bg-gray-50 font-mono" />
            )}
          </div>
        );
      })}
      {!prestations.length && <p className="text-gray-400">Aucune prestation enregistrée.</p>}
    </div>
  );
}
