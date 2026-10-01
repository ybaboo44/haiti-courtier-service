"use client";
import { useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";

const onglets = ["Informations", "Affectations & Prestations", "Badges & Distinctions", "Retours"] as const;
type Onglet = typeof onglets[number];

export default function ProfilEmploye({ emp, affectations, badgesPhysiques, distinctions, retours }:
  { emp: any; affectations: any[]; badgesPhysiques: any[]; distinctions: any[]; retours: any[] }) {
  const [onglet, setOnglet] = useState<Onglet>("Informations");

  return (
    <div>
      {/* Header profil */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center text-brand font-bold text-2xl overflow-hidden shrink-0">
            {emp.photo_url
              ? <img src={emp.photo_url} alt="" className="w-full h-full object-cover" />
              : `${emp.prenom[0]}${emp.nom[0]}`}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">{emp.prenom} {emp.nom}</h1>
            <p className="text-gray-500">{emp.poste}
              {emp.departement && <> · {emp.departement}</>} · <span className="font-mono text-xs">{emp.numero_identifiant}</span>
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`px-2.5 py-1 rounded-full text-xs ${emp.actif ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                {emp.actif ? "Actif" : "Inactif"}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs ${emp.disponible ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                {emp.disponible ? "Disponible" : "Indisponible"}
              </span>
              {distinctions.slice(0, 3).map((d: any) => (
                <span key={d.id} className="px-2.5 py-1 rounded-full text-xs bg-amber-50 text-amber-700"
                  title={d.type_badges?.nom}>
                  {d.type_badges?.icone} {d.type_badges?.nom}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-1 mt-5 border-b overflow-x-auto">
          {onglets.map(o => (
            <button key={o} onClick={() => setOnglet(o)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition
                ${onglet === o ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {o}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      {onglet === "Informations" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ["Téléphone", emp.telephone], ["E-mail", emp.email],
            ["Adresse", emp.adresse], ["Date de naissance", emp.date_naissance],
            ["Date d'embauche", emp.date_embauche], ["Département", emp.departement],
          ].map(([k, v]) => (
            <div key={k as string} className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-gray-500 text-xs mb-1">{k}</p>
              <p className="font-medium text-sm break-all">{v ?? "—"}</p>
            </div>
          ))}
          {emp.notes && (
            <div className="bg-white rounded-xl shadow-sm p-4 sm:col-span-2">
              <p className="text-gray-500 text-xs mb-1">Notes internes</p>
              <p className="text-sm text-gray-700">{emp.notes}</p>
            </div>
          )}
        </div>
      )}

      {onglet === "Affectations & Prestations" && (
        <div className="space-y-3">
          {affectations.map((a: any) => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-medium">🏢 {a.clients?.nom}
                  {a.responsable && <span className="text-xs text-brand ml-1">(responsable)</span>}
                </p>
                <p className="text-gray-500 text-xs">{a.date_debut} → {a.date_fin ?? "en cours"}</p>
              </div>
              {(a.prestations ?? []).map((p: any) => (
                <p key={p.id} className="text-xs text-gray-500 mt-1.5">
                  🔧 {p.description} · {p.date_prestation} · <span className="capitalize">{p.statut}</span>
                </p>
              ))}
            </div>
          ))}
          {!affectations.length && <p className="text-gray-400 text-sm">Aucune affectation.</p>}
        </div>
      )}

      {onglet === "Badges & Distinctions" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3">🪪 Badges d'identification</h3>
            {badgesPhysiques.map((b: any) => (
              <div key={b.id} className="flex items-center gap-3 border rounded-lg p-3 mb-2">
                <div className="bg-white border rounded p-1">
                  <QRCodeCanvas value={`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/verification/${b.numero_badge}`} size={56} />
                </div>
                <div>
                  <p className="font-mono text-xs">{b.numero_badge}</p>
                  <p className="text-xs text-gray-500">émis le {b.date_emission} · {b.actif ? "actif" : "inactif"}</p>
                </div>
              </div>
            ))}
            {!badgesPhysiques.length && <p className="text-gray-400 text-sm">Aucun badge.</p>}
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3">🏅 Distinctions</h3>
            {distinctions.map((d: any) => (
              <div key={d.id} className="flex items-center gap-3 border-b py-2.5 text-sm">
                <span className="text-2xl">{d.type_badges?.icone}</span>
                <div>
                  <p className="font-medium">{d.type_badges?.nom}</p>
                  <p className="text-xs text-gray-400">
                    {d.date_attribution}{d.note && ` · ${d.note}`}
                  </p>
                </div>
              </div>
            ))}
            {!distinctions.length && <p className="text-gray-400 text-sm">Aucune distinction.</p>}
          </div>
        </div>
      )}

      {onglet === "Retours" && (
        <div className="space-y-3">
          {retours.map((r: any) => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm p-4 text-sm">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 capitalize">{r.type_retour}</span>
                <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString("fr-FR")}
                  {(r.clients?.nom || r.prestations?.description) && ` · ${r.clients?.nom ?? ""} ${r.prestations?.description ?? ""}`}</span>
              </div>
              <p className="text-gray-700">{r.contenu}</p>
            </div>
          ))}
          {!retours.length && <p className="text-gray-400 text-sm">Aucun retour lié à cet employé.</p>}
        </div>
      )}
    </div>
  );
}
