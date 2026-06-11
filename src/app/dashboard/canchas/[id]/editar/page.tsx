"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditarCanchaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cancha, setCancha] = useState({
    name: "",
    field_type: "futbol5",
    surface: "synthetic",
    price_per_hour: "",
    is_active: true,
  });

  useEffect(() => {
    if (!id) return;
   
    fetch(`/api/dashboard/canchas/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCancha({
          name: data.name,
          field_type: data.field_type,
          surface: data.surface,
          price_per_hour: data.price_per_hour,
          is_active: data.is_active,
        });
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/dashboard/canchas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cancha),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.message || "Error al guardar");
      setSaving(false);
      return;
    }

    router.push("/dashboard/canchas");
  }

  if (loading) return <p className="text-gray-500 p-8">Cargando...</p>;

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Cancha</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            value={cancha.name}
            onChange={(e) => setCancha({ ...cancha, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={cancha.field_type}
            onChange={(e) => setCancha({ ...cancha, field_type: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            <option value="futbol5">Fútbol 5</option>
            <option value="futbol7">Fútbol 7</option>
            <option value="futbol11">Fútbol 11</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Superficie</label>
          <select
            value={cancha.surface}
            onChange={(e) => setCancha({ ...cancha, surface: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            <option value="synthetic">Sintética</option>
            <option value="natural">Natural</option>
            <option value="hybrid">Híbrida</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio por hora</label>
          <input
            type="number"
            value={cancha.price_per_hour}
            onChange={(e) => setCancha({ ...cancha, price_per_hour: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={cancha.is_active}
            onChange={(e) => setCancha({ ...cancha, is_active: e.target.checked })}
            className="w-4 h-4 accent-green-600"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Cancha activa
          </label>
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
            disabled={saving}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}