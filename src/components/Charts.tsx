"use client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const axes = { fontSize: 11, fill: "#6B7280" };
const grid = { strokeDasharray: "3 3", stroke: "#E5E7EB" };

export function PrestationsChart({ data }: { data: { name: string; prestations: number }[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 h-72">
      <h3 className="font-semibold text-gray-800 mb-3">Évolution des prestations</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid {...grid} vertical={false} />
          <XAxis dataKey="name" tick={axes} />
          <YAxis tick={axes} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="prestations" name="Prestations" fill="#0E5FA8" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SatisfactionChart({ data }: { data: { name: string; note: number; reponses: number }[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 h-72">
      <h3 className="font-semibold text-gray-800 mb-3">Satisfaction client (note / 5)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid {...grid} vertical={false} />
          <XAxis dataKey="name" tick={axes} />
          <YAxis tick={axes} domain={[0, 5]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="note" name="Note moyenne" stroke="#E8A020" strokeWidth={2.5}
            dot={{ r: 4 }} />
          <Line type="monotone" dataKey="reponses" name="Réponses" stroke="#0E5FA8"
            strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SondagesChart({ data }: { data: { name: string; envoyes: number; reponses: number }[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 h-72">
      <h3 className="font-semibold text-gray-800 mb-3">Sondages envoyés vs réponses</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid {...grid} vertical={false} />
          <XAxis dataKey="name" tick={axes} />
          <YAxis tick={axes} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="envoyes" name="Envoyés" fill="#0E5FA8" radius={[6, 6, 0, 0]} />
          <Bar dataKey="reponses" name="Réponses" fill="#059669" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
