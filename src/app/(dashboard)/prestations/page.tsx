import { supabaseServer } from "@/lib/supabase/server";
import { getSessionUtilisateur } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ActionsPrestation from "@/components/ActionsPrestation";

export default async function PrestationsPage({ searchParams }: { searchParams: { statut?: string } }) {
  const session = await getSessionUtilisateur();
  if (!session?.peut("affectations.manage")) redirect("/dashboard");
  const peutModifier = session.estAdmin || session.peut("affectations.manage");

  const sb = supabaseServer();
  let requete = sb.from("prestations")
    .select("*, affectations(employes(prenom, nom), clients(nom))")
    .order("date_prestation", { ascending: false });
  if (searchParams.statut) requete = requete.eq("statut", searchParams.statut);
  const { data: prestations } = await requete;

  const filtres = [
    { code: "", label: "Toutes" }, { code: "planifiee", label: "Planifiées" },
    { code: "en_cours", label: "En cours" }, { code: "terminee", label: "Terminées" },
    { code: "annulee", label: "Annulées" },
  ];

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Prestations</h1>
        <Link href="/prestations/nouvelle"
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-dark">
          + Nouvelle prestation
        </Link>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {filtres.map(f => (
          <Link key={f.code} href={f.code ? `/prestations?statut=${f.code}` : "/prestations"}
            className={`px-3 py-1.5 rounded-full text-xs border transition
              ${searchParams.statut === f.code || (!searchParams.statut && !f.code)
                ? "bg-brand text-white border-brand" : "bg-white text-gray-600 hover:border-brand"}`}>
            {f.label}
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Prestation</th>
              <th className="text-left p-3">Client</th>
              <th className="text-left p-3">Employé</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Coût</th>
              <th className="text-left p-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {(prestations ?? []).map((p: any) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{p.description}</td>
                <td className="p-3">{p.affectations?.clients?.nom}</td>
                <td className="p-3">{p.affectations?.employes?.prenom} {p.affectations?.employes?.nom}</td>
                <td className="p-3 whitespace-nowrap">{p.date_prestation}</td>
                <td className="p-3">{p.cout ? `${p.cout} HTG` : "—"}</td>
                <td className="p-3"><ActionsPrestation prestationId={p.id} statutActuel={p.statut} peutModifier={peutModifier} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!prestations?.length && <p className="p-6 text-center text-gray-400 text-sm">Aucune prestation.</p>}
      </div>
    </div>
  );
}
