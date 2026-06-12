"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditarHorarioForm({
  reservaId,
  fechaActual,
  inicioActual,
  finActual,
}: {
  reservaId: string;
  fechaActual: string;
  inicioActual: string;
  finActual: string;
}) {
  const router = useRouter();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      reservation_date: (form.elements.namedItem("reservation_date") as HTMLInputElement).value,
      start_time: (form.elements.namedItem("start_time") as HTMLInputElement).value,
      end_time: (form.elements.namedItem("end_time") as HTMLInputElement).value,
    };

    const res = await fetch(`/api/dashboard/reservas/${reservaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.message || "Error al actualizar");
      setLoading(false);
      return;
    }

    router.refresh();
    setMostrarForm(false);
    setLoading(false);
  }

  if (!mostrarForm) {
    return (
      <button
        onClick={() => setMostrarForm(true)}
        className="text-green-600 hover:text-green-700 text-sm font-medium"
      >
        ✏️ Editar fecha/horario
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
      <p className="text-sm font-medium text-green-700">
        Editar fecha y horario
      </p>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Fecha</label>
          <input
            name="reservation_date"
            type="date"
            defaultValue={fechaActual}
            className="w-full border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Inicio</label>
          <input
            name="start_time"
            type="time"
            defaultValue={inicioActual}
            className="w-full border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Fin</label>
          <input
            name="end_time"
            type="time"
            defaultValue={finActual}
            className="w-full border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-xs">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMostrarForm(false)}
          className="flex-1 border border-gray-300 text-gray-600 py-1.5 rounded-lg text-sm hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}