export default function StatCard({ titre, valeur, icon, couleur }:
  { titre: string; valeur: string | number; icon: React.ReactNode; couleur: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div className={`${couleur} text-white p-3 rounded-xl`}>{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{titre}</p>
        <p className="text-2xl font-bold text-gray-800">{valeur}</p>
      </div>
    </div>
  );
}
