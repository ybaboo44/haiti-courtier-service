"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { creerTypeBadge, basculerTypeBadge, attribuerBadge, retirerBadge } from "@/app/actions/recompenses";

type TypeBadge = { id: string; nom: string; description: string | null; icone: string; couleur: string; actif: boolean };
type Emp = { id: string; prenom: string; nom: string };
type Attribution = { id: string; date_attribution: string; note: string | null;
  employes: { id: string; prenom: string; nom: string } | null;
  type_badges: { nom: string; icone: string; couleur: string } | null };

const champ = "w-full border rounded-lg p-2 text-sm";
const label = "block text-xs font-medium text-gray-500 mb-1";

export default function GestionDistinctions({ types, employes, attributions }:
  { types: TypeBadge[]; employes: Emp[]; attributions: Attribution[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [chargement, setChargement] = useState(false);

  async function action(fn: () => Promise<any>, okMsg: string) {
    setChargement(true);
    setMsg("");
    const r = await fn();
    setChargement(false);
    setMsg(r?.erreur ? "❌ " + r.erreur : "✅ " + okMsg);
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Catalogue */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-3">🏅 Catalogue des badges</h2>
        <form onSubmit={e => { e.preventDefault(); action(() => creerTypeBadge(new FormData(e.currentTarget)), "Badge créé"); e.currentTarget.reset(); }}
          className="grid grid-cols-2 gap-3 mb-4">
          <div className="col-span-2">
            <label className={label}>Nom *</label>
            <input name="nom" required className={champ} placeholder="Ex : Employé du mois" />
          </div>
          <div className="col-span-2">
            <label className={label}>Description</label>
            <input name="description" className={champ} />
          </div>
          <div>
            <label className={label}>Icône (emoji)</label>
            <input name="icone" className={champ} defaultValue="🏅" maxLength={4} />
          </div>
          <div>
            <label className={label}>Couleur</label>
            <input type="color" name="couleur" defaultValue="#0E5FA8" className="w-full h-9 border rounded-lg" />
          </div>
          <button disabled={chargement}
            className="col-span-2 bg-brand text-white py-2 rounded-lg text-sm hover:bg-brand-dark disabled:opacity-60">
            Ajouter au catalogue
          </button>
        </form>
        <ul className="divide-y">
          {types.map(t => (
            <li key={t.id} className="py-2 flex items-center gap-3">
              <span className="text-xl" style={{ color: t.couleur }}>{t.icone}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${t.actif ? "" : "line-through text-gray-400"}`}>{t.nom}</p>
                {t.description && <p className="text-xs text-gray-400 truncate">{t.description}</p>}
              </div>
              <button onClick={() => action(() => basculerTypeBadge(t.id, !t.actif), "Statut mis à jour")}
                disabled={chargement}
                className={`px-2.5 py-1 rounded-lg text-xs disabled:opacity-50
                  ${t.actif ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-emerald-50 text-emerald-600"}`}>
                {t.actif ? "Désactiver" : "Activer"}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Attribution */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-3">🎁 Attribuer un badge</h2>
        <form onSubmit={e => { e.preventDefault(); action(() => attribuerBadge(new FormData(e.currentTarget)), "Badge attribué"); e.currentTarget.reset(); }}
          className="space-y-3 mb-5">
          <div>
            <label className={label}>Employé *</label>
            <select name="employe_id" required className={champ}>
              <option value="">—</option>
              {employes.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Badge *</label>
            <select name="type_badge_id" required className={champ}>
              <option value="">—</option>
              {types.filter(t => t.actif).map(t => (
                <option key={t.id} value={t.id}>{t.icone} {t.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Note (raison)</label>
            <input name="note" className={champ} placeholder="Ex : 3 clients satisfaits cette semaine" />
          </div>
          <button disabled={chargement}
            className="w-full bg-brand text-white py-2 rounded-lg text-sm hover:bg-brand-dark disabled:opacity-60">
            Attribuer
          </button>
        </form>
        {msg && <p className="text-sm mb-3">{msg}</p>}
        <h3 className="text-sm font-medium text-gray-600 mb-2">Attributions récentes</h3>
        <ul className="divide-y max-h-72 overflow-y-auto">
          {attributions.map(a => (
            <li key={a.id} className="py-2 flex items-center gap-3 text-sm">
              <span className="text-lg">{a.type_badges?.icone}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{a.employes?.prenom} {a.employes?.nom}
                  <span className="text-gray-400 font-normal"> ← {a.type_badges?.nom}</span></p>
                <p className="text-xs text-gray-400">{a.date_attribution}{a.note && ` · ${a.note}`}</p>
              </div>
              <button onClick={() => { if (confirm("Retirer ce badge ?")) action(() => retirerBadge(a.id), "Badge retiré"); }}
                className="text-xs text-red-500 hover:underline shrink-0">Retirer</button>
            </li>
          ))}
          {!attributions.length && <li className="py-2 text-gray-400 text-sm">Aucune attribution.</li>}
        </ul>
      </div>
    </div>
  );
}
