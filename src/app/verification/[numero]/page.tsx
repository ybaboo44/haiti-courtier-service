import { supabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function VerificationPage({ params }: { params: { numero: string } }) {
  const sb = supabaseServer();
  const { data: badge } = await sb.from("badges")
    .select("numero_badge, date_emission, date_expiration, actif, employes(prenom, nom, poste, photo_url)")
    .eq("numero_badge", params.numero).single();
  if (!badge) notFound();
  const e = (badge as any).employes;
  const valide = badge.actif && (!badge.date_expiration || new Date(badge.date_expiration) >= new Date());

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${valide ? "bg-emerald-100" : "bg-red-100"}`}>
          <span className="text-3xl">{valide ? "✓" : "✕"}</span>
        </div>
        <h1 className={`font-bold text-lg mb-1 ${valide ? "text-emerald-600" : "text-red-600"}`}>
          {valide ? "Badge authentifié" : "Badge invalide ou expiré"}
        </h1>
        {e && (
          <div className="mt-4 text-left bg-gray-50 rounded-xl p-4">
            <p className="font-semibold">{e.prenom} {e.nom}</p>
            <p className="text-sm text-gray-500">{e.poste}</p>
            <p className="text-xs font-mono text-gray-400 mt-1">{badge.numero_badge}</p>
            <p className="text-xs text-gray-400">Émis le {badge.date_emission}</p>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-4">Haiti Courtier Service — vérification officielle</p>
      </div>
    </div>
  );
}
