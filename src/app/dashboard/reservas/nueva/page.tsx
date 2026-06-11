"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NuevaReservaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canchas, setCanchas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/canchas")
      .then((r) => r.json())
      .then(setCanchas);
    fetch("/api/dashboard/clientes")
      .then((r) => r.json())
      .then(setClientes);
  }, []);

  const clientesFiltrados = clientes.filter((c) =>
    c.full_name.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.phone.includes(busqueda)
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      customer_id: (form.elements.namedItem("customer_id") as HTMLSelectElement).value,
      field_id: (form.elements.namedItem("field_id") as HTMLSelectElement).value,
      reservation_date: (form.elements.namedItem("reservation_date") as HTMLInputElement).value,
      start_time: (form.elements.namedItem("start_time") as HTMLInputElement).value,
      end_time: (form.elements.namedItem("end_time") as HTMLInputElement).value,
      notes: (form.elements.namedItem("notes") as HTMLTextAreaElement).value,
    };

    const res = await fetch("/api/dashboard/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.message || "Error al crear reserva");
      setLoading(false);
      return;
    }

    router.push("/dashboard/reservas");
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nueva Reserva</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">

        {/* Buscar cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar cliente
          </label>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Nombre o teléfono..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente
          </label>
          <select
            name="customer_id"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          >
            <option value="">Selecciona un cliente</option>
            {clientesFiltrados.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} — {c.phone}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cancha
          </label>
          <select
            name="field_id"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          >
            <option value="">Selecciona una cancha</option>
            {canchas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — ${Number(c.price_per_hour).toLocaleString("es-CO")}/hora
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <input
            name="reservation_date"
            type="date"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora inicio
            </label>
            <input
              name="start_time"
              type="time"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora fin
            </label>
            <input
              name="end_time"
              type="time"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            name="notes"
            rows={2}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Observaciones..."
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard/reservas")}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Crear reserva"}
          </button>
        </div>
      </form>
    </div>
  );
}