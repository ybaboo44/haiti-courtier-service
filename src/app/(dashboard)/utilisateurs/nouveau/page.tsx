import { getSessionUtilisateur } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import FormUtilisateur from "@/components/FormUtilisateur";

export default async function NouvelUtilisateurPage() {
  const session = await getSessionUtilisateur();
  if (!session?.estAdmin) redirect("/utilisateurs");

  return (
    <div className="max-w-xl">
      <Link href="/utilisateurs" className="text-sm text-brand hover:underline">← Retour</Link>
      <h1 className="text-2xl font-bold text-gray-800 mt-2 mb-6">Nouvel utilisateur</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <FormUtilisateur />
      </div>
    </div>
  );
}
