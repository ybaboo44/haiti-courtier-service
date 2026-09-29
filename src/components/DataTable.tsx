"use client";
export default function DataTable({ colonnes, lignes }:
  { colonnes: string[]; lignes: React.ReactNode[][] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>{colonnes.map(c => <th key={c} className="text-left p-3">{c}</th>)}</tr>
        </thead>
        <tbody>
          {lignes.map((l, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              {l.map((cell, j) => <td key={j} className="p-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
