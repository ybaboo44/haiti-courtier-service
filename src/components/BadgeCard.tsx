"use client";
import { QRCodeCanvas } from "qrcode.react";

export default function BadgeCard({ badge }: { badge: any }) {
  const e = badge.employes;
  const urlVerification = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/verification/${badge.numero_badge}`;
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border-t-4 border-brand">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center text-brand font-bold text-lg overflow-hidden shrink-0">
          {e.photo_url
            ? <img src={e.photo_url} alt="" className="w-full h-full object-cover" />
            : `${e.prenom[0]}${e.nom[0]}`}
        </div>
        <div>
          <p className="font-semibold">{e.prenom} {e.nom}</p>
          <p className="text-sm text-gray-500">{e.poste}</p>
          <p className="text-xs font-mono text-gray-400">{e.numero_identifiant}</p>
        </div>
      </div>
      <div className="flex justify-center border rounded-lg p-2">
        <QRCodeCanvas value={urlVerification} size={110} />
      </div>
      <p className="text-xs text-center text-gray-400 mt-2 font-mono">{badge.numero_badge}</p>
    </div>
  );
}
