"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function HorarioForm({ canchaId }: { canchaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      field_id: canchaId,
      day_of_week: parseInt((form.elements.namedItem("day_of_week") as HTMLSelectElement).value),
      open_time: (form.elements.namedItem("open_time") as HTMLInputElement).value,
      close_time: (form.elements.namedItem("close_time") as HTMLInputElement).value,
      slot_duration_minutes: parseInt((form.elements.namedItem("slot_duration_minutes") as HTMLSelectElement).value),
    };

    const res = await fetch("/api/dashboard/horarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.message || "Error al guardar horario");
      setLoading(false);
      return;
    }

    router.refresh();
    form.reset();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Día</label>
          <select
            name="day_of_week"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            {DIAS.map((dia, i) => (
              <option key={i} value={i}>{dia}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duración de cada franja
          </label>
          <select
            name="slot_duration_minutes"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            <option value="60">1 hora</option>
            <option value="90">1.5 horas</option>
            <option value="120">2 horas</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora apertura</label>
          <input
            name="open_time"
            type="time"
            defaultValue="08:00"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora cierre</label>
          <input
            name="close_time"
            type="time"
            defaultValue="22:00"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Agregar horario"}
      </button>
    </form>
  );
}