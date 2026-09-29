"use client";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function RapportsPage() {
  const [donnees, setDonnees] = useState<any[]>([]);
  const [charge, setCharge] = useState(false);

  async function charger() {
    const sb = supabaseBrowser();
    const { data } = await sb.from("formulaires_satisfaction")
      .select("note_globale, date_soumission, liens_satisfaction(prestations(description, date_prestation))");
    setDonnees(data ?? []);
    setCharge(true);
  }

  function lignes() {
    return donnees.map(d => [
      d.date_soumission?.slice(0, 10) ?? "",
      d.liens_satisfaction?.prestations?.description ?? "",
      String(d.note_globale ?? ""),
    ]);
  }

  function exportCSV() {
    const ws = XLSX.utils.json_to_sheet(donnees);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "rapport_satisfaction.csv";
    a.click();
  }

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(donnees);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Satisfaction");
    XLSX.writeFile(wb, "rapport_satisfaction.xlsx");
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.setFontSize(15);
    doc.text("Rapport de satisfaction — Haiti Courtier Service", 14, 16);
    autoTable(doc, {
      startY: 24,
      head: [["Date", "Prestation", "Note globale"]],
      body: lignes(),
    });
    doc.save("rapport_satisfaction.pdf");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Rapports</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={charger}
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-dark">
          Charger les données
        </button>
        {charge && <>
          <button onClick={exportCSV} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Export CSV</button>
          <button onClick={exportExcel} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Export Excel</button>
          <button onClick={exportPDF} className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Export PDF</button>
        </>}
      </div>
      {charge && (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr><th className="text-left p-3">Date</th><th className="text-left p-3">Prestation</th><th className="text-left p-3">Note</th></tr>
            </thead>
            <tbody>
              {lignes().map((l, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">{l[0]}</td><td className="p-3">{l[1]}</td><td className="p-3 font-medium">{l[2]}/5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
