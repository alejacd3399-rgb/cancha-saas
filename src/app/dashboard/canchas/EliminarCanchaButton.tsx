"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EliminarCanchaButton({ canchaId }: { canchaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmar, setConfirmar] = useState(false);

  async function handleDelete() {
    setLoading(true);

    const res = await fetch(`/api/dashboard/canchas/${canchaId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    }

    setLoading(false);
    setConfirmar(false);
  }

  if (confirmar) {
    return (
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => setConfirmar(false)}
          className="flex-1 border border-gray-300 text-gray-600 py-1.5 rounded-lg text-xs hover:bg-gray-50"
        >
          No, cancelar
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 bg-red-600 text-white py-1.5 rounded-lg text-xs hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Eliminando..." : "Sí, eliminar"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirmar(true)}
      className="mt-2 w-full text-red-400 hover:text-red-600 text-xs"
    >
      🗑️ Eliminar cancha
    </button>
  );
}