"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EliminarClienteButton({
  clienteId,
  tieneReservas,
}: {
  clienteId: string;
  tieneReservas: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/dashboard/clientes/${clienteId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.message);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
    setConfirmar(false);
  }

  if (tieneReservas) {
    return (
      <span className="text-gray-300 text-xs" title="No se puede eliminar: tiene reservas">
        🗑️
      </span>
    );
  }

  if (confirmar) {
    return (
      <div className="flex gap-1 items-center">
        <button
          onClick={() => setConfirmar(false)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Cancelar
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-red-600 hover:text-red-800 font-medium"
        >
          {loading ? "..." : "Confirmar"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirmar(true)}
      className="text-red-400 hover:text-red-600 text-xs"
      title="Eliminar cliente"
    >
      🗑️
    </button>
  );
}