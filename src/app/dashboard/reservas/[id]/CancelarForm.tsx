"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelarForm({ reservaId }: { reservaId: string }) {
  const router = useRouter();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCancelar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/dashboard/reservas/${reservaId}/cancelar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cancellation_reason: motivo }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.message || "Error al cancelar");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  if (!mostrarForm) {
    return (
      <button
        onClick={() => setMostrarForm(true)}
        className="text-red-500 hover:text-red-700 text-sm font-medium"
      >
        ✕ Cancelar esta reserva
      </button>
    );
  }

  return (
    <form onSubmit={handleCancelar} className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
      <p className="text-sm font-medium text-red-700">
        ¿Por qué se cancela esta reserva?
      </p>
      <textarea
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
        placeholder="Ej: El cliente no llegó, cambio de horario solicitado..."
        rows={2}
        required
      />
      {error && <p className="text-red-600 text-xs">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMostrarForm(false)}
          className="flex-1 border border-gray-300 text-gray-600 py-1.5 rounded-lg text-sm hover:bg-gray-50"
        >
          Volver
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-red-600 text-white py-1.5 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Cancelando..." : "Confirmar cancelación"}
        </button>
      </div>
    </form>
  );
}