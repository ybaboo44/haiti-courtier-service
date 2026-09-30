"use client";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { creerBadge } from "@/app/actions/badges";

type Emp = { id: string; prenom: string; nom: string; poste: string };

export default function BadgeGenerator({ employes }: { employes: Emp[] }) {
  const [employeId, setEmployeId] = useState("");
  const [resultat, setResultat] = useState<{ numero: string; url: string } | null>(null);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function generer() {
    if (!employeId) return;
    setChargement(true);
    setErreur("");
    const r = await creerBadge(employeId);
    setChargement(false);
    if (r.erreur) { setErreur(r.erreur); return; }
    if (r.badge) {
      setResultat({
        numero: r.badge.numero_badge,
        url: `${window.location.origin}/verification/${r.badge.numero_badge}`,
      });
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
      <h2 className="font-semibold text-gray-800 mb-3">🪪 Générer un nouveau badge</h2>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-56">
          <label className="block text-xs font-medium text-gray-500 mb-1">Employé</label>
          <select value={employeId} onChange={e => setEmployeId(e.target.value)}
            className="w-full border rounded-lg p-2.5 text-sm">
            <option value="">— Choisir un employé —</option>
            {employes.map(e => (
              <option key={e.id} value={e.id}>{e.prenom} {e.nom} · {e.poste}</option>
            ))}
          </select>
        </div>
        <button onClick={generer} disabled={!employeId || chargement}
          className="bg-brand text-white px-5 py-2.5 rounded-lg text-sm hover:bg-brand-dark disabled:opacity-50">
          {chargement ? "..." : "Générer le badge"}
        </button>
      </div>
      {erreur && <p className="text-red-600 text-sm mt-2">{erreur}</p>}
      {resultat && (
        <div className="mt-4 flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="bg-white p-2 rounded-lg border">
            <QRCodeCanvas value={resultat.url} size={90} />
          </div>
          <div>
            <p className="text-emerald-700 font-medium">✅ Badge créé : <span className="font-mono text-sm">{resultat.numero}</span></p>
            <p className="text-xs text-emerald-600 mt-1 break-all">{resultat.url}</p>
            <a href={resultat.url} target="_blank" rel="noreferrer"
              className="text-xs text-brand hover:underline mt-1 inline-block">
              Tester la page de vérification →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
