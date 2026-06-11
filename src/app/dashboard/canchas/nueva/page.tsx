"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevaCanchaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      field_type: (form.elements.namedItem("field_type") as HTMLSelectElement).value,
      surface: (form.elements.namedItem("surface") as HTMLSelectElement).value,
      price_per_hour: (form.elements.namedItem("price_per_hour") as HTMLInputElement).value,
    };

    const res = await fetch("/api/dashboard/canchas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.message || "Error al crear la cancha");
      setLoading(false);
      return;
    }

    router.push("/dashboard/canchas");
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nueva Cancha</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la cancha
          </label>
          <input
            name="name"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Cancha 1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de cancha
          </label>
          <select
            name="field_type"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          >
            <option value="futbol5">Fútbol 5</option>
            <option value="futbol7">Fútbol 7</option>
            <option value="futbol11">Fútbol 11</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Superficie
          </label>
          <select
            name="surface"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            <option value="synthetic">Sintética</option>
            <option value="natural">Natural</option>
            <option value="hybrid">Híbrida</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio por hora
          </label>
          <input
            name="price_per_hour"
            type="number"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="80000"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard/canchas")}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Crear cancha"}
          </button>
        </div>
      </form>
    </div>
  );
}